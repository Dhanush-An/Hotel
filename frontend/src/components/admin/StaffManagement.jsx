import React, { useState, useEffect } from 'react';
import {
  Search, UserPlus, Eye, Edit2, Trash2, UserCheck,
  Shield, ChevronDown, X, User, Clock, Mail,
  Loader2, AlertCircle, CheckCheck, EyeOff, Lock, CheckCircle
} from 'lucide-react';



/* ─── Static seed data ───────────────────────── */
const STATIC_STAFF = [];

const ROLE_BADGES = {
  Admin:        'bg-red-100 text-red-700',
  'Sub Admin':  'bg-orange-100 text-orange-700',
  Receptionist: 'bg-green-100 text-green-700',
  Manager:      'bg-purple-100 text-purple-700',
};

const ROLE_PERMISSIONS = {
  Admin:        { desc: 'Full access to all modules',       perms: ['View', 'Edit', 'Delete', 'Approve', 'Manage Roles'] },
  'Sub Admin':  { desc: 'Limited admin access',             perms: ['View', 'Edit', 'Approve'] },
  Receptionist: { desc: 'Bookings & customer handling',     perms: ['View', 'Booking Management'] },
  Manager:      { desc: 'Reports & supervision',            perms: ['View', 'Edit', 'Download Reports'] },
};

const INIT_FORM = {
  photo: '', name: '', dob: '', gender: 'Male',
  phone: '', email: '', emergencyContact: '', address: '',
  role: 'Receptionist', dept: '', shift: 'Day Shift', joinedDate: '', status: 'Active',
  password: '', confirmPassword: '',
};

/* ── Shared input/label styles ────────────────── */
const INP = [
  'w-full rounded-xl px-4 py-2.5 text-sm font-bold',
  'border border-gray-200 dark:border-[#272B30]',
  'bg-white dark:bg-[#272B30]',
  'text-black',
  'placeholder-gray-400 dark:placeholder-gray-500',
  'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400',
].join(' ');

const LBL = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1';

/* ── Badges ───────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    Active:     'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400',
    'On Leave': 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400',
    Inactive:   'bg-gray-100 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

/* ── Toast ────────────────────────────────────── */
const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold max-w-sm
    ${type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCheck size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
    <span className="flex-1">{msg}</span>
    <button onClick={onClose} className="ml-1 opacity-80 hover:opacity-100 transition-opacity">
      <X size={16} />
    </button>
  </div>
);

