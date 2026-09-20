import re
import shlex
from datetime import datetime

class VirtualFileSystem:
    def __init__(self, files=None):
        self.fs = {}
        self.cwd = "/"
        if files:
            for path, content in files.items():
                self.write_file(path, content)

    def _resolve(self, path):
        if not path:
            return self.cwd
        if not path.startswith('/'):
            path = self.cwd.rstrip('/') + '/' + path
        # Normalize
        parts = []
        for p in path.split('/'):
            if p == '' or p == '.':
                continue
            elif p == '..':
                if parts:
                    parts.pop()
            else:
                parts.append(p)
        return '/' + '/'.join(parts)

    def read_file(self, path):
        abs_path = self._resolve(path)
        if abs_path in self.fs and self.fs[abs_path].get('type') == 'file':
            return self.fs[abs_path]['content']
        return None

    def write_file(self, path, content, append=False):
        abs_path = self._resolve(path)
        if append and abs_path in self.fs:
            self.fs[abs_path]['content'] += content
        else:
            self.fs[abs_path] = {'type': 'file', 'content': content}
        
        # Ensure parent dirs exist
        parts = abs_path.strip('/').split('/')
        for i in range(len(parts) - 1):
            parent = '/' + '/'.join(parts[:i+1])
            if parent not in self.fs:
                self.fs[parent] = {'type': 'dir'}

    def mkdir(self, path):
        abs_path = self._resolve(path)
        self.fs[abs_path] = {'type': 'dir'}

    def ls(self, path="", show_hidden=False):
        abs_path = self._resolve(path)
        if abs_path in self.fs and self.fs[abs_path]['type'] == 'file':
            name = abs_path.split('/')[-1]
            if not show_hidden and name.startswith('.'):
                return ""
            return name
            
        results = []
        prefix = abs_path.rstrip('/') + '/' if abs_path != '/' else '/'
        for p in self.fs:
            if p.startswith(prefix) and p != prefix:
                rel = p[len(prefix):]
                if '/' not in rel:
                    if not show_hidden and rel.startswith('.'):
                        continue
                    results.append(rel)
        return "\n".join(sorted(results)) if results else ""

    def rm(self, path):
        abs_path = self._resolve(path)
        if abs_path in self.fs:
            del self.fs[abs_path]
            return True
        return False


