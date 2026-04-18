import React, { useState, useEffect } from 'react';
import { Shield, User, Key, Search, ChevronDown, Plus, Eye, EyeOff, Edit2, Trash2, Power, Lock, Unlock, X } from 'lucide-react';
import api from '../../services/api';

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

export default function SettingsTab() {
  const [search, setSearch] = useState('');
  const [credentials, setCredentials] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', name: '', dept: '', phone: '', password: '', confirmPassword: '' });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allStaff, setAllStaff] = useState([]);
  const [addForm, setAddForm] = useState({ staffId: '', name: '', dept: '', phone: '', password: '', confirmPassword: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await api.getStaff();
      setAllStaff(data);
      const formattedData = data.filter(s => s.role).map(staff => ({
        _id: staff._id,
        id: staff.id || staff.employeeId || staff._id.substring(0, 6).toUpperCase(),
        name: staff.name,
        dept: staff.role === 'admin' ? 'Admin' : staff.role === 'receptionist' ? 'Receptionist' : staff.role === 'subadmin' ? 'Sub Admin' : staff.role === 'manager' ? 'Manager' : staff.dept || staff.role || 'Unassigned',
        phone: staff.phone || '-',
        status: staff.status === 'Active' ? 'Active' : 'Inactive',
        lastLogin: staff.updatedAt ? new Date(staff.updatedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'
      }));
      setCredentials(formattedData);
    } catch (error) {
      console.error('Error fetching staff for settings:', error);
    }
  };

  const filtered = credentials.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.dept?.toLowerCase().includes(search.toLowerCase()));

  const handleToggleStatus = async (id) => {
    const userToToggle = credentials.find(u => u.id === id);
    if(userToToggle && userToToggle._id) {
       const newStatus = userToToggle.status === 'Active' ? 'Inactive' : 'Active';
       try {
          await api.updateStaff(userToToggle._id, { status: newStatus });
          setCredentials(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
       } catch(error) { console.error(error); }
    } else {
       setCredentials(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    }
  };

  const handleEditOpen = (user) => {
    setEditForm({ id: user.id, name: user.name, dept: user.dept, phone: user.phone || '', password: '', confirmPassword: '' });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editForm.password && editForm.password !== editForm.confirmPassword) {
       alert("Passwords do not match!");
       return;
    }

    try {
       const original = credentials.find(u => u.id === editForm.id);
       if (original && original._id) {
          await api.updateStaff(original._id, { 
             name: editForm.name, 
             dept: editForm.dept, 
             phone: editForm.phone 
          });
       }
       setCredentials(prev => prev.map(u => u.id === editForm.id ? { ...u, name: editForm.name, dept: editForm.dept, phone: editForm.phone } : u));
       setShowEditModal(false);
    } catch(err) {
       console.error("Failed to update user", err);
       alert("Failed to save changes.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to completely revoke access for this user?")) {
      const original = credentials.find(u => u.id === id);
      if(original && original._id) {
         try {
           await api.deleteStaff(original._id);
           setCredentials(prev => prev.filter(u => u.id !== id));
         } catch(err) { console.error(err); }
      } else {
         setCredentials(prev => prev.filter(u => u.id !== id));
      }
    }
  };

  const handleReset = (username) => {
    alert(`Password reset link sent to ${username}`);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.staffId) return alert("Select an employee");
    if (!addForm.password) return alert("Password required");
    if (addForm.password !== addForm.confirmPassword) return alert("Passwords do not match");

    try {
      const staff = allStaff.find(s => s._id === addForm.staffId);
      await api.updateStaff(staff._id, { 
        password: addForm.password
      });
      showToast("Access credentials created successfully!", "success");
      setShowAddModal(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleStaffSelect = (id) => {
    const staff = allStaff.find(s => s._id === id);
    if (staff) {
      setAddForm({
        ...addForm,
        staffId: id,
        name: staff.name,
        dept: staff.role === 'admin' ? 'Admin' : staff.role === 'receptionist' ? 'Receptionist' : staff.role === 'subadmin' ? 'Sub Admin' : staff.role === 'manager' ? 'Manager' : staff.dept || staff.role,
        phone: staff.phone
      });
    }
  };

  const [toast, setToast] = useState(null);
  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 animate-in slide-in-from-right-10 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
           <CheckCircle size={20} /> {toast.msg}
        </div>
      )}
      {/* Header Info */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1A1D1F] dark:text-white">User Authentication Management</h1>
          <p className="text-[11px] font-bold text-gray-400 dark:text-[#a1a1aa] uppercase tracking-widest mt-1">Control system access & credentials</p>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: credentials.length, icon: User, color: 'bg-white dark:bg-[#1c1c24]' },
          { label: 'Active Sessions', value: credentials.filter(c => c.status === 'Active').length, icon: Power, color: 'bg-[#E9F5EF] dark:bg-[#1a221d] text-[#27AE60]' },
          { label: 'Admins', value: credentials.filter(c => c.dept.includes('Admin')).length, icon: Shield, color: 'bg-white dark:bg-[#1c1c24]' },
          { label: 'Pending Reset', value: 0, icon: Key, color: 'bg-white dark:bg-[#1c1c24]' },
        ].map(s => (
          <div key={s.label} className={cn("rounded-[24px] p-6 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]", s.color)}>
            <div className="flex justify-between items-start mb-4">
              <p className="text-[12px] font-bold text-[#1A1D1F]/60 dark:text-white/60 uppercase tracking-widest">{s.label}</p>
              <s.icon size={18} className="opacity-50" />
            </div>
            <h3 className="text-4xl font-bold text-[#1A1D1F] dark:text-white">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Management Area */}
      <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
        <div className="flex justify-between items-center mb-8">
           <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa]" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by staff name or department..." 
                className="pl-12 pr-4 py-3 bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] w-80 shadow-inner" 
              />
           </div>
           <div className="flex gap-4">
               <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#DCEB8C] text-[#1A1D1F] rounded-2xl text-sm font-bold shadow-sm hover:translate-y-[-2px] transition-all">
                  <Plus size={18} /> Add New Credential
               </button>
              <button className="flex items-center gap-2 px-6 py-3 border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl text-sm font-bold text-gray-500 dark:text-[#a1a1aa] hover:bg-[#F4F4F4] dark:hover:bg-[#2a2a35] dark:bg-[#2a2a35]">
                 Role Level <ChevronDown size={14} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FB] dark:bg-[#13131A]">
                {['User ID','Staff Name','Department','Status','Last Login','Action'].map(h => <th key={h} className="px-6 py-5 text-left text-[11px] font-bold text-[#6F767E] dark:text-[#a1a1aa] uppercase tracking-widest">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F4]">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#2a2a35] transition-colors group">
                  <td className="px-6 py-5 font-bold text-[#1A1D1F]/50 dark:text-white/50">{u.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F4F4] dark:bg-[#2a2a35] flex items-center justify-center text-gray-400 dark:text-[#a1a1aa]"><User size={20} /></div>
                      <p className="font-extrabold text-[#1A1D1F] dark:text-white">{u.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className={cn(
                       "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter",
                       u.dept === 'Admin' ? 'bg-[#FFE7E4] dark:bg-[#2a1a1c] text-[#FF6A55]' : 'bg-[#E9F5EF] dark:bg-[#1a221d] text-[#27AE60]'
                     )}>{u.dept}</span>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", u.status === 'Active' ? 'bg-[#27AE60]' : 'bg-gray-300')}></div>
                        <span className={cn("text-xs font-bold", u.status === 'Active' ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-[#a1a1aa]')}>{u.status}</span>
                     </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-[#a1a1aa]">{u.lastLogin}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                       <button onClick={() => handleReset(u.name)} title="Reset Password" className="p-2.5 rounded-xl border border-[#EFF2F5] dark:border-[#2a2a35] text-gray-400 dark:text-[#a1a1aa] hover:text-[#DCEB8C] hover:border-[#DCEB8C]/50 hover:bg-[#DCEB8C]/10 transition-all">
                          <Lock size={16} />
                       </button>
                       <button onClick={() => handleToggleStatus(u.id)} title="Toggle Status" className={cn(
                         "p-2.5 rounded-xl border transition-all",
                         u.status === 'Active' ? 'border-[#EFF2F5] dark:border-[#2a2a35] text-gray-400 dark:text-[#a1a1aa] hover:text-[#27AE60]' : 'text-[#27AE60] border-[#C7E3D4] bg-[#E9F5EF] dark:bg-[#1a221d]'
                       )}>
                          <Power size={16} />
                       </button>
                       <button onClick={() => handleEditOpen(u)} className="p-2.5 rounded-xl border border-[#EFF2F5] dark:border-[#2a2a35] text-gray-400 dark:text-[#a1a1aa] hover:bg-gray-100 dark:hover:bg-[#2a2a35] transition-all"><Edit2 size={16} /></button>
                       <button onClick={() => handleDelete(u.id)} className="p-2.5 rounded-xl border border-[#EFF2F5] dark:border-[#2a2a35] text-gray-400 dark:text-[#a1a1aa] hover:text-red-500 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-8 border-b border-[#EFF2F5] dark:border-[#2a2a35] flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-bold text-[#1A1D1F] dark:text-white tracking-tight">Edit Staff Credentials</h2>
                   <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Update access & details</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2a2a35] flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                   <X size={18} />
                </button>
             </div>
             <form onSubmit={handleEditSubmit} className="p-8 space-y-6">
                 <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Staff Name</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all relative z-10" required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Department</label>
                         <select value={editForm.dept} onChange={e => setEditForm({...editForm, dept: e.target.value})} className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all">
                            <option value="Admin">Admin</option>
                            <option value="Sub Admin">Sub Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="Receptionist">Receptionist</option>
                         </select>
                     </div>
                     <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mobile Number</label>
                        <input 
                          type="tel" 
                          value={editForm.phone} 
                          onChange={e => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                              setEditForm({...editForm, phone: val});
                          }} 
                          maxLength={10}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all" 
                          required 
                        />
                     </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">New Password</label>
                        <input type={showEditPassword ? "text" : "password"} value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} placeholder="Leaves unchanged" className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all" />
                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                     <div className="relative">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
                        <input type={showEditConfirmPassword ? "text" : "password"} value={editForm.confirmPassword} onChange={e => setEditForm({...editForm, confirmPassword: e.target.value})} placeholder="Confirm new password" className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all" />
                        <button type="button" onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)} className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            {showEditConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                 </div>
                 <div className="pt-4 flex justify-end gap-3">
                     <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-[#a1a1aa] dark:hover:bg-[#2a2a35] transition-all">Cancel</button>
                     <button type="submit" className="px-6 py-3 rounded-2xl text-sm font-bold bg-[#DCEB8C] text-[#1A1D1F] hover:brightness-95 transition-all shadow-sm">Save Changes</button>
                 </div>
             </form>
          </div>
        </div>
      )}
      {/* Add Access Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-8 border-b border-[#EFF2F5] dark:border-[#2a2a35] flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-bold text-[#1A1D1F] dark:text-white tracking-tight">Create User Access</h2>
                   <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Assign credentials to existing staff</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2a2a35] flex items-center justify-center text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
                   <X size={18} />
                </button>
             </div>
             <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
                 <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Select Employee</label>
                    <select value={addForm.staffId} onChange={e => handleStaffSelect(e.target.value)} className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all">
                       <option value="">Select an employee...</option>
                       {allStaff.map(s => <option key={s._id} value={s._id}>{s.name} ({s.id || s.employeeId || 'No ID'})</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Department / Role</label>
                        <input readOnly value={addForm.dept} className="w-full bg-gray-50 dark:bg-[#1A1D1F] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed" placeholder="Select employee first" />
                     </div>
                     <div>
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mobile Number</label>
                        <input readOnly value={addForm.phone} className="w-full bg-gray-50 dark:bg-[#1A1D1F] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed" placeholder="Select employee first" />
                     </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Set Password</label>
                        <input type={showEditPassword ? "text" : "password"} value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all" required={!editForm.id} />
                        <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                     <div className="relative">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Confirm Password</label>
                        <input type={showEditConfirmPassword ? "text" : "password"} value={addForm.confirmPassword} onChange={e => setAddForm({...addForm, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-xl px-4 py-3 pr-10 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] transition-all" required={!editForm.id} />
                        <button type="button" onClick={() => setShowEditConfirmPassword(!showEditConfirmPassword)} className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                            {showEditConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                     </div>
                 </div>
                 <div className="pt-4 flex justify-end gap-3">
                     <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 dark:text-[#a1a1aa] dark:hover:bg-[#2a2a35] transition-all">Cancel</button>
                     <button type="submit" className="px-6 py-3 rounded-2xl text-sm font-bold bg-[#DCEB8C] text-[#1A1D1F] hover:brightness-95 transition-all shadow-sm">Enable Access</button>
                 </div>
             </form>
          </div>
        </div>
      )}

      {/* Password Security Policy Box */}
      <div className="bg-[#1A1D1F] rounded-[32px] p-8 shadow-premium relative overflow-hidden group">
         <div className="absolute right-0 top-0 p-8 opacity-10"><Key size={80} /></div>
         <p className="text-[#C7E3D4] text-[10px] font-bold uppercase tracking-widest mb-3">Security Policy</p>
         <h3 className="text-2xl font-bold text-white mb-6">Credential Policy Control</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: '2FA Enforcement', enabled: true },
              { label: 'Auto Password Expiry (90d)', enabled: false },
              { label: 'Brute Force Lockout', enabled: true },
            ].map((p, i) => (
              <div key={i} className="bg-white/5 dark:bg-[#1c1c24]/5 border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                 <span className="text-sm font-bold text-white/80">{p.label}</span>
                 <div className={cn("w-10 h-6 rounded-full relative cursor-pointer transition-colors p-1", p.enabled ? 'bg-[#DCEB8C]' : 'bg-white/20 dark:bg-[#1c1c24]/20')}>
                    <div className={cn("w-4 h-4 bg-white dark:bg-[#1c1c24] rounded-full transition-all shadow-md", p.enabled ? 'ml-4' : 'ml-0')}></div>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
