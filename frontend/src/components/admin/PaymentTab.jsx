import React, { useState, useEffect } from 'react';
import { Search, Eye, Download, CreditCard, Smartphone, Banknote, Building2, CheckCircle, Clock, XCircle, ChevronDown, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const safeDate = () => new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});

const METHOD_ICON = {
  Card: CreditCard,
  UPI: Smartphone,
  Cash: Banknote,
  'Bank Transfer': Building2,
};

const STATUS_BADGE = {
  Completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  Pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  Partial: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  Failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  Refunded: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const STATUS_ICON = {
  Completed: <CheckCircle size={14} className="text-green-500" />,
  Pending: <Clock size={14} className="text-yellow-500" />,
  Partial: <Clock size={14} className="text-orange-500" />,
  Failed: <XCircle size={14} className="text-red-500" />,
};

import api from '../../services/api';

export default function PaymentTab() {
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [PAYMENTS, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Fetch only recent summary for fast dashboard load
      const [pData, bData] = await Promise.all([
        api.getPayments('limit=100'),
        api.getBookings('limit=100&summary=true')
      ]);

      const bMap = new Map(bData.map(b => [(b._id || b.id || '').toString(), b]));
      const existingPaymentBookingIds = new Set(pData.map(p => (p.booking || p.bookingId || '').toString()));
      
      // Normalize actual payments
      const normalized = pData.map(p => {
        const bId = (p.booking || p.bookingId || '').toString();
        const b = bMap.get(bId);
        return {
          ...p,
          id: p.id || p._id,
          booking: bId,
          guest: p.guest || (b ? b.guest : 'Guest'),
          room: p.room || (b ? b.room : 'N/A'),
          amount: p.amount || 0,
          method: p.method || 'Card',
          date: p.date || p.createdAt,
          status: p.status || 'Completed',
          ref: p.ref || p.transactionId || 'N/A'
        };
      });

      // Derive payments for bookings that don't have an explicit payment record yet
      const derived = bData
        .filter(b => !existingPaymentBookingIds.has((b._id || b.id || '').toString()))
        .map(b => ({
          id: `PAY-${(b._id || b.id || '').toString().slice(-4)}`,
          booking: (b._id || b.id || '').toString(),
          guest: b.guest || 'Unknown Guest',
          room: b.room || 'N/A',
          amount: b.amount || 0,
          method: b.method || 'Cash',
          date: b.createdAt || new Date().toISOString(),
          status: b.payment === 'Paid' ? 'Completed' : b.payment === 'Pending' ? 'Pending' : 'Partial',
          ref: `REF${Math.floor(10000000 + Math.random() * 90000000)}`
        }));

      // Combine and sort by date
      const combined = [...normalized, ...derived].sort((a, b) => new Date(b.date) - new Date(a.date));
      setPayments(combined);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL payment records? This cannot be undone.')) {
      try {
        await api.deleteAllPayments();
        setPayments([]);
      } catch (error) {
        alert('Delete all error: ' + error.message);
      }
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleExport = async () => {
    try {
      setLoading(true);
      // Fetch ALL data only for export
      const [fullPayments, fullBookings] = await Promise.all([
        api.getPayments('all=true'),
        api.getBookings('all=true&summary=true')
      ]);

      const bMap = new Map(fullBookings.map(b => [(b._id || b.id || '').toString(), b]));
      const existingIds = new Set(fullPayments.map(p => (p.booking || p.bookingId || '').toString()));
      
      const normalized = fullPayments.map(p => {
        const bId = (p.booking || p.bookingId || '').toString();
        const b = bMap.get(bId);
        return {
          id: p.id || p._id,
          booking: bId,
          guest: p.guest || (b ? b.guest : 'Guest'),
          room: p.room || (b ? b.room : 'N/A'),
          amount: p.amount || 0,
          method: p.method || 'Card',
          date: p.date || p.createdAt,
          status: p.status || 'Completed',
          ref: p.ref || p.transactionId || 'N/A'
        };
      });

      const derived = fullBookings
        .filter(b => !existingIds.has((b._id || b.id || '').toString()))
        .map(b => ({
          id: `PAY-${(b._id || b.id || '').toString().slice(-4)}`,
          booking: (b._id || b.id || '').toString(),
          guest: b.guest || 'Guest',
          room: b.room || 'N/A',
          amount: b.amount || 0,
          method: b.method || 'Cash',
          date: b.createdAt || new Date().toISOString(),
          status: b.payment === 'Paid' ? 'Completed' : 'Pending',
          ref: 'REF_DERIVED'
        }));
      
      const allData = [...normalized, ...derived].sort((a,b) => new Date(b.date) - new Date(a.date));

      const headers = ['Payment ID','Booking ID','Guest','Room','Amount','Method','Date','Status','Ref No.'];
      const csvLines = [headers.join(',')];
      
      allData.forEach(p => {
        const row = [
          p.id,
          p.booking,
          p.guest,
          p.room,
          p.amount,
          p.method,
          new Date(p.date).toLocaleString(),
          p.status,
          p.ref
        ];
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
      link.download = `payments_full_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleViewDetails = (p) => {
    setSelectedInvoice(p);
  };

  const handleDownloadInvoice = (p) => {
    try {
      const doc = new jsPDF();
      
      // Business Header
      doc.setFontSize(22);
      doc.setTextColor(0, 122, 122); // Hotel Primary Color
      doc.text('HOTEL SHUBHA SAI', 105, 20, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Plot No. 145/14, 2nd Cross, Behind Priyanka Petrol Bunk, Bommasandra Ind. Area, Bangalore', 105, 26, { align: 'center' });
      doc.line(20, 32, 190, 32);

      // Bill Details
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Official Payment Receipt`, 20, 45);
      
      doc.setFontSize(9);
      doc.text(`Guest: ${p.guest}`, 20, 52);
      doc.text(`Room: ${p.room}`, 20, 57);
      
      doc.text(`Receipt No: ${p.id}`, 140, 52);
      doc.text(`Date: ${new Date(p.date).toLocaleString()}`, 140, 57);

      // Table
      autoTable(doc, {
        startY: 65,
        head: [['Description', 'Reference', 'Status', 'Total']],
        body: [
          ['Hotel Stay / Services', p.ref, p.status, `INR ${Number(p.amount).toLocaleString()}`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 122, 122] },
        margin: { top: 65 }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 122, 122);
      doc.text(`Total Paid: INR ${Number(p.amount).toLocaleString()}`, 140, finalY);

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('This is a computer-generated receipt. No signature required.', 105, 280, { align: 'center' });

      doc.save(`Invoice_${p.id}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please check console.");
    }
  };

  const totalCollected = PAYMENTS.filter(p => (p.status || '').toLowerCase() === 'completed').reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPending = PAYMENTS.filter(p => (p.status || '').toLowerCase() === 'pending').reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const stats = [
    { label: 'Total Collected', value: `₹${totalCollected.toLocaleString()}`, color: 'bg-green-50 text-green-700', icon: CheckCircle },
    { label: 'Pending Payments', value: `₹${totalPending.toLocaleString()}`, color: 'bg-yellow-50 text-yellow-700', icon: Clock },
    { label: 'Total Transactions', value: PAYMENTS.length, color: 'bg-blue-50 text-blue-700', icon: CreditCard },
    { label: 'Via Card', value: PAYMENTS.filter(p => p.method === 'Card').length, color: 'bg-purple-50 text-purple-700', icon: CreditCard },
    { label: 'Via UPI', value: PAYMENTS.filter(p => p.method === 'UPI').length, color: 'bg-orange-50 text-orange-600', icon: Smartphone },
    { label: 'Via Cash', value: PAYMENTS.filter(p => p.method === 'Cash').length, color: 'bg-gray-100 dark:bg-[#2a2a35] text-gray-700 dark:text-[#e4e4e7]', icon: Banknote },
  ];

  const filtered = PAYMENTS.filter(p => {
    const q = (search || '').toLowerCase();
    const guest = (p.guest || '').toLowerCase();
    const id = (p.id || '').toLowerCase();
    const bId = (p.booking || '').toLowerCase();
    
    return (guest.includes(q) || id.includes(q) || bId.includes(q))
      && (filterMethod === 'All' || p.method === filterMethod)
      && (filterStatus === 'All' || p.status === filterStatus);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
              <Icon size={20} className="mx-auto mb-1 opacity-80" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 border border-border dark:border-[#2a2a35] shadow-card flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest / payment ID..." className="pl-9 pr-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 w-56" />
          </div>
          {[
            [filterMethod, setFilterMethod, ['All','Card','UPI','Cash','Bank Transfer'], 'Method'],
            [filterStatus, setFilterStatus, ['All','Completed','Pending','Partial','Refunded'], 'Status'],
          ].map(([val, setter, options, label]) => (
            <div key={label} className="relative">
              <select value={val} onChange={e => setter(e.target.value)} className="pl-3 pr-8 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none appearance-none">
                {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label === 'Status' ? 'Statuses' : label + 's'}` : o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa] pointer-events-none" />
            </div>
          ))}
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A]"><Download size={15} /> Export</button>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl shadow-card border border-border dark:border-[#2a2a35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>{['Room','Amount','Method','Date','Status','Ref No.','Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
            </thead>
            <tbody>
                {filtered.map(p => {
                  const Icon = METHOD_ICON[p.method] || CreditCard;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors">
                    <td className="table-cell">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-white">{p.room}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{p.guest}</span>
                      </div>
                    </td>
                    <td className="table-cell font-semibold text-gray-800 dark:text-white">₹{p.amount.toLocaleString()}</td>
                    <td className="table-cell">
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-[#a1a1aa]">
                        <Icon size={14} className="text-gray-400 dark:text-[#a1a1aa]" /> {p.method}
                      </span>
                    </td>
                    <td className="table-cell text-xs font-medium">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${STATUS_BADGE[p.status] || 'bg-gray-100 text-gray-600'}`}>
                         {p.status === 'Completed' ? 'PAID' : (p.status === 'Pending' ? 'UNPAID' : p.status)}
                      </span>
                    </td>
                    <td className="table-cell font-mono text-gray-400 text-[10px] font-bold">{p.ref}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleViewDetails(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a35] rounded-xl text-gray-400 hover:text-primary-500 transition-all"><Eye size={16} /></button>
                        <button onClick={() => handleDownloadInvoice(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a35] rounded-xl text-gray-400 hover:text-purple-500 transition-all"><Download size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#2a2a35] bg-gray-50 dark:bg-[#13131A] flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-[#a1a1aa]">{filtered.length} transactions</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">Total: ₹{filtered.reduce((s,p) => s+p.amount, 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-[#1c1c24] w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden border border-border dark:border-[#2a2a35]">
              <div className="p-8 border-b border-gray-100 dark:border-[#2a2a35] flex items-center justify-between bg-primary-50/50 dark:bg-primary-900/5">
                 <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Payment Invoice</h2>
                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mt-1">Official Digital Receipt</p>
                 </div>
                 <button onClick={() => setSelectedInvoice(null)} className="p-2.5 rounded-2xl hover:bg-white dark:hover:bg-[#2a2a35] text-gray-400 transition-all border border-border dark:border-[#2a2a35]"><XCircle size={20} /></button>
              </div>
              
              <div className="p-8 space-y-8">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guest Details</p>
                       <h4 className="text-lg font-black text-gray-800 dark:text-white">{selectedInvoice.guest}</h4>
                       <p className="text-xs font-bold text-gray-500">Room: {selectedInvoice.room}</p>
                    </div>
                    <div className="text-right space-y-1">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Ref</p>
                       <p className="text-xs font-mono font-black text-gray-600 dark:text-gray-300">{selectedInvoice.ref}</p>
                       <p className="text-[9px] font-bold text-gray-400">{new Date(selectedInvoice.date).toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="bg-gray-50 dark:bg-[#13131A] rounded-2xl p-6 border border-gray-100 dark:border-[#2a2a35] space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-[#2a2a35]">
                       <span className="text-xs font-bold text-gray-500 uppercase">Payment Method</span>
                       <span className="text-sm font-black text-gray-800 dark:text-white flex items-center gap-2">
                          {(METHOD_ICON[selectedInvoice.method] || CreditCard) && React.createElement(METHOD_ICON[selectedInvoice.method] || CreditCard, {size: 14})}
                          {selectedInvoice.method}
                       </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-[#2a2a35]">
                       <span className="text-xs font-bold text-gray-500 uppercase">Current Status</span>
                       <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${STATUS_BADGE[selectedInvoice.status]}`}>{selectedInvoice.status}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Total Paid</span>
                       <h3 className="text-3xl font-black text-primary-600 tracking-tighter">₹{selectedInvoice.amount.toLocaleString()}</h3>
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button 
                       onClick={() => handleDownloadInvoice(selectedInvoice)}
                       className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
                    >
                       <Download size={16} /> Download Copy
                    </button>
                    <button 
                       onClick={() => window.print()}
                       className="px-6 py-4 bg-white dark:bg-[#2a2a35] text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-200 dark:border-[#2a2a35] font-black text-xs uppercase tracking-widest"
                    >
                       Print
                    </button>
                 </div>
              </div>
              <div className="px-8 py-4 bg-gray-50 dark:bg-[#13131A] text-center">
                 <p className="text-[9px] font-bold text-gray-400 tracking-wider">Thank you for choosing Hotel Shubha Sai. This is a computer-generated receipt.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