class VirtualShell:
    def __init__(self, state, supported_commands=None, custom_commands=None, user_id=None):
        self.state = state
        self.supported = supported_commands or []
        self.custom = custom_commands or {}
        self.user_id = user_id
        
        if self.user_id:
            if "user_states" not in self.state:
                self.state["user_states"] = {}
            if self.user_id not in self.state["user_states"]:
                self.state["user_states"][self.user_id] = {
                    "cwd": self.state.get("cwd", "/"),
                    "cmd_history": []
                }
            self.user_state = self.state["user_states"][self.user_id]
        else:
            self.user_state = self.state
        
        # Initialize VFS from state
        if 'vfs' not in self.state:
            self.state['vfs'] = {}
        
        self.vfs = VirtualFileSystem()
        self.vfs.fs = self.state['vfs']
        self.vfs.cwd = self.user_state.get('cwd', '/')

    def _sync_state(self):
        self.state['vfs'] = self.vfs.fs
        self.user_state['cwd'] = self.vfs.cwd

    def execute(self, cmd_line):
        try:
            if "cmd_history" not in self.user_state:
                self.user_state["cmd_history"] = []
            if cmd_line and cmd_line.strip():
                self.user_state["cmd_history"].append(cmd_line.strip())

            # Handle pipes
            pipe_cmds = [c.strip() for c in cmd_line.split('|')]
            
            last_output = ""
            success = True
            final_cmd = ""
            
            for i, cmd in enumerate(pipe_cmds):
                final_cmd = cmd.split()[0] if cmd else ""
                
                # Check supported
                if final_cmd and final_cmd not in self.supported and final_cmd not in self.custom and final_cmd != "cd" and final_cmd != "hideflag":
                    return {"command": final_cmd, "success": False, "output": f"{final_cmd}: command not found"}
                
                # Handle redirection in the command
                redirect_out = None
                append = False
                
                if '>>' in cmd:
                    parts = cmd.split('>>')
                    cmd = parts[0].strip()
                    redirect_out = parts[1].strip()
                    append = True
                elif '>' in cmd:
                    parts = cmd.split('>')
                    cmd = parts[0].strip()
                    redirect_out = parts[1].strip()
                
                args = shlex.split(cmd)
                if not args:
                    continue
                    
                prog = args[0]
                opts = args[1:]
                
                out = self._run_single(prog, opts, last_output)
                
                if redirect_out:
                    self.vfs.write_file(redirect_out, out, append)
                    last_output = ""
                else:
                    last_output = out
                    
            self._sync_state()
            return {"command": final_cmd, "success": True, "output": last_output.strip("\n")}
            
        except Exception as e:
            return {"command": "error", "success": False, "output": str(e)}

    def _run_single(self, prog, args, stdin):
        if prog == "pwd":
            return self.vfs.cwd
        elif prog == "cd":
            target = args[0] if args else "/"
            resolved = self.vfs._resolve(target)
            if resolved == "/" or (resolved in self.vfs.fs and self.vfs.fs[resolved].get('type') == 'dir'):
                self.vfs.cwd = resolved
                return ""
            return f"cd: {target}: No such file or directory"
        elif prog == "ls":
            show_hidden = "-a" in args
            target = ""
            for arg in args:
                if not arg.startswith("-"):
                    target = arg
                    break
            return self.vfs.ls(target, show_hidden=show_hidden)
        elif prog == "cat":
            if not args: return stdin
            out = []
            for f in args:
                content = self.vfs.read_file(f)
                if content is not None: out.append(content)
                else: out.append(f"cat: {f}: No such file or directory")
            return "\n".join(out)
        elif prog == "echo":
            return " ".join(args)
        elif prog == "mkdir":
            for d in args: self.vfs.mkdir(d)
            return ""
        elif prog == "touch":
            for f in args: self.vfs.write_file(f, "")
            return ""
        elif prog == "rm":
            for f in args:
                if not self.vfs.rm(f): return f"rm: cannot remove '{f}': No such file or directory"
            return ""
        elif prog == "grep":
            if not args: return ""
            pattern = args[0]
            lines = stdin.split('\n')
            if len(args) > 1:
                lines = []
                for f in args[1:]:
                    c = self.vfs.read_file(f)
                    if c: lines.extend(c.split('\n'))
            return "\n".join([line for line in lines if pattern in line])
        elif prog == "find":
            # simplified find
            return "\n".join([p for p in self.vfs.fs.keys() if self.vfs.fs[p].get('type') == 'file'])
        elif prog == "whoami":
            return "student"
        elif prog == "id":
            return "uid=1000(student) gid=1000(student) groups=1000(student)"
        elif prog == "hideflag":
            if len(args) < 2: return "Usage: hideflag <path> <content>"
            path, content = args[0], " ".join(args[1:])
            self.vfs.write_file(path, content)
            
            if "pvp_flags" not in self.state:
                self.state["pvp_flags"] = {}
            self.state["pvp_flags"][content] = {"path": path, "found": False, "points": 50, "hidden_by": "Blue Team"}
            return f"Flag hidden at {path}"
        elif prog == "history":
            hist = self.user_state.get("cmd_history", [])
            return "\n".join([f"{i+1:4d}  {c}" for i, c in enumerate(hist)])
        elif prog == "clear":
            return "\x1b[2J\x1b[3J\x1b[H"
        else:
            if prog in self.custom:
                return self.custom[prog].get("output", "")
            return f"{prog}: command not found"
