import React, { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Download, ChevronDown, X, Banknote } from 'lucide-react';

const STAFF_SALARY = [];

const STATUS_BADGE = {
  Paid: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  'On Hold': 'bg-red-100 text-red-600',
};

export default function SalaryTab() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterDept, setFilterDept] = useState('All');

  const totalPayroll = STAFF_SALARY.reduce((s, e) => s + e.net, 0);
  const paid = STAFF_SALARY.filter(e => e.status === 'Paid').reduce((s, e) => s + e.net, 0);
  const pending = STAFF_SALARY.filter(e => e.status === 'Pending').reduce((s, e) => s + e.net, 0);

  const filtered = STAFF_SALARY.filter(e => {
    const q = search.toLowerCase();
    return (e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      && (filterStatus === 'All' || e.status === filterStatus)
      && (filterDept === 'All' || e.dept === filterDept);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total Payroll', value: `₹${(totalPayroll/1000).toFixed(0)}K`, color: 'bg-blue-50 text-blue-700' },
          { label: 'Paid', value: `₹${(paid/1000).toFixed(0)}K`, color: 'bg-green-50 text-green-700' },
          { label: 'Pending', value: `₹${(pending/1000).toFixed(0)}K`, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Total Staff', value: STAFF_SALARY.length, color: 'bg-purple-50 text-purple-700' },
          { label: 'Paid Count', value: STAFF_SALARY.filter(e => e.status === 'Paid').length, color: 'bg-green-50 text-green-600' },
          { label: 'Unpaid Count', value: STAFF_SALARY.filter(e => e.status !== 'Paid').length, color: 'bg-red-50 text-red-600' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 border border-border dark:border-[#2a2a35] shadow-card flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff..." className="pl-9 pr-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 w-48" />
          </div>
          {[
            [filterStatus, setFilterStatus, ['All','Paid','Pending','On Hold'], 'Status'],
            [filterDept, setFilterDept, ['All','Management','Front Office','Housekeeping','Operations'], 'Dept'],
          ].map(([val, setter, options, label]) => (
            <div key={label} className="relative">
              <select value={val} onChange={e => setter(e.target.value)} className="pl-3 pr-8 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none appearance-none">
                {options.map(o => <option key={o}>{o === 'All' ? `All ${label === 'Status' ? 'Statuses' : label + 's'}` : o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa] pointer-events-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A]"><Download size={15} /> Export Payroll</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600"><Banknote size={15} /> Release All</button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl shadow-card border border-border dark:border-[#2a2a35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>{['Emp ID','Name','Role','Dept','Basic','HRA','Allowance','Deductions','Net Salary','Month','Status','Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors">
                  <td className="table-cell font-semibold text-gray-700 dark:text-[#e4e4e7]">{e.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">{e.name[0]}</div>
                      <span className="font-medium text-gray-800 dark:text-white">{e.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-500 dark:text-[#a1a1aa]">{e.role}</td>
                  <td className="table-cell">{e.dept}</td>
                  <td className="table-cell">₹{e.basic.toLocaleString()}</td>
                  <td className="table-cell text-gray-500 dark:text-[#a1a1aa]">₹{e.hra.toLocaleString()}</td>
                  <td className="table-cell text-gray-500 dark:text-[#a1a1aa]">₹{e.allowance.toLocaleString()}</td>
                  <td className="table-cell text-red-500">-₹{e.deductions.toLocaleString()}</td>
                  <td className="table-cell font-bold text-gray-800 dark:text-white">₹{e.net.toLocaleString()}</td>
                  <td className="table-cell text-gray-500 dark:text-[#a1a1aa]">{e.month}</td>
                  <td className="table-cell"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[e.status]}`}>{e.status}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-500"><Eye size={14} /></button>
                      {e.status !== 'Paid' && <button className="text-xs px-3 py-1 rounded-lg bg-primary-500 text-white hover:bg-primary-600">Pay Now</button>}
                      <button className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/40 text-purple-500"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#2a2a35] bg-gray-50 dark:bg-[#13131A] flex justify-between">
          <span className="text-sm text-gray-500 dark:text-[#a1a1aa]">{filtered.length} staff members</span>
          <span className="text-sm font-bold text-gray-800 dark:text-white">Total Net: ₹{filtered.reduce((s,e) => s+e.net, 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