/* ── Add Staff Modal (Single Page Unified) ── */
const AddStaffModal = ({ onClose, onSaved, initialData = null }) => {
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...INIT_FORM,
        ...initialData,
        salary: initialData.basic || initialData.salary || '',
      };
    }
    return INIT_FORM;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const validate = () => {
    if (!(form.name || '').trim()) return 'Employee Name is required.';
    if (!(form.email || '').trim()) return 'Email is required.';
    if (!(form.phone || '').trim()) return 'Mobile Number is required.';
    if (form.phone.length !== 10) return 'Mobile Number must be 10 digits.';
    if (!(form.role || '').trim()) return 'Role is required.';
    if (!(form.joinedDate || '').trim()) return 'Joining Date is required.';
    
    // Only validate password for new staff or if user entered something in edit
    if (!initialData || (form.password && form.password.trim())) {
      if (!(form.password || '').trim() && !initialData) return 'Password is required.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    return null;
  };

  const handleSave = async () => {
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    const payload = {
      ...form,
      id: initialData?.id || `EMP-${Math.floor(Math.random() * 89999 + 10000)}`,
      employeeId: initialData?.employeeId || initialData?.id || `EMP-${Math.floor(Math.random() * 89999 + 10000)}`,
      name: (form.name || '').trim(),
      phone: (form.phone || '').trim(),
      dept: form.role, // Default dept to role for simplicity
    };

    setSaving(true);
    try {
      await onSaved({ ...initialData, ...payload });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-xl rounded-[32px] shadow-2xl flex flex-col max-h-[95vh] border border-gray-200 dark:border-[#272B30] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-[#272B30] shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {initialData ? 'Update Profile' : 'Register New Staff'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] font-bold uppercase tracking-widest mt-1">
              {initialData ? 'Edit Employee Credentials' : 'Create Management Account'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Unified Form Body */}
        <div className="overflow-y-auto p-8 flex-1 scrollbar-thin">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-700 dark:text-red-400 text-sm px-5 py-4 rounded-2xl animate-in fade-in zoom-in duration-300">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Employee Name</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="Enter full name" className={`${INP} pl-12 h-14`} />
               </div>
            </div>

            {/* Email */}
            <div>
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Email Address</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="email@example.com" className={`${INP} pl-12 h-14`} />
               </div>
            </div>

            {/* Mobile */}
            <div>
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Mobile Number</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary-500 transition-colors font-bold text-sm">
                    +91
                  </div>
                  <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="6543456789" maxLength={10} inputMode="numeric" pattern="[0-9]*" className={`${INP} pl-12 h-14`} />
               </div>
            </div>

            {/* Role */}
            <div>
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Assigned Role</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Shield size={18} />
                  </div>
                  <select value={form.role} onChange={e => set('role', e.target.value)} className={`${INP} pl-12 h-14 appearance-none`}>
                    {Object.keys(ROLE_BADGES).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>
            </div>

            {/* Password */}
            <div className="relative group">
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Login Password</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="••••••••" className={`${INP} pl-12 h-14`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
            </div>

            {/* Confirm Password */}
            <div className="relative group">
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Confirm Access Key</label>
               <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="••••••••" className={`${INP} pl-12 h-14`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>
            </div>

            {/* Shift */}
            <div>
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Shift Timing</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-primary-500 transition-colors">
                    <Clock size={18} />
                  </div>
                  <select value={form.shift} onChange={e => set('shift', e.target.value)} className={`${INP} pl-12 h-14 appearance-none`}>
                    <option value="Day Shift">Day Shift (8 AM to 8 PM)</option>
                    <option value="Night Shift">Night Shift (8 PM to 8 AM)</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
               </div>
            </div>

            {/* Joining Date */}
            <div>
               <label className="text-[11px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block pl-1">Joining Date</label>
               <input type="date" value={form.joinedDate} onChange={e => set('joinedDate', e.target.value)} className={`${INP} h-14`} />
            </div>
          </div>

          {initialData && (
            <p className="mt-8 text-[11px] text-gray-400 dark:text-gray-500 italic font-medium text-center">
              * Password fields can be left blank if no update is required. 
              Email serves as the Login ID.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-[#272B30] flex gap-4 shrink-0 bg-gray-50 dark:bg-[#1A1D1F]/50">
          <button onClick={onClose}
            className="flex-1 py-4 border border-gray-200 dark:border-[#272B30] rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-[2] py-4 bg-primary-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-primary-600 shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
            {saving
              ? <Loader2 size={18} className="animate-spin" />
              : <><UserPlus size={18} /> {initialData ? 'Update Account' : 'Save Staff Member'}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewStaffModal = ({ data, onClose }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#272B30] text-gray-500 transition-colors">
          <X size={20} />
        </button>
        <div className="flex items-center gap-4 mb-6 pt-2">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-2xl shrink-0">
            {data.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{data.name}</h2>
            <p className="text-sm text-gray-500">{data.id} • {data.role}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Department</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{data.dept}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Status</p>
            <StatusBadge status={data.status} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Phone</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{data.phone}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Shift</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{data.shift}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Joined Date</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{data.joinedDate || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Gender</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{data.gender || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email Address</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{data.email || '—'}</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-100 dark:bg-[#272B30] text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-[#343440] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ───────────────────────────── */
const ROLES    = ['All', 'Admin', 'Sub Admin', 'Receptionist', 'Manager'];
const SHIFTS   = ['All', 'Day Shift', 'Night Shift'];
const STATUSES = ['All', 'Active', 'On Leave', 'Inactive'];

import api from '../../services/api';

export default function StaffManagement() {
  const [search,       setSearch]       = useState('');
  const [filterRole,   setFilterRole]   = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterShift,  setFilterShift]  = useState('All');
  const [showModal,    setShowModal]    = useState(false);
  const [showPerms,    setShowPerms]    = useState(false);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setStaff(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);
  const [toast,        setToast]        = useState(null);

  const [viewModal,    setViewModal]    = useState(null);
  const [editModal,    setEditModal]    = useState(null);

  const handleAction = async (action, member) => {
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
        try {
          await api.deleteStaff(member._id);
          setStaff(prev => prev.filter(s => s._id !== member._id));
          showToast(`${member.name} deleted successfully`, 'success');
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    } else if (action === 'view') {
      setViewModal(member);
    } else if (action === 'edit') {
      setEditModal(member);
    }
  };
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaved = async (member) => {
    try {
      if (editModal) {
        const updated = await api.updateStaff(member._id, member);
        setStaff(prev => prev.map(s => s._id === updated._id ? updated : s));
        setEditModal(null);
        showToast(`${member.name} updated successfully!`);
      } else {
        const created = await api.createStaff(member);
        setStaff(prev => [created, ...prev]);
        setShowModal(false);
        showToast(`${member.name} (${member.employeeId}) added successfully!`);
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const countBy = (field, val) => staff.filter(s => s[field] === val).length;

  const stats = [
    { label: 'Total Staff',  value: staff.length,                  color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20' },
    { label: 'Active',       value: countBy('status', 'Active'),   color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-500/20' },
    { label: 'On Leave',     value: countBy('status', 'On Leave'), color: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-500/20' },
    { label: 'Inactive',     value: countBy('status', 'Inactive'), color: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20' },
    { label: 'New Joiners',  value: staff.filter(s => s.joinedDate >= '2024-01-01').length, color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20' },
    { label: 'Departments',  value: [...new Set(staff.map(s => s.dept))].length,            color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-500/20' },
  ];

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    return (
      (s.name.toLowerCase().includes(q) || (s.id || '').toLowerCase().includes(q)) &&
      (filterRole   === 'All' || s.role   === filterRole)   &&
      (filterStatus === 'All' || s.status === filterStatus) &&
      (filterShift  === 'All' || s.shift  === filterShift)
    );
  });

  const selCls = [
    'pl-3 pr-8 py-2 rounded-xl text-sm appearance-none font-bold',
    'border border-gray-300 dark:border-[#272B30] bg-white dark:bg-[#1A1D1F] text-black',
    'focus:outline-none focus:ring-2 focus:ring-primary-300',
  ].join(' ');

  return (
    <div className="space-y-6">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {showModal && <AddStaffModal onClose={() => setShowModal(false)} onSaved={handleSaved} />}
      {editModal && <AddStaffModal initialData={editModal} onClose={() => setEditModal(null)} onSaved={handleSaved} />}
      {viewModal && <ViewStaffModal data={viewModal} onClose={() => setViewModal(null)} />}

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Roles & Permissions ── */}
      <button onClick={() => setShowPerms(!showPerms)}
        className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
        <Shield size={16} />
        {showPerms ? 'Hide' : 'View'} Roles &amp; Permissions
      </button>

      {showPerms && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
            <div key={role} className="bg-white dark:bg-[#1A1D1F] border border-gray-200 dark:border-[#272B30] rounded-2xl p-4 shadow-sm">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full mb-3 inline-block ${ROLE_BADGES[role]}`}>{role}</span>
              <p className="text-xs text-gray-500 dark:text-[#a1a1aa] mb-3 leading-relaxed">{info.desc}</p>
              <ul className="space-y-1.5">
                {info.perms.map(p => (
                  <li key={p} className="text-xs flex items-center gap-1.5 text-gray-700 dark:text-gray-300 font-medium">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl p-4 border border-gray-200 dark:border-[#272B30] shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name / ID…"
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-[#272B30] rounded-xl text-sm bg-white dark:bg-[#272B30] text-black font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 w-52" />
          </div>

          {/* Dropdowns */}
          {[
            [filterRole,   setFilterRole,   ROLES,    'Role'],
            [filterStatus, setFilterStatus, STATUSES, 'Status'],
            [filterShift,  setFilterShift,  SHIFTS,   'Shift'],
          ].map(([val, setter, options, label]) => (
            <div key={label} className="relative">
              <select value={val} onChange={e => setter(e.target.value)} className={selCls}>
                {options.map(o => (
                  <option key={o} value={o}>
                    {o === 'All' ? `All ${label === 'Status' ? 'Statuses' : label + 's'}` : o}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>

        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 shadow-sm transition-colors">
          <UserPlus size={15} /> Add Staff
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-sm border border-gray-200 dark:border-[#272B30] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#272B30] border-b border-gray-200 dark:border-[#3a3a45]">
                {['Emp ID', 'Name', 'Role', 'Department', 'Phone', 'Shift', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#272B30]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-14">
                    <Loader2 size={24} className="animate-spin text-primary-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-[#a1a1aa] font-medium">Loading staff data…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-14">
                    <User size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-[#a1a1aa] font-medium">No staff members found.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters or add a new staff member.</p>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-[#272B30] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-gray-700 dark:text-gray-300 text-xs bg-gray-100 dark:bg-[#272B30] px-2.5 py-1 rounded-lg">{s.id}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm shrink-0">
                          {s.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_BADGES[s.role] ?? 'bg-gray-100 dark:bg-[#272B30] text-gray-600 dark:text-gray-400'}`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{s.dept}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{s.phone}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
                        <Clock size={13} className="text-gray-400 dark:text-gray-500" /> {s.shift}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-sm">{s.joinedDate}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleAction('view', s)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-500 transition-colors"   title="View">    <Eye      size={15} /></button>
                        <button onClick={() => handleAction('edit', s)} className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-500/10 text-yellow-600 transition-colors" title="Edit">    <Edit2    size={15} /></button>
                        <button onClick={() => handleAction('delete', s)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"      title="Delete">  <Trash2   size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-[#272B30] bg-gray-50 dark:bg-[#1A1D1F]/50 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-[#a1a1aa] font-medium">
              Showing <span className="text-gray-800 dark:text-white font-bold">{filtered.length}</span> of <span className="text-gray-800 dark:text-white font-bold">{staff.length}</span> staff members
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
