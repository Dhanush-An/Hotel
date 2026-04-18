import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download } from 'lucide-react';
import api from '../../services/api';

const monthlyData = [];
const roomRevenue = [];

export default function RevenueTab() {
  const [period, setPeriod] = useState('6months');
  
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bData, eData] = await Promise.all([
          api.getBookings('summary=true'),
          api.getExpenses()
        ]);

        setBookings(bData);
        setExpenses(eData);
      } catch (err) {
        console.error("Failed to fetch financial data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalProfit = totalRevenue - totalExpense;
  const avgOccupancy = 78;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  
  let targetMonths = [];
  if (period === 'year') {
    targetMonths = monthNames;
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      targetMonths.push(monthNames[d.getMonth()]);
    }
  }

  const monthlyMap = {};
  targetMonths.forEach(m => monthlyMap[m] = { month: m, revenue: 0, expense: 0, profit: 0 });

  bookings.forEach(b => {
    const d = new Date(b.checkin || b.createdAt);
    if (!isNaN(d)) {
        let match = false;
        if (period === 'year') {
          if (d.getFullYear() === now.getFullYear()) match = true;
        } else {
          const cut = new Date();
          cut.setMonth(now.getMonth() - 5);
          cut.setDate(1);
          cut.setHours(0,0,0,0);
          if (d >= cut) match = true;
        }

        if (match) {
          const m = monthNames[d.getMonth()];
          if (monthlyMap[m]) {
            const amt = Number(b.amount) || 0;
            monthlyMap[m].revenue += amt;
            monthlyMap[m].profit += amt;
          }
        }
    }
  });

  expenses.forEach(e => {
    const d = new Date(e.date || e.createdAt);
    if (!isNaN(d)) {
        let match = false;
        if (period === 'year') {
          if (d.getFullYear() === now.getFullYear()) match = true;
        } else {
          const cut = new Date();
          cut.setMonth(now.getMonth() - 5);
          cut.setDate(1);
          cut.setHours(0,0,0,0);
          if (d >= cut) match = true;
        }

        if (match) {
          const m = monthNames[d.getMonth()];
          if (monthlyMap[m]) {
            const amt = Number(e.amount) || 0;
            monthlyMap[m].expense += amt;
            monthlyMap[m].profit -= amt;
          }
        }
    }
  });

  let monthlyData = targetMonths.map(m => monthlyMap[m]);
  if (monthlyData.length === 0) {
    monthlyData.push({ month: monthNames[new Date().getMonth()], revenue: 0, expense: 0, profit: 0 });
  }

  const roomRevMap = {};
  bookings.forEach(b => {
      const type = b.type || 'Standard';
      if (!roomRevMap[type]) roomRevMap[type] = 0;
      roomRevMap[type] += (Number(b.amount) || 0);
  });
  const roomRevenue = Object.keys(roomRevMap).map(type => ({ type, revenue: roomRevMap[type] })).sort((a,b) => b.revenue - a.revenue);

  if (loading) return <div className="p-20 text-center opacity-40 animate-pulse">Calculating Global Revenue...</div>;

  const kpis = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, sub: 'from active bookings', up: true, color: 'bg-primary-500 text-white' },
    { label: 'Total Expenses', value: `₹${totalExpense.toLocaleString()}`, sub: 'from operations', up: false, color: 'bg-white dark:bg-[#1c1c24] text-gray-800 dark:text-white border border-border dark:border-[#2a2a35]' },
    { label: 'Net Profit', value: `₹${totalProfit.toLocaleString()}`, sub: 'revenue - expenses', up: totalProfit >= 0, color: totalProfit >= 0 ? 'bg-[#E3F9E5] dark:bg-[#1a221d] text-green-700 dark:text-green-400 border border-green-200 dark:border-[#1a221d]' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-[#2a2a35]' },
    { label: 'Avg Occupancy', value: `${avgOccupancy}%`, sub: 'running average', up: true, color: 'bg-white dark:bg-[#1c1c24] text-gray-800 dark:text-white border border-border dark:border-[#2a2a35]' },
  ];

  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,Month,Revenue (INR),Expenses (INR),Net Profit (INR)\n";
    monthlyData.forEach(d => {
      csvContent += `${d.month},${d.revenue},${d.expense},${d.profit}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hotel_Revenue_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`rounded-2xl p-5 shadow-card ${k.color}`}>
            <p className={`text-sm font-medium ${k.color.includes('primary-500') ? 'text-white/80' : 'text-gray-500 dark:text-[#a1a1aa]'}`}>{k.label}</p>
            <p className={`text-3xl font-bold mt-1 ${k.color.includes('primary-500') ? 'text-white' : ''}`}>{k.value}</p>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${k.up ? 'text-green-500' : 'text-red-400'} ${k.color.includes('primary-500') ? '!text-white/90' : ''}`}>
              {k.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Chart */}
        <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-6 shadow-card border border-border dark:border-[#2a2a35] lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Revenue vs Expense</h3>
              <p className="text-sm text-gray-500 dark:text-[#a1a1aa]">{period === 'year' ? 'This year overview' : '6-month comparison'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border dark:border-[#2a2a35] rounded-lg text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors">
                <Download size={13} /> Export
              </button>
              <select value={period} onChange={e => setPeriod(e.target.value)} className="px-3 py-1.5 border border-border dark:border-[#2a2a35] rounded-lg text-xs focus:outline-none">
                <option value="6months">Last 6 Months</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={v => `₹${v.toLocaleString()}`} />
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="revenue" fill="#C7E3D4" radius={[6,6,0,0]} name="Revenue" />
                <Bar dataKey="expense" fill="#DCEB8C" radius={[6,6,0,0]} name="Expense" />
                <Bar dataKey="profit" fill="#B5D1C2" radius={[6,6,0,0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Room Type */}
        <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-6 shadow-card border border-border dark:border-[#2a2a35]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Revenue by Room Type</h3>
          <div className="space-y-4">
            {roomRevenue.length === 0 && <p className="text-sm text-gray-500">No rooms booked yet.</p>}
            {roomRevenue.map((r, i) => {
              const colors = ['bg-primary-500', 'bg-accent', 'bg-primary-300', 'bg-gray-200 dark:bg-[#2a2a35]'];
              const pct = totalRevenue > 0 ? Math.round((r.revenue / totalRevenue) * 100) : 0;
              return (
                <div key={r.type}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-[#e4e4e7]">{r.type}</span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-800 dark:text-white">₹{(r.revenue).toLocaleString()}</span>
                      <span className="text-xs text-gray-400 dark:text-[#a1a1aa] ml-2">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-[#2a2a35] rounded-full overflow-hidden">
                    <div className={`h-full ${colors[i % 4]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#2a2a35]">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-[#a1a1aa] mb-3">Monthly Profit Trend</h4>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C7E3D4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C7E3D4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="profit" stroke="#C7E3D4" strokeWidth={2} fill="url(#profitGrad)" dot={false} />
                  <XAxis dataKey="month" hide />
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl shadow-card border border-border dark:border-[#2a2a35] overflow-hidden">
        <div className="px-6 py-4 border-b border-border dark:border-[#2a2a35] flex justify-between items-center">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">Monthly Revenue Breakdown</h3>
          <button onClick={handleExport} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-border dark:border-[#2a2a35] rounded-lg text-gray-600 dark:text-[#a1a1aa] hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors"><Download size={13} /> Download Report</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr>{['Month','Revenue','Expenses','Net Profit','Profit Margin','Occupancy'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
          </thead>
          <tbody>
            {monthlyData.map(d => {
              const margin = d.revenue > 0 ? Math.round((d.profit / d.revenue) * 100) : (d.expense > 0 ? -100 : 0);
              return (
                <tr key={d.month} className="hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors">
                  <td className="table-cell font-semibold text-gray-800 dark:text-white">{d.month} {new Date().getFullYear()}</td>
                  <td className="table-cell font-medium text-primary-600">₹{d.revenue.toLocaleString()}</td>
                  <td className="table-cell text-red-500">₹{d.expense.toLocaleString()}</td>
                  <td className="table-cell font-semibold text-gray-800 dark:text-white">₹{d.profit.toLocaleString()}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-[#2a2a35] rounded-full overflow-hidden w-16">
                        <div className={`h-full ${margin >= 0 ? 'bg-accent' : 'bg-red-500'} rounded-full`} style={{ width: `${Math.min(Math.abs(margin), 100)}%` }}></div>
                      </div>
                      <span className={`text-xs font-medium ${margin >= 0 ? 'text-gray-600 dark:text-[#a1a1aa]' : 'text-red-500'}`}>{margin}%</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs font-medium bg-primary-50 dark:bg-[#1a221d] text-primary-700 px-2 py-1 rounded-full">{avgOccupancy}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
