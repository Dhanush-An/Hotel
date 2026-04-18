
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Calendar, Search, Filter, 
  MoreVertical, Edit2, Trash2, CheckCircle, 
  UserPlus, Download, ChevronDown, Sparkles
} from 'lucide-react';

const SHIFTS = ['Day (8 AM - 4 PM)', 'Evening (4 PM - 12 AM)', 'Night (12 AM - 8 AM)'];
const ROLES = ['Admin', 'Manager', 'Receptionist', 'SubAdmin'];

import api from '../../services/api';

const ShiftAllocation = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '', role: '', shift: SHIFTS[0], dept: ROLES[0], status: 'Active', phone: ''
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setAllocations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const [showFilter, setShowFilter] = useState(false);
  const [roleFilter, setRoleFilter] = useState('All');

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredAllocations = allocations.filter(item => {
    const matchesSearch = (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (item.dept?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (item.role?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesRole = roleFilter === 'All' || (item.role || '').toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  const handleExport = () => {
    try {
      const headers = ['Name', 'Role', 'Department', 'Shift', 'Status'];
      const rows = filteredAllocations.map(item => [item.name, item.role, item.dept, item.shift || 'Not Assigned', item.status]);
      const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `shift_allocations_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const updated = await api.updateStaff(editingItem._id, form);
        setAllocations(prev => prev.map(item => item._id === updated._id ? updated : item));
      } else {
        const newId = `STF-${Math.floor(1000 + Math.random() * 9000)}`;
        const payload = {
          ...form,
          id: newId,
          employeeId: newId,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        const created = await api.createStaff(payload);
        setAllocations(prev => [...prev, created]);
      }
      setShowModal(false);
      setEditingItem(null);
      setForm({ name: '', role: '', shift: SHIFTS[0], dept: ROLES[0], status: 'Active', phone: '' });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.deleteStaff(id);
        setAllocations(prev => prev.filter(item => item._id !== id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setForm({ 
      name: item.name, 
      role: item.role, 
      shift: item.shift || SHIFTS[0], 
      dept: item.dept || ROLES[0], 
      status: item.status,
      phone: item.phone || ''
    });
    setShowModal(true);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'On Leave': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Modal Integration */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl animate-scale-in">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
              {editingItem ? 'Edit Allocation' : 'Assign New Shift'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Staff Name</label>
                <input 
                  required
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="Enter staff name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Role</label>
                  <input 
                    required
                    type="text" 
                    value={form.role}
                    onChange={(e) => setForm({...form, role: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                    placeholder="e.g. Cleaner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Department</label>
                  <select 
                    value={form.dept}
                    onChange={(e) => setForm({...form, dept: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Mobile Number</label>
                <input 
                  required
                  type="tel" 
                  value={form.phone}
                  onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({...form, phone: val});
                  }}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Shift Type</label>
                <select 
                  value={form.shift}
                  onChange={(e) => setForm({...form, shift: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                >
                  {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-[#272B30] text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary-500/25"
                >
                  {editingItem ? 'Update' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: allocations.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'On Duty', value: allocations.filter(i => i.status === 'Active').length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Morning Shift', value: allocations.filter(i => (i.shift || '').includes('8 AM')).length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Night Shift', value: allocations.filter(i => (i.shift || '').includes('12 AM')).length, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1A1D1F] p-5 rounded-3xl border border-gray-100 dark:border-[#272B30] shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-2xl`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-gray-800 dark:text-white leading-none mt-1">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white dark:bg-[#1A1D1F] p-4 rounded-3xl border border-gray-100 dark:border-[#272B30] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search staff or department..."
              className="w-full bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500/50 outline-none"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`p-3 rounded-2xl transition-all border ${
                showFilter 
                  ? "bg-primary-500 text-white border-primary-500" 
                  : "bg-gray-50 dark:bg-[#272B30] text-gray-400 border-transparent hover:text-gray-600"
              }`}
            >
              <Filter size={18} />
            </button>
            {showFilter && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-[#272B30] rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { setRoleFilter('All'); setShowFilter(false); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#272B30]">All Roles</button>
                {ROLES.map(r => (
                  <button key={r} onClick={() => { setRoleFilter(r); setShowFilter(false); }} className="w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#272B30]">{r}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 dark:bg-[#272B30] text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all border border-transparent active:border-primary-500"
          >
            <Download size={18} /> Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-primary-500/25 hover:bg-primary-600 transition-all active:scale-[0.98]"
          >
            <UserPlus size={18} /> Assign Shift
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-[2rem] border border-gray-100 dark:border-[#272B30] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#272B30]/50 border-b border-gray-100 dark:border-[#272B30]">
                {['Staff Member', 'Department', 'Shift Details', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#272B30]">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading...</td></tr>
              ) : filteredAllocations.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-[#272B30]/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                        {(item.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">{item.dept}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={14} className="text-primary-500" />
                      <span className="text-xs font-bold">{item.shift || 'Not Assigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#272B30] rounded-xl text-gray-400 hover:text-primary-500 transition-all"
                       >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#272B30] rounded-xl text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredAllocations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No matching results found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-5 border-t border-gray-100 dark:border-[#272B30] flex items-center justify-between">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {filteredAllocations.length} Staff members</p>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-50 dark:bg-[#272B30] text-gray-400 font-bold rounded-xl text-xs disabled:opacity-50" disabled>Previous</button>
              <button className="px-4 py-2 bg-gray-50 dark:bg-[#272B30] text-gray-800 dark:text-white font-bold rounded-xl text-xs" onClick={fetchStaff}>Refresh</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftAllocation;
