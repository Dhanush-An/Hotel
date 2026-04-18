import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Download, CheckCircle, XCircle, ChevronDown, X, Receipt, Upload } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORIES = ['Staff Salary','Maintenance','Electricity Bill','Water Bill','Food Supplies','Laundry','Internet','Rent','Marketing','Miscellaneous'];

const STATUS_BADGE = {
  Paid: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-blue-100 text-blue-700',
  Rejected: 'bg-red-100 text-red-600',
};

const ExpenseModal = ({ expense, onClose, onSaved }) => {
  const isEdit = !!expense?.id;
  const [form, setForm] = useState(expense || {
    title: '', category: CATEGORIES[0], amount: 0, date: new Date().toISOString().split('T')[0],
    dept: 'Operations', method: 'Cash', status: 'Paid', notes: ''
  });
  const handleChange = (field, value) => setForm(p => ({ ...p, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-xl rounded-2xl shadow-premium overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-[#2a2a35]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEdit ? 'Edit Expense' : 'Add New Expense'}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a2a35] text-gray-500"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Expense Title</label>
              <input value={form.title} onChange={e => handleChange('title', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="e.g. Electricity Bill March" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Category</label>
              <select value={form.category} onChange={e => handleChange('category', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={e => handleChange('amount', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Department</label>
              <select value={form.dept} onChange={e => handleChange('dept', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option>Kitchen</option><option>Housekeeping</option><option>Admin</option><option>Operations</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Payment Method</label>
              <select value={form.method} onChange={e => handleChange('method', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Payment Status</label>
              <select value={form.status} onChange={e => handleChange('status', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option>Paid</option><option>Pending</option><option>Approved</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => handleChange('notes', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border dark:border-[#2a2a35] flex justify-end gap-3 bg-gray-50/50 dark:bg-[#13131a]/30">
          <button onClick={onClose} className="px-6 py-2.5 border border-border dark:border-[#2a2a35] rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSaved({
            id: form.id || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
            title: form.title || 'Untitled Expense',
            category: form.category, dept: form.dept, amount: Number(form.amount) || 0,
            date: form.date, method: form.method, status: form.status,
            approvedBy: form.status === 'Paid' || form.status === 'Approved' ? 'Admin' : '—',
            notes: form.notes
          })} className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600">
            {isEdit ? 'Update Expense' : 'Save Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ViewExpenseModal = ({ expense, onClose }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-[#1c1c24] w-full max-w-md rounded-2xl shadow-premium overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-[#2a2a35]">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Expense Details</h2>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
      </div>
      <div className="p-6 space-y-4">
        {[
          ['ID', expense.id], ['Title', expense.title], ['Category', expense.category],
          ['Department', expense.dept], ['Amount', `₹${Number(expense.amount).toLocaleString()}`],
          ['Date', expense.date], ['Method', expense.method], ['Status', expense.status],
          ['Approved By', expense.approvedBy], ['Notes', expense.notes || '—']
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-4">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest min-w-[100px]">{label}</span>
            <span className="text-sm font-bold text-gray-800 dark:text-white text-right">{value}</span>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-border flex justify-end">
        <button onClick={onClose} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold">Close</button>
      </div>
    </div>
  </div>
);

import api from '../../services/api';

export default function ExpensesTab() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewExpense, setViewExpense] = useState(null);
  const [editExpense, setEditExpense] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSave = async (exp) => {
    try {
      if (editExpense) {
        const updated = await api.updateExpense(editExpense._id, exp);
        setExpenses(prev => prev.map(e => e._id === updated._id ? updated : e));
        setEditExpense(null);
      } else {
        const created = await api.createExpense(exp);
        setExpenses(prev => [created, ...prev]);
        setShowModal(false);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        const expense = expenses.find(e => e.id === id || e._id === id);
        await api.deleteExpense(expense._id);
        setExpenses(prev => prev.filter(e => e._id !== expense._id));
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      const expense = expenses.find(e => e.id === id || e._id === id);
      const updated = await api.updateExpense(expense._id, { status: 'Approved', approvedBy: 'Admin' });
      setExpenses(prev => prev.map(e => e._id === updated._id ? updated : e));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const expense = expenses.find(e => e.id === id || e._id === id);
      const updated = await api.updateExpense(expense._id, { status: 'Rejected', approvedBy: 'Admin' });
      setExpenses(prev => prev.map(e => e._id === updated._id ? updated : e));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleExport = () => {
    try {
      const headers = ['ID','Title','Category','Dept','Amount','Date','Method','Status','Approved By','Notes'];
      const csvLines = [headers.join(',')];
      
      expenses.forEach(e => {
        const row = [e.id, e.title, e.category, e.dept, e.amount, e.date, e.method, e.status, e.approvedBy, e.notes || ''];
        const escaped = row.map(val => {
          const s = String(val === undefined || val === null ? '' : val).replace(/"/g, '""');
          return s.includes(',') ? `"${s}"` : s;
        });
        csvLines.push(escaped.join(','));
      });

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("CSV Export failed: " + err.message);
    }
  };
  
  const handleDownloadVoucher = (e) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 122, 122);
      doc.text('HOTEL SHUBHA SAI', 105, 20, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Expense Voucher & Receipt', 105, 26, { align: 'center' });
      doc.line(20, 32, 190, 32);

      // Details
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Voucher ID: ${e.id}`, 20, 45);
      doc.text(`Date: ${e.date}`, 140, 45);

      autoTable(doc, {
        startY: 55,
        head: [['Category', 'Description', 'Method', 'Status', 'Total']],
        body: [[
          e.category,
          e.title,
          e.method,
          e.status,
          `INR ${Number(e.amount).toLocaleString()}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [0, 122, 122] },
        styles: { fontSize: 9 }
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      if (e.notes) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Notes: ${e.notes}`, 20, finalY);
      }

      const totalY = finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 122, 122);
      doc.text(`Total Amount: INR ${Number(e.amount).toLocaleString()}`, 140, totalY, { align: 'right' });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Official Business Document - Hotel Shubha Sai', 105, 280, { align: 'center' });

      doc.save(`Expense_${e.id}.pdf`);
    } catch (err) {
      console.error("Voucher PDF generation failed:", err);
      alert("Failed to generate Voucher PDF. Check console.");
    }
  };

  const totalToday = expenses.filter(e => e.date === new Date().toISOString().split('T')[0]).reduce((s, e) => s + Number(e.amount), 0);
  const totalMonth = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const pending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + Number(e.amount), 0);
  const approved = expenses.filter(e => e.status === 'Approved' || e.status === 'Paid').reduce((s, e) => s + Number(e.amount), 0);

  const stats = [
    { label: "Today's Expenses", value: `₹${totalToday.toLocaleString()}`, color: 'bg-orange-50 text-orange-600' },
    { label: 'Monthly Expenses', value: `₹${totalMonth.toLocaleString()}`, color: 'bg-red-50 text-red-600' },
    { label: 'Yearly Expenses', value: `₹${totalMonth.toLocaleString()}`, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pending Payments', value: `₹${pending.toLocaleString()}`, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Approved/Paid', value: `₹${approved.toLocaleString()}`, color: 'bg-green-50 text-green-700' },
    { label: 'Records', value: expenses.length, color: 'bg-primary-100 text-primary-700' },
  ];

  const filtered = expenses.filter(e => {
    const q = search.toLowerCase();
    return (e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))
      && (filterCat === 'All' || e.category === filterCat)
      && (filterStatus === 'All' || e.status === filterStatus);
  });

  return (
    <div className="space-y-6">
      {showModal && <ExpenseModal onClose={() => setShowModal(false)} onSaved={handleSave} />}
      {editExpense && <ExpenseModal expense={editExpense} onClose={() => setEditExpense(null)} onSaved={handleSave} />}
      {viewExpense && <ViewExpenseModal expense={viewExpense} onClose={() => setViewExpense(null)} />}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-[#a1a1aa] mb-3">Expense Categories</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilterCat(filterCat === c ? 'All' : c)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${filterCat === c ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-[#1c1c24] border-border dark:border-[#2a2a35] text-gray-600 dark:text-[#a1a1aa] hover:bg-primary-50 hover:border-primary-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 border border-border dark:border-[#2a2a35] shadow-card flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search expense..." className="pl-9 pr-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 w-52" />
          </div>
          <div className="relative">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="pl-3 pr-8 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none appearance-none">
              {['All','Paid','Pending','Approved','Rejected'].map(o => <option key={o} value={o}>{o === 'All' ? 'All Statuses' : o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#2a2a35] transition-colors">
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 shadow-sm">
            <Plus size={15} /> Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl shadow-card border border-border dark:border-[#2a2a35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>{['Exp ID','Title','Category','Dept','Amount','Date','Method','Status','Approved By','Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors">
                  <td className="table-cell font-semibold text-gray-700 dark:text-[#e4e4e7]">{e.id}</td>
                  <td className="table-cell font-medium text-gray-800 dark:text-white">{e.title}</td>
                  <td className="table-cell"><span className="bg-primary-50 dark:bg-[#1a221d] text-primary-700 text-xs px-2 py-0.5 rounded-full">{e.category}</span></td>
                  <td className="table-cell">{e.dept}</td>
                  <td className="table-cell font-semibold text-gray-800 dark:text-white">₹{Number(e.amount).toLocaleString()}</td>
                  <td className="table-cell">{e.date}</td>
                  <td className="table-cell text-gray-500 dark:text-[#a1a1aa]">{e.method}</td>
                  <td className="table-cell"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[e.status]}`}>{e.status}</span></td>
                  <td className="table-cell">{e.approvedBy}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setViewExpense(e)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-500 transition-colors" title="View"><Eye size={14} /></button>
                      <button onClick={() => setEditExpense(e)} className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/40 text-yellow-500 transition-colors" title="Edit"><Edit2 size={14} /></button>
                      {e.status === 'Pending' && <>
                        <button onClick={() => handleApprove(e.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition-colors" title="Approve"><CheckCircle size={14} /></button>
                        <button onClick={() => handleReject(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Reject"><XCircle size={14} /></button>
                      </>}
                      <button onClick={() => handleDownloadVoucher(e)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors" title="Download Voucher"><Download size={14} /></button>
                      <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest">No Expenses Found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border dark:border-[#2a2a35] flex items-center justify-between bg-gray-50 dark:bg-[#13131A]">
          <span className="text-sm text-gray-500 dark:text-[#a1a1aa]">{filtered.length} records found</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">Total: ₹{filtered.reduce((s,e) => s+Number(e.amount),0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
