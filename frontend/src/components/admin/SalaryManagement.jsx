import React, { useState, useEffect } from 'react';
import { Search, Edit2, Download, ChevronDown, X, Banknote, Plus, Check, User } from 'lucide-react';
import api from '../../services/api';

const DEPTS = ['Management', 'Front Office', 'Housekeeping', 'Operations'];
const STATUS_BADGE = {
  Paid: 'bg-green-100 text-green-700',
  Unpaid: 'bg-yellow-100 text-yellow-700',
  'On Hold': 'bg-red-100 text-red-600',
};

const EditSalaryModal = ({ staff, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...staff });
  const hra = Math.round(Number(form.basic) * 0.2);
  const net = Number(form.basic) + hra + Number(form.allowance || 0) - Number(form.deduction || 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-md rounded-2xl shadow-premium overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-[#2a2a35]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Salary — {staff.name}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Role / Department</label>
              <div className="grid grid-cols-2 gap-3">
                <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="Role" />
                <select value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))} className="border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Basic Salary (₹)</label>
              <input type="number" value={form.basic} onChange={e => setForm(p => ({ ...p, basic: Number(e.target.value) }))} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">HRA (auto 20%)</label>
              <input readOnly value={hra} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-gray-50/50 dark:bg-white/5 dark:text-white font-bold opacity-80" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Allowance (₹)</label>
              <input type="number" value={form.allowance || 0} onChange={e => setForm(p => ({ ...p, allowance: Number(e.target.value) }))} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Deduction (₹)</label>
              <input type="number" value={form.deduction || 0} onChange={e => setForm(p => ({ ...p, deduction: Number(e.target.value) }))} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
            <div className="col-span-2 bg-primary-50 dark:bg-primary-500/10 rounded-xl p-4 flex justify-between items-center">
              <span className="font-bold text-gray-700 dark:text-gray-300">Net Salary</span>
              <span className="text-2xl font-black text-primary-700">₹{net.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-gray-50/50">
          <button onClick={onClose} className="px-6 py-2.5 border border-border rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSaved({ ...form, hra, net })} className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const AddStaffModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', role: '', dept: DEPTS[0], basic: 0, allowance: 0, deduction: 0, status: 'Pending' });
  const hra = Math.round(Number(form.basic) * 0.2);
  const net = Number(form.basic) + hra + Number(form.allowance || 0) - Number(form.deduction || 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-md rounded-2xl shadow-premium overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-[#2a2a35]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add Staff Salary</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-3">
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="Staff Full Name" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none" placeholder="Role" />
            <select value={form.dept} onChange={e => setForm(p => ({ ...p, dept: e.target.value }))} className="border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {DEPTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Basic</label><input type="number" value={form.basic} onChange={e => setForm(p => ({ ...p, basic: Number(e.target.value) }))} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-[#13131A] dark:text-white" /></div>
            <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Allowance</label><input type="number" value={form.allowance} onChange={e => setForm(p => ({ ...p, allowance: Number(e.target.value) }))} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-[#13131A] dark:text-white" /></div>
            <div><label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Deduction</label><input type="number" value={form.deduction} onChange={e => setForm(p => ({ ...p, deduction: Number(e.target.value) }))} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-3 py-2 text-sm focus:outline-none dark:bg-[#13131A] dark:text-white" /></div>
          </div>
          <div className="bg-primary-50 dark:bg-primary-500/10 rounded-xl p-3 flex justify-between items-center text-gray-800 dark:text-gray-100">
            <span className="text-sm font-bold text-gray-700">Net Salary</span>
            <span className="font-black text-primary-700">₹{net.toLocaleString()}</span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 border border-border rounded-xl text-sm text-gray-600">Cancel</button>
          <button onClick={() => {
            if (!form.name) { alert('Staff name required'); return; }
            onSaved({ id: `EMP-${Math.floor(100 + Math.random() * 900)}`, ...form, hra, net });
          }} className="px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold">Add Staff</button>
        </div>
      </div>
    </div>
  );
};

export default function SalaryManagement() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');
  const [editStaff, setEditStaff] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [salaryList, setSalaryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setSalaryList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleUpdate = async (updated) => {
    try {
      const data = await api.updateStaff(updated._id, updated);
      setSalaryList(prev => prev.map(e => e._id === data._id ? data : e));
      setEditStaff(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAdd = async (staff) => {
    try {
      const created = await api.createStaff(staff);
      setSalaryList(prev => [created, ...prev]);
      setShowAddModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePaySalary = async (staffId) => {
    const staff = salaryList.find(e => e._id === staffId);
    if (!staff) return;
    
    try {
      // Update salary status
      const updatedStaff = await api.updateStaff(staffId, { 
        status: 'Paid', 
        paidDate: new Date().toISOString().split('T')[0] 
      });
      
      setSalaryList(prev => prev.map(e => e._id === staffId ? updatedStaff : e));
      
      // Auto-add to expenses via API
      const newExp = {
        id: `EXP-SAL-${staffId}-${Date.now()}`,
        title: `${staff.name} — Salary (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})`,
        category: 'Staff Salary',
        dept: staff.dept,
        amount: staff.net,
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        status: 'Paid',
        approvedBy: 'Admin',
        notes: `Auto-generated from Salary tab. Role: ${staff.role}`,
      };
      
      await api.createExpense(newExp);
      alert(`Salary paid to ${staff.name} (₹${staff.net.toLocaleString()}). Entry added to Expenses tab automatically.`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExport = () => {
    const rows = [['ID','Name','Role','Dept','Basic','HRA','Allowance','Deduction','Net','Status']];
    salaryList.forEach(e => rows.push([e.id, e.name, e.role, e.dept, e.basic, e.hra, e.allowance || 0, e.deduction || 0, e.net, e.status]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'salary_list.csv'; a.click();
  };

  const totalPayroll = salaryList.reduce((s, e) => s + Number(e.net || 0), 0);
  const paid = salaryList.filter(e => e.status === 'Paid').reduce((s, e) => s + Number(e.net || 0), 0);
  const pending = salaryList.filter(e => e.status !== 'Paid').reduce((s, e) => s + Number(e.net || 0), 0);

  const filtered = salaryList.filter(e => {
    const q = search.toLowerCase();
    return (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      && (filterStatus === 'All' || e.status === filterStatus)
      && (filterDept === 'All' || e.dept === filterDept);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {editStaff && <EditSalaryModal staff={editStaff} onClose={() => setEditStaff(null)} onSaved={handleUpdate} />}
      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onSaved={handleAdd} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payroll', value: `₹${(totalPayroll/1000).toFixed(1)}K`, color: 'bg-[#E9F5EF] dark:bg-[#1a221d] text-[#27AE60]' },
          { label: 'Paid Amount', value: `₹${(paid/1000).toFixed(1)}K`, color: 'bg-white dark:bg-[#1c1c24] border border-[#EFF2F5]' },
          { label: 'Pending Amount', value: `₹${(pending/1000).toFixed(1)}K`, color: 'bg-white dark:bg-[#1c1c24] border border-[#EFF2F5]' },
          { label: 'Staff Count', value: salaryList.length, color: 'bg-white dark:bg-[#1c1c24] border border-[#EFF2F5]' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-[24px] p-6 shadow-sm`}>
            <p className="text-[12px] font-bold text-gray-500 dark:text-[#a1a1aa] uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-bold text-[#1A1D1F] dark:text-white mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-6 border border-[#EFF2F5] dark:border-[#2a2a35] shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee..." className="pl-11 pr-4 py-2.5 bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#DCEB8C] w-56" />
          </div>
          {[
            [filterStatus, setFilterStatus, ['All','Paid','Pending','On Hold'], 'Status'],
            [filterDept, setFilterDept, ['All', ...DEPTS], 'Dept'],
          ].map(([val, setter, options, label]) => (
            <div key={label} className="relative">
              <select value={val} onChange={e => setter(e.target.value)} className="pl-4 pr-10 py-2.5 bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl text-sm focus:outline-none appearance-none">
                {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label === 'Status' ? 'Statuses' : label + 's'}` : o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"><Download size={15} /> Export</button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-2xl text-sm font-bold hover:bg-primary-600 shadow-sm"><Plus size={16} /> Add Staff</button>
          <button onClick={() => {
            if (window.confirm('Release payroll for all pending staff?')) {
              salaryList.filter(e => e.status !== 'Paid').forEach(e => handlePaySalary(e.id));
            }
          }} className="flex items-center gap-2 px-5 py-2.5 bg-[#DCEB8C] text-[#1A1D1F] rounded-2xl text-sm font-bold hover:shadow-lg transition-all"><Banknote size={16} /> Release All Payroll</button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FB] dark:bg-[#13131A]">
                {['Emp ID','Employee','Role','Dept','Basic','HRA','Allowance','Deduction','Net Salary','Status','Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[11px] font-bold text-[#6F767E] dark:text-[#a1a1aa] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F4]">
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                  No Staff Records — Click "Add Staff" to add salary entries
                </td></tr>
              )}
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-[#F9FAFB] dark:hover:bg-[#2a2a35] transition-colors group">
                  <td className="px-5 py-4 font-bold text-gray-500 text-xs">{e.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#C7E3D4]/30 flex items-center justify-center text-[#27AE60] font-black">{e.name[0]}</div>
                      <div>
                        <p className="font-bold text-[#1A1D1F] dark:text-white text-sm">{e.name}</p>
                        {e.paidDate && <p className="text-[9px] text-gray-400">Paid: {e.paidDate}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{e.role}</td>
                  <td className="px-5 py-4 text-gray-500">{e.dept}</td>
                  <td className="px-5 py-4 font-bold text-[#1A1D1F] dark:text-white">₹{Number(e.basic).toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-400">₹{Number(e.hra).toLocaleString()}</td>
                  <td className="px-5 py-4 text-gray-400">₹{Number(e.allowance || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 text-red-400">-₹{Number(e.deduction || 0).toLocaleString()}</td>
                  <td className="px-5 py-4 font-black text-[#1A1D1F] dark:text-white">₹{Number(e.net).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-tighter ${e.status === 'Paid' ? STATUS_BADGE.Paid : STATUS_BADGE.Unpaid}`}>
                      {e.status === 'Paid' ? 'PAID' : 'UNPAID'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {e.status !== 'Paid' && (
                        <button onClick={() => handlePaySalary(e._id)} className="px-3 py-1.5 bg-[#DCEB8C] text-[#1A1D1F] rounded-xl text-[10px] font-bold hover:shadow-md flex items-center gap-1"><Check size={10}/>Pay Now</button>
                      )}
                      <button onClick={() => setEditStaff(e)} className="p-2 rounded-xl border border-[#EFF2F5] text-yellow-500 hover:bg-yellow-50 transition-colors"><Edit2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-5 bg-[#F7F9FB]/50 dark:bg-[#13131A]/50 flex justify-between items-center border-t border-[#F4F4F4] dark:border-[#2a2a35]">
          <p className="text-sm font-bold text-[#6F767E] uppercase opacity-60">{filtered.length} Staff Personnel</p>
          <p className="text-lg font-bold text-[#1A1D1F] dark:text-white">Total Net: <span className="text-[#27AE60]">₹{filtered.reduce((s,e) => s+Number(e.net||0), 0).toLocaleString()}</span></p>
        </div>
      </div>
    </div>
  );
}
