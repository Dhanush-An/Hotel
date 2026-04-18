import React, { useState, useEffect } from 'react';
import { 
  Calendar, RefreshCcw, DollarSign, ArrowUpRight, ArrowDownRight, 
  MoreHorizontal, Plus, Search, Bell, Settings, ArrowRight, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

import api from '../services/api';

const Overview = ({ setActiveTab }) => {
  const [bookings, setBookings] = useState([]);
  const [rawStats, setRawStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revPeriod, setRevPeriod] = useState('6months');


  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setBookings(data.bookings || []);
      setRawStats(data);
    } catch (e) {
      console.error("Overview data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);



  const stats = rawStats ? {
    bookings: bookings.length,
    checkIn: rawStats.bookingCounts?.find(b => b._id === 'Checked In')?.count || 0,
    checkOut: rawStats.bookingCounts?.find(b => b._id === 'Checked Out')?.count || 0,
    revenue: rawStats.bookingCounts?.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0) || 0
  } : {
    bookings: 0,
    checkIn: 0,
    checkOut: 0,
    revenue: 0
  };

  const roomCounts = rawStats?.roomCounts || [];
  const roomStats = {
    total: roomCounts.reduce((sum, r) => sum + r.count, 0),
    available: roomCounts.find(r => r._id === 'Available')?.count || 0,
    occupied: (roomCounts.find(r => r._id === 'Occupied')?.count || 0) + (roomCounts.find(r => r._id === 'Booked')?.count || 0),
    reserved: roomCounts.find(r => r._id === 'Reserved')?.count || 0,
    notReady: roomCounts.find(r => r._id === 'Maintenance')?.count || 0
  };


  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  let targetMonths = [];
  if (revPeriod === 'year') {
    targetMonths = monthNames;
  } else {
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      targetMonths.push(d.toLocaleString('default', { month: 'short' }) || monthNames[d.getMonth()]);
    }
  }

  const revenueByMonth = {};
  targetMonths.forEach(m => revenueByMonth[m] = 0);

  bookings.forEach(b => {
    if (!b?.checkin) return;
    const d = new Date(b.checkin);
    let match = false;
    if (revPeriod === 'year') {
      if (d.getFullYear() === now.getFullYear()) match = true;
    } else {
      const cut = new Date();
      cut.setMonth(now.getMonth() - 5);
      cut.setDate(1);
      cut.setHours(0,0,0,0);
      if (d >= cut && d <= now) match = true;
    }
    if (match) {
      const m = d.toLocaleString('default', { month: 'short' });
      if (revenueByMonth[m] !== undefined) revenueByMonth[m] += (Number(b?.amount) || 0);
    }
  });

  const revenueData = targetMonths.map(m => ({ name: m, revenue: revenueByMonth[m] }));

  const platformCount = bookings.reduce((acc, b) => {
    if (b?.source) {
       acc[b.source] = (acc[b.source] || 0) + 1;
    }
    return acc;
  }, {});

  const platformData = bookings.length > 0 ? Object.entries(platformCount).map(([name, count]) => ({
    name, value: Math.round((count / bookings.length) * 100), color: name === 'Direct' ? '#C7E3D4' : name === 'Booking.com' ? '#DCEB8C' : '#1A1D1F'
  })) : [];

  const resData = Object.entries(revenueByMonth).map(([name, rev]) => ({
     name, booked: bookings.filter(b => b?.checkin && new Date(b.checkin).toLocaleString('default', { month: 'short' }) === name).length,
     canceled: 0
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-8 overflow-hidden animate-in fade-in duration-700">
      {/* Main Dashboard Feed */}
      <div className="flex-1 space-y-8 min-w-0">
        

        {/* KPI Top Row Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#E9F5EF] dark:bg-[#1a221d] rounded-[24px] p-6 shadow-sm border border-transparent hover:border-[#C7E3D4] transition-all relative overflow-hidden group flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 p-4 opacity-50"><Calendar size={18} /></div>
            <p className="text-[12px] font-bold text-[#1A1D1F]/60 dark:text-white/60 uppercase tracking-widest mb-1 w-full px-2 truncate">New Bookings</p>
            <h3 className="text-3xl font-bold text-[#1A1D1F] dark:text-white mb-4">{stats.bookings}</h3>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#1A1D1F]/60 dark:text-white/60 bg-white/40 dark:bg-[#1c1c24]/40 w-fit max-w-full px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis">
              <ArrowUpRight size={14} className="text-gray-400 dark:text-[#a1a1aa] shrink-0" /> 8.70% <span className="font-normal opacity-70 truncate">from last week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1c24] rounded-[24px] p-6 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] hover:border-[#F4F4F4] dark:border-[#2a2a35] transition-all relative overflow-hidden group flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 p-4 bg-[#E9F5EF] dark:bg-[#1a221d] rounded-bl-[20px] text-[#27AE60] opacity-80"><ArrowRight size={18} /></div>
            <p className="text-[12px] font-bold text-[#1A1D1F]/60 dark:text-white/60 uppercase tracking-widest mb-1 w-full px-2 truncate">Check-In</p>
            <h3 className="text-3xl font-bold text-[#1A1D1F] dark:text-white mb-4">{stats.checkIn}</h3>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#1A1D1F]/60 bg-[#DCEB8C] w-fit max-w-full px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis">
               3.56% <span className="font-normal opacity-70 truncate">from last week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1c24] rounded-[24px] p-6 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] hover:border-[#F4F4F4] dark:border-[#2a2a35] transition-all relative overflow-hidden group flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 p-4 bg-[#FFE7E4] dark:bg-[#2a1a1c] rounded-bl-[20px] text-[#FF6A55] opacity-80"><ArrowRight size={18} className="rotate-180" /></div>
            <p className="text-[12px] font-bold text-[#1A1D1F]/60 dark:text-white/60 uppercase tracking-widest mb-1 w-full px-2 truncate">Check-Out</p>
            <h3 className="text-3xl font-bold text-[#1A1D1F] dark:text-white mb-4">{stats.checkOut}</h3>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#FF6A55] bg-[#FFE7E4] dark:bg-[#2a1a1c] w-fit max-w-full px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis">
              <ArrowDownRight size={14} className="shrink-0" /> 1.06% <span className="font-normal opacity-70 truncate">from last week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1c24] rounded-[24px] p-6 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] hover:border-[#F4F4F4] dark:border-[#2a2a35] transition-all relative overflow-hidden group flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 p-4 bg-[#E9F5EF] dark:bg-[#1a221d] rounded-bl-[20px] text-[#27AE60] opacity-80 font-bold">$</div>
            <p className="text-[12px] font-bold text-[#1A1D1F]/60 dark:text-white/60 uppercase tracking-widest mb-1 w-full px-2 truncate">Total Revenue</p>
            <h3 className="text-3xl font-bold text-[#1A1D1F] dark:text-white mb-4">₹{stats.revenue.toLocaleString()}</h3>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#1A1D1F]/60 bg-[#DCEB8C] w-fit max-w-full px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis">
               5.70% <span className="font-normal opacity-70 truncate">from last week</span>
            </div>
          </div>
        </div>

        {/* Middle Section: Rooms and Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Room Availability Card */}
          <div className="lg:col-span-4 bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Room Availability</h3>
             </div>
              <div className="h-20 w-full flex rounded-2xl overflow-hidden mb-10 bg-[#F4F4F4] dark:bg-[#2a2a35] p-1.5 gap-1.5">
                 <div className="bg-[#BAE6FD] rounded-xl transition-all duration-500" style={{width: `${(roomStats.occupied/roomStats.total)*100}%`}}></div>
                 <div className="bg-[#D1FAE5] rounded-xl transition-all duration-500" style={{width: `${(roomStats.available/roomStats.total)*100}%`}}></div>
                 <div className="bg-[#1A1D1F] rounded-xl transition-all duration-500" style={{width: `${(roomStats.notReady/roomStats.total)*100}%`}}></div>
              </div>
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 w-full">
                {[
                  { label: 'Occupied', value: roomStats.occupied, border: 'border-l-4 border-[#BAE6FD]' },
                  { label: 'Reserved', value: roomStats.reserved, border: 'border-l-4 border-[#DCE775]' },
                  { label: 'Available', value: roomStats.available, border: 'border-l-4 border-[#D1FAE5]' },
                  { label: 'Not Ready', value: roomStats.notReady, border: 'border-l-4 border-[#1A1D1F]' },
                ].map(x => (
                  <div key={x.label} className={cn("pl-3 py-1", x.border)}>
                     <p className="text-xs font-bold text-[#6F767E] dark:text-[#a1a1aa] opacity-60 uppercase">{x.label}</p>
                     <p className="text-2xl font-bold text-[#1A1D1F] dark:text-white mt-0.5">{x.value}</p>
                  </div>
                ))}
              </div>
          </div>

          {/* Revenue Smooth Chart */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] relative overflow-hidden">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Revenue</h3>
               <button onClick={() => setRevPeriod(p => p === '6months' ? 'year' : '6months')} className="flex items-center gap-2 bg-[#DCEB8C] text-[#1A1D1F] px-5 py-2 rounded-2xl text-sm font-bold shadow-sm transition-colors hover:bg-[#cbe066]">
                 {revPeriod === '6months' ? 'Last 6 Months' : 'This Year'} <RefreshCcw size={14} />
               </button>
             </div>
             <div className="h-[280px] w-full mt-4 -ml-4">
               <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <AreaChart data={revenueData}>
                   <defs>
                     <linearGradient id="revMainGrad" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#C7E3D4" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#C7E3D4" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={15} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} tickFormatter={(val) => `$${val/1000}K`} />
                   <Tooltip 
                     cursor={{ stroke: '#C7E3D4', strokeWidth: 1, strokeDasharray: '4 4' }}
                     content={({ active, payload }) => {
                       if (active && payload && payload.length) {
                         return (
                           <div className="bg-[#DCEB8C] p-3 rounded-2xl shadow-xl border-4 border-white flex flex-col items-center">
                              <p className="text-[10px] font-bold text-[#1A1D1F]/50 dark:text-white/50 uppercase tracking-tighter">Total Revenue</p>
                              <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">${payload[0].value.toLocaleString()}</p>
                           </div>
                         );
                       }
                       return null;
                     }}
                   />
                   <Area type="monotone" dataKey="revenue" stroke="#C7E3D4" strokeWidth={4} fillOpacity={1} fill="url(#revMainGrad)" activeDot={{ r: 8, fill: '#fff', stroke: '#C7E3D4', strokeWidth: 4 }} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Bottom Row Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Reservations</h3>
               <button className="flex items-center gap-2 bg-[#DCEB8C] px-5 py-2 rounded-2xl text-sm font-bold">
                 Last 7 Days <Plus size={16} />
               </button>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <BarChart data={resData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Bar dataKey="booked" fill="#DCEB8C" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="canceled" fill="#F4F4F4" radius={[4, 4, 0, 0]} />
                 </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-6 pt-4 border-t border-[#F4F4F4] dark:border-[#2a2a35]">
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#BAE6FD]"></div><span className="text-[10px] font-bold text-[#6F767E] dark:text-[#a1a1aa] uppercase">Booked</span></div>
               <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#F4F4F4] dark:bg-[#2a2a35]"></div><span className="text-[10px] font-bold text-[#6F767E] dark:text-[#a1a1aa] uppercase">Canceled</span></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Booking by Platform</h3>
               <MoreHorizontal className="text-[#6F767E] dark:text-[#a1a1aa] cursor-pointer" size={20} />
             </div>
             <div className="flex h-64 items-center">
                <ResponsiveContainer width="50%" height="100%" minWidth={0} minHeight={0}>
                   <PieChart>
                     <Pie data={platformData} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {platformData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                     </Pie>
                   </PieChart>
                </ResponsiveContainer>
                <div className="w-1/2 space-y-4 pl-6">
                   {platformData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                            <span className="text-sm font-bold text-[#6F767E] dark:text-[#a1a1aa] group-hover:text-[#1A1D1F] dark:text-white transition-colors">{item.name}</span>
                         </div>
                         <span className="text-sm font-bold text-[#1A1D1F] dark:text-white">{item.value}%</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right Content Sidebar (Overall Rating & Tasks) */}
      <div className="w-full lg:w-80 shrink-0 space-y-8 h-fit">
         {/* Overall Rating Card */}
         <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Overall Rating</h3>
               <MoreHorizontal className="text-[#6F767E] dark:text-[#a1a1aa]" size={20} />
            </div>
            <div className="flex items-center gap-4 mb-8">
               <div className="text-5xl font-bold text-[#1A1D1F] dark:text-white">4.6<span className="text-xl text-[#6F767E] dark:text-[#a1a1aa] font-normal leading-none opacity-50 ml-1">/5</span></div>
               <div className="leading-tight">
                  <p className="font-bold text-[#1A1D1F] dark:text-white">Impressive</p>
                  <p className="text-[11px] font-bold text-[#6F767E] dark:text-[#a1a1aa] uppercase opacity-50">from 2546 reviews</p>
               </div>
            </div>
            <div className="space-y-6">
               {[
                 { label: 'Facilities', score: 4.4 },
                 { label: 'Cleanliness', score: 4.7 },
                 { label: 'Services', score: 4.6 },
                 { label: 'Comfort', score: 4.8 },
                 { label: 'Location', score: 4.5 },
               ].map(x => (
                 <div key={x.label} className="flex items-center justify-between group">
                    <span className="text-sm font-bold text-[#6F767E] dark:text-[#a1a1aa] w-24 group-hover:text-[#1A1D1F] dark:text-white">{x.label}</span>
                    <div className="flex-1 h-2 bg-[#F4F4F4] dark:bg-[#2a2a35] rounded-full mx-4 overflow-hidden">
                       <div className="h-full bg-[#DCEB8C] rounded-full" style={{ width: `${(x.score/5)*100}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-[#1A1D1F] dark:text-white">{x.score}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Tasks List Card */}
         <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Tasks</h3>
               <button onClick={() => setActiveTab && setActiveTab('tasks')} className="w-10 h-10 bg-[#DCEB8C] text-[#1A1D1F] dark:text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all shadow-sm">
                  <Plus size={20} />
               </button>
            </div>
            <div className="space-y-4">
               {[
                 { date: 'June 19, 2028', title: 'Set Up Conference Room B for 10 AM Meeting', color: 'bg-[#E9F5EF] dark:bg-[#1a221d]' },
                 { date: 'June 19, 2028', title: 'Restock Housekeeping Supplies on 3rd Floor', color: 'bg-[#F9FCB2]/30' },
                 { date: 'June 20, 2028', title: 'Inspect and Clean the Pool Area', color: 'bg-[#E9F5EF] dark:bg-[#1a221d]' },
               ].map((t, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="mt-1.5 w-5 h-5 border-2 border-[#EFF2F5] dark:border-[#2a2a35] rounded-md flex items-center justify-center group-hover:border-[#C7E3D4] transition-all cursor-pointer">
                       {i === 0 && <Check size={14} className="text-[#C7E3D4]" />}
                    </div>
                    <div className={cn("p-5 rounded-[24px] flex-1", t.color)}>
                       <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#6F767E] dark:text-[#a1a1aa] uppercase tracking-wider">{t.date}</span>
                          <MoreHorizontal size={14} className="text-[#6F767E] dark:text-[#a1a1aa] opacity-50" />
                       </div>
                       <p className="text-xs font-bold text-[#1A1D1F] dark:text-white leading-[1.6]">{t.title}</p>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default Overview;
