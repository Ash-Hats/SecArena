import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Trash2, UserPlus, TerminalSquare } from 'lucide-react';
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser } from '../../services/admin';
import { getCustomCommands, createCustomCommand, deleteCustomCommand, CustomCommand } from '../../services/customCommands';
import { User, UserRole } from '../../types/auth';



export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]); 
  const [commands, setCommands] = useState<CustomCommand[]>([]);
  
  const [tab, setTab] = useState<'users' | 'commands'>('users'); 
  const [notice, setNotice] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'student' as UserRole });
  const [cmdForm, setCmdForm] = useState({ command_name: '', output: '', description: '', is_real_execution: false });

  const refresh = async () => { 
    setLoading(true); 
    try { 
      const [nextUsers, nextCommands] = await Promise.all([getAdminUsers(), getCustomCommands()]); 
      setUsers(nextUsers); 
      setCommands(nextCommands);
    } catch (error: any) { 
      setNotice(error.message || 'Unable to load administrator data.'); 
    } finally { 
      setLoading(false); 
    } 
  };
  
  useEffect(() => { void refresh(); }, []);
  
  // User Handlers
  const addUser = async (e: React.FormEvent) => { e.preventDefault(); try { await createAdminUser(form); setForm({ username: '', email: '', password: '', role: 'student' }); setNotice('Account created.'); refresh(); } catch (error: any) { setNotice(error.message); } };
  const toggleUser = async (user: User) => { try { await updateAdminUser(user.id, { is_active: !user.is_active }); refresh(); } catch (error: any) { setNotice(error.message); } };
  const editUser = async (user: User) => { const username = window.prompt('Username', user.username); if (!username) return; const email = window.prompt('Email address', user.email); if (!email) return; const role = window.prompt('Role: student or admin', user.role); if (!role || !['student', 'admin'].includes(role)) return setNotice('Role must be student or admin.'); try { await updateAdminUser(user.id, { username, email, role: role as UserRole }); refresh(); } catch (error: any) { setNotice(error.message); } };
  const removeUser = async (user: User) => { if (!window.confirm(`Delete ${user.username}?`)) return; try { await deleteAdminUser(user.id); refresh(); } catch (error: any) { setNotice(error.message); } };
  


  // Command Handlers
  const addCommand = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!cmdForm.command_name) return setNotice('Command name is required.');
    try { 
      await createCustomCommand(cmdForm); 
      setCmdForm({ command_name: '', output: '', description: '', is_real_execution: false }); 
      setNotice('Command created.'); 
      refresh(); 
    } catch (error: any) { 
      setNotice(error.message); 
    } 
  };
  const removeCommand = async (cmd: CustomCommand) => { 
    if (!window.confirm(`Delete custom command '${cmd.command_name}'?`)) return; 
    try { 
      await deleteCustomCommand(cmd.id); 
      refresh(); 
    } catch (error: any) { 
      setNotice(error.message); 
    } 
  };

  return (
    <div className="min-h-screen bg-[#33503C] text-[#FBFADA] p-5 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between gap-4 border-b border-[#FBFADA]/20 pb-5">
          <div>
            <p className="text-xs text-rose-400 font-mono uppercase">Restricted · /admin</p>
            <h1 className="text-3xl font-bold">SecArena Administration</h1>
            <p className="text-sm text-[#FBFADA]/70 mt-1">Manage accounts, lab records, custom commands, and resources.</p>
          </div>
          <ShieldCheck className="w-10 h-10 text-rose-400" />
        </header>
        
        <div className="flex gap-2 border-b border-[#FBFADA]/20">
          {(['users', 'commands'] as const).map((item) => (
            <button 
              key={item} 
              onClick={() => setTab(item)} 
              className={`px-4 py-2 text-xs font-bold uppercase ${tab === item ? 'border-b-2 border-rose-400 text-rose-300' : 'text-[#FBFADA]/70'}`}
            >
              {item}
            </button>
          ))}
        </div>
        
        {notice && (
          <div className="p-3 text-xs rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex justify-between">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)}>×</button>
          </div>
        )}
        
        {loading ? (
          <div className="min-h-[30vh] flex items-center justify-center text-[#FBFADA]/70">
            <Loader2 className="animate-spin mr-2" />Loading protected data…
          </div>
        ) : tab === 'users' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={addUser} className="p-5 h-fit bg-[#8E9F7C] border border-[#FBFADA]/20 rounded-xl space-y-3">
              <h2 className="font-bold flex gap-2"><UserPlus className="w-5 h-5 text-rose-300" />Create account</h2>
              <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full bg-[#33503C] border border-[#FBFADA]/20 rounded p-2 text-[#FBFADA] placeholder:text-[#FBFADA]/50" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-[#33503C] border border-[#FBFADA]/20 rounded p-2 text-[#FBFADA] placeholder:text-[#FBFADA]/50" />
              <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-[#33503C] border border-[#FBFADA]/20 rounded p-2 text-[#FBFADA] placeholder:text-[#FBFADA]/50" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="w-full bg-[#33503C] border border-[#FBFADA]/20 rounded p-2 text-[#FBFADA]">
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
              <button className="w-full py-2 bg-rose-500 text-slate-950 rounded text-xs font-bold">Create account</button>
            </form>
            <div className="lg:col-span-2 bg-[#8E9F7C] border border-[#FBFADA]/20 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[#FBFADA]/70 bg-[#33503C]">
                  <tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-[#FBFADA]/20">
                      <td className="p-3"><b>{user.username}</b><br /><span className="text-[#FBFADA]/50">{user.email}</span></td>
                      <td className="p-3 uppercase">{user.role}</td>
                      <td className="p-3">{user.is_active ? 'Active' : 'Disabled'}</td>
                      <td className="p-3 space-x-2">
                        <button onClick={() => editUser(user)} className="text-purple-300">Edit</button>
                        <button onClick={() => toggleUser(user)} className="text-cyan-300">{user.is_active ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => removeUser(user)} className="text-rose-300"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === 'commands' ? (
          <div className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={addCommand} className="p-5 h-fit bg-[#8E9F7C] border border-[#FBFADA]/20 rounded-xl space-y-4">
              <h2 className="font-bold flex gap-2"><TerminalSquare className="w-5 h-5 text-rose-300" />Create Command</h2>
              
              <div>
                <label className="block text-xs text-[#FBFADA]/70 mb-1">Command Name</label>
                <input required placeholder="e.g. ping" value={cmdForm.command_name} onChange={(e) => setCmdForm({ ...cmdForm, command_name: e.target.value })} className="w-full bg-[#33503C] border border-[#FBFADA]/20 rounded p-2 text-[#FBFADA] placeholder:text-[#FBFADA]/50" />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="realExecution"
                  checked={cmdForm.is_real_execution} 
                  onChange={(e) => setCmdForm({ ...cmdForm, is_real_execution: e.target.checked })} 
                />
                <label htmlFor="realExecution" className="text-xs text-rose-300">Execute Real Linux Command (Host)</label>
              </div>

              {!cmdForm.is_real_execution && (
                <div>
                  <label className="block text-xs text-[#FBFADA]/70 mb-1">Static Output</label>
                  <textarea rows={3} placeholder="Output text..." value={cmdForm.output} onChange={(e) => setCmdForm({ ...cmdForm, output: e.target.value })} className="w-full input-event resize-none" />
                </div>
              )}
              
              <div>
                <label className="block text-xs text-[#FBFADA]/70 mb-1">Description</label>
                <input placeholder="Optional description" value={cmdForm.description} onChange={(e) => setCmdForm({ ...cmdForm, description: e.target.value })} className="w-full bg-[#33503C] border border-[#FBFADA]/20 rounded p-2 text-[#FBFADA] placeholder:text-[#FBFADA]/50" />
              </div>

              <button className="w-full py-2 bg-rose-500 text-slate-950 rounded text-xs font-bold">Add Command</button>
            </form>
            
            <div className="lg:col-span-2 bg-[#8E9F7C] border border-[#FBFADA]/20 rounded-xl overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[#FBFADA]/70 bg-[#33503C]">
                  <tr><th className="p-3">Command</th><th className="p-3">Type</th><th className="p-3">Description / Output</th><th className="p-3">Actions</th></tr>
                </thead>
                <tbody>
                  {commands.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-[#FBFADA]/50">No custom commands added yet.</td></tr>
                  ) : commands.map((cmd) => (
                    <tr key={cmd.id} className="border-t border-[#FBFADA]/20">
                      <td className="p-3 font-mono font-bold text-cyan-300">{cmd.command_name}</td>
                      <td className="p-3">
                        {cmd.is_real_execution ? (
                          <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">REAL SYSTEM CMD</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">STATIC OUTPUT</span>
                        )}
                      </td>
                      <td className="p-3 text-[#FBFADA]/70 truncate max-w-[200px]">
                        {cmd.is_real_execution ? cmd.description || 'Executes directly on backend host.' : cmd.output}
                      </td>
                      <td className="p-3">
                        <button onClick={() => removeCommand(cmd)} className="text-rose-300"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

