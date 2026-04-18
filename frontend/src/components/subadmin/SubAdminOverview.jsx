import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, BedDouble, CalendarCheck, Receipt, 
  Users, DollarSign, MoreHorizontal, Plus, Check 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

const weekData = [];

export default function SubAdminOverview() {
  const stats = [
    { label: 'Rooms Occupied', value: 0, total: 30, up: true, change: '+0 today', color: 'bg-[#E0F2FE] dark:bg-[#0c1a2e] text-[#0EA5E9]' },
    { label: "Bookings", value: 0, up: true, change: '+0 vs yesterday', color: 'bg-[#DCEB8C]/40 text-[#1A1D1F] dark:text-white' },
    { label: 'Pending Exp.', value: '0', up: false, change: '0 awaiting', color: 'bg-[#FFE7E4] dark:bg-[#2a1a1c] text-[#FF6A55]' },
    { label: 'Staff Duty', value: 0, total: 0, up: true, change: '0 on leave', color: 'bg-[#C7E3D4]/40 text-[#1A1D1F] dark:text-white' },
  ];

  return (
    <div className="flex gap-8 overflow-hidden animate-in fade-in duration-700">
      <div className="flex-1 space-y-8">
        
        {/* KPI Top Row Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className={cn("rounded-[24px] p-6 shadow-sm border border-transparent transition-all relative overflow-hidden group", s.label === "Bookings" ? "bg-[#DCEB8C]/40" : "bg-white dark:bg-[#1c1c24] border-[#EFF2F5] dark:border-[#2a2a35]")}>
              <p className="text-[12px] font-bold text-[#1A1D1F]/60 dark:text-white/60 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-3xl font-bold text-[#1A1D1F] dark:text-white mb-4">{s.value}{s.total ? <span className="text-lg text-gray-400 dark:text-[#a1a1aa] font-normal">/{s.total}</span> : ''}</h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-60 bg-white/40 dark:bg-[#1c1c24]/40 w-fit px-2 py-0.5 rounded-full">
                {s.up ? <TrendingUp size={12} className="text-[#27AE60]" /> : <TrendingDown size={12} className="text-[#FF6A55]" />}
                {s.change}
              </div>
            </div>
          ))}
        </div>

        {/* Large Revenue Wave Chart */}
        <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] relative overflow-hidden">
           <div className="flex justify-between items-center mb-8">
             <div>
               <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Weekly Performance</h3>
               <p className="text-sm font-bold text-[#6F767E] dark:text-[#a1a1aa] opacity-50 uppercase tracking-wider">Revenue Stream</p>
             </div>
             <div className="text-right">
               <span className="text-2xl font-bold text-[#1A1D1F] dark:text-white">₹0</span>
               <p className="text-[10px] font-bold text-[#27AE60] flex items-center gap-1 justify-end uppercase"><TrendingUp size={12}/> 0% Profit</p>
             </div>
           </div>
           
           <div className="h-[280px] w-full mt-4 -ml-4">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
               <AreaChart data={weekData}>
                 <defs>
                   <linearGradient id="subRevGrad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#C7E3D4" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#C7E3D4" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={15} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} tickFormatter={(val) => `₹${val/1000}K`} />
                 <Tooltip cursor={{stroke: '#C7E3D4', strokeDasharray: '4 4'}} />
                 <Area type="monotone" dataKey="revenue" stroke="#B5D1C2" strokeWidth={4} fillOpacity={1} fill="url(#subRevGrad)" activeDot={{ r: 6, fill: '#fff', stroke: '#C7E3D4', strokeWidth: 3 }} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Snapshot Sidebar */}
      <div className="w-80 shrink-0 space-y-8">
         <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
            <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white mb-8">Room Status</h3>
            <div className="h-6 w-full flex rounded-full overflow-hidden mb-8 gap-1 bg-[#F4F4F4] dark:bg-[#2a2a35]">
               <div className="bg-[#C7E3D4] w-[60%]"></div>
               <div className="bg-[#DCEB8C] w-[25%]"></div>
               <div className="bg-[#FF6A55] w-[15%]"></div>
            </div>
            <div className="space-y-6">
              {[
                { label: 'Occupied', count: 18, total: 30, color: '#BAE6FD' },
                { label: 'Available', count: 8, total: 30, color: '#D1FAE5' },
                { label: 'Maintenance', count: 4, total: 30, color: '#FF6A55' },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-[#6F767E] dark:text-[#a1a1aa] opacity-60">{r.label}</span>
                    <span className="text-[#1A1D1F] dark:text-white">{r.count} Rooms</span>
                  </div>
                  <div className="h-1.5 bg-[#F4F4F4] dark:bg-[#2a2a35] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(r.count/r.total)*100}%`, backgroundColor: r.color }}></div>
                  </div>
                </div>
              ))}
            </div>
         </div>

         {/* Tasks List */}
         <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
           <h3 className="text-base font-bold text-[#1A1D1F] dark:text-white mb-6 tracking-tight uppercase opacity-40">Priority Tasks</h3>
           <div className="space-y-4">
              {[
                { text: 'AC Repair R205', p: 'High', color: 'bg-[#FFE7E4] dark:bg-[#2a1a1c]' },
                { text: 'Approve Laundry', p: 'Med', color: 'bg-[#F9FCB2]/30' },
                { text: 'Inventory Floor 1', p: 'Low', color: 'bg-[#E9F5EF] dark:bg-[#1a221d]' },
              ].map((t, i) => (
                <div key={i} className={cn("p-5 rounded-[24px] flex flex-col gap-1", t.color)}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#1A1D1F]/50 dark:text-white/50 uppercase tracking-widest">{t.p} Priority</span>
                    <Check size={14} className="text-[#1A1D1F]/20 dark:text-white/20" />
                  </div>
                  <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">{t.text}</p>
                </div>
              ))}
           </div>
           <button className="w-full mt-6 py-4 bg-[#DCEB8C] text-[#1A1D1F] dark:text-white rounded-2xl font-bold text-sm shadow-sm hover:shadow-lg transition-all">Add New Task</button>
         </div>
      </div>
    </div>
  );
}
