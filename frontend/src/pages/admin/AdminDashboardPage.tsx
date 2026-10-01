import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Trash2, UserPlus, TerminalSquare, LogOut } from 'lucide-react';
import { createAdminUser, deleteAdminUser, getAdminUsers, updateAdminUser } from '../../services/admin';
import { useAuth } from '../../context/AuthContext';
import { getCustomCommands, createCustomCommand, deleteCustomCommand, CustomCommand } from '../../services/customCommands';
import { User, UserRole } from '../../types/auth';



export const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuth();
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
  
  
  const addUser = async (e: React.FormEvent) => { e.preventDefault(); try { await createAdminUser(form); setForm({ username: '', email: '', password: '', role: 'student' }); setNotice('Account created.'); refresh(); } catch (error: any) { setNotice(error.message); } };
  const toggleUser = async (user: User) => { try { await updateAdminUser(user.id, { is_active: !user.is_active }); refresh(); } catch (error: any) { setNotice(error.message); } };
  const editUser = async (user: User) => { const username = window.prompt('Username', user.username); if (!username) return; const email = window.prompt('Email address', user.email); if (!email) return; const role = window.prompt('Role: student or admin', user.role); if (!role || !['student', 'admin'].includes(role)) return setNotice('Role must be student or admin.'); try { await updateAdminUser(user.id, { username, email, role: role as UserRole }); refresh(); } catch (error: any) { setNotice(error.message); } };
  const removeUser = async (user: User) => { if (!window.confirm(`Delete ${user.username}?`)) return; try { await deleteAdminUser(user.id); refresh(); } catch (error: any) { setNotice(error.message); } };
  


  
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
      <div className="max-w-[90rem] mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between gap-4 border-b border-[#FBFADA]/20 pb-5">
          <div>
            <p className="text-xs text-rose-400 font-mono uppercase tracking-widest mb-1">Restricted · /admin</p>
            <h1 className="text-3xl font-black tracking-tight">SecArena Administration</h1>
            <p className="text-sm text-[#FBFADA]/70 mt-2 font-medium">Manage accounts, lab records, custom commands, and resources.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-sm font-bold transition-all shadow-md">
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <ShieldCheck className="w-10 h-10 text-rose-400" />
          </div>
        </header>
        
        <div className="flex gap-2 border-b border-[#FBFADA]/20">
          {(['users', 'commands'] as const).map((item) => (
              <button 
              key={item} 
              onClick={() => setTab(item)} 
              className={`px-4 py-2 text-xs font-bold uppercase transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 ${tab === item ? 'border-b-2 border-rose-400 text-rose-300 bg-rose-500/10' : 'text-[#FBFADA]/70 hover:text-[#FBFADA] hover:bg-[#FBFADA]/5'}`}
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
          <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={addUser} className="p-6 h-fit glass-panel space-y-4 shadow-lg">
              <h2 className="font-bold flex gap-2 text-lg items-center"><UserPlus className="w-5 h-5 text-rose-300" />Create account</h2>
              <input required placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-modern" />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-modern" />
              <input required type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-modern" />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} className="input-modern">
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
              <button className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all">Create account</button>
            </form>
            <div className="lg:col-span-2 glass-panel overflow-x-auto shadow-lg">
              <table className="w-full text-xs text-left">
                <thead className="text-[#FBFADA]/70 bg-[#12372A]/40 uppercase tracking-wider">
                  <tr><th className="p-4 font-bold">User</th><th className="p-4 font-bold">Role</th><th className="p-4 font-bold">Status</th><th className="p-4 font-bold">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[#FBFADA]/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#12372A]/20 transition-colors duration-200">
                      <td className="p-4"><b>{user.username}</b><br /><span className="text-[#FBFADA]/50 font-mono mt-1 block">{user.email}</span></td>
                      <td className="p-4 font-mono font-bold"><span className={`px-2 py-1 rounded text-[10px] ${user.role === 'admin' ? 'bg-rose-500/20 text-rose-300' : 'bg-[#12372A] text-[#FBFADA]/60'}`}>{user.role}</span></td>
                      <td className="p-4">{user.is_active ? <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">ACTIVE</span> : <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">DISABLED</span>}</td>
                      <td className="p-4 space-x-3">
                        <button onClick={() => editUser(user)} className="text-purple-300 hover:text-purple-200 hover:scale-110 transition-all font-bold">Edit</button>
                        <button onClick={() => toggleUser(user)} className="text-cyan-300 hover:text-cyan-200 hover:scale-110 transition-all font-bold">{user.is_active ? 'Disable' : 'Enable'}</button>
                        <button onClick={() => removeUser(user)} className="text-rose-400 hover:text-rose-300 hover:scale-110 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === 'commands' ? (
          <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={addCommand} className="p-6 h-fit glass-panel space-y-4 shadow-lg">
              <h2 className="font-bold flex gap-2 text-lg items-center"><TerminalSquare className="w-5 h-5 text-rose-300" />Create Command</h2>
              
              <div>
                <label className="block text-xs font-bold text-[#FBFADA]/70 mb-1.5 uppercase tracking-widest">Command Name</label>
                <input required placeholder="e.g. ping" value={cmdForm.command_name} onChange={(e) => setCmdForm({ ...cmdForm, command_name: e.target.value })} className="input-modern" />
              </div>

              <div className="flex items-center gap-3 bg-[#12372A]/20 p-3 rounded-lg border border-[#12372A]/30">
                <input 
                  type="checkbox" 
                  id="realExecution"
                  checked={cmdForm.is_real_execution} 
                  onChange={(e) => setCmdForm({ ...cmdForm, is_real_execution: e.target.checked })} 
                  className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                />
                <label htmlFor="realExecution" className="text-xs font-bold text-rose-300 cursor-pointer">Execute Real Linux Command (Host)</label>
              </div>

              {!cmdForm.is_real_execution && (
                <div>
                  <label className="block text-xs font-bold text-[#FBFADA]/70 mb-1.5 uppercase tracking-widest">Static Output</label>
                  <textarea rows={3} placeholder="Output text..." value={cmdForm.output} onChange={(e) => setCmdForm({ ...cmdForm, output: e.target.value })} className="input-modern resize-none" />
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-[#FBFADA]/70 mb-1.5 uppercase tracking-widest">Description</label>
                <input placeholder="Optional description" value={cmdForm.description} onChange={(e) => setCmdForm({ ...cmdForm, description: e.target.value })} className="input-modern" />
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-900/20 active:scale-[0.98] transition-all">Add Command</button>
            </form>
            
            <div className="lg:col-span-2 glass-panel overflow-x-auto shadow-lg">
              <table className="w-full text-xs text-left">
                <thead className="text-[#FBFADA]/70 bg-[#12372A]/40 uppercase tracking-wider">
                  <tr><th className="p-4 font-bold">Command</th><th className="p-4 font-bold">Type</th><th className="p-4 font-bold">Description / Output</th><th className="p-4 font-bold">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-[#FBFADA]/10">
                  {commands.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-[#FBFADA]/50 font-medium">No custom commands added yet.</td></tr>
                  ) : commands.map((cmd) => (
                    <tr key={cmd.id} className="hover:bg-[#12372A]/20 transition-colors duration-200">
                      <td className="p-4 font-mono font-bold text-cyan-300">{cmd.command_name}</td>
                      <td className="p-4">
                        {cmd.is_real_execution ? (
                          <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">REAL SYSTEM CMD</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">STATIC OUTPUT</span>
                        )}
                      </td>
                      <td className="p-4 text-[#FBFADA]/70 truncate max-w-[200px] font-mono text-[11px]">
                        {cmd.is_real_execution ? cmd.description || 'Executes directly on backend host.' : cmd.output}
                      </td>
                      <td className="p-4">
                        <button onClick={() => removeCommand(cmd)} className="text-rose-400 hover:text-rose-300 hover:scale-110 transition-all"><Trash2 className="w-4 h-4" /></button>
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

