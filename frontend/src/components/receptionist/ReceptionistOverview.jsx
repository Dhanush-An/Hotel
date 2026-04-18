import React, { useState, useEffect } from 'react';
import { BedDouble, CheckCircle, Clock, CalendarCheck, TrendingUp, XCircle, MoreVertical, Search, Bell, Plus, ArrowRight, Check } from 'lucide-react';
import api from '../../services/api';

const cn = (...inputs) => inputs.filter(Boolean).join(' ');

export default function ReceptionistOverview() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const stats = [
    { label: 'Rooms Total', value: rooms.length, color: 'bg-[#F4F4F4]/50 dark:bg-[#2a2a35]/50' },
    { label: 'Available', value: rooms.filter(r => r.status === 'Available').length, color: 'bg-[#E9F5EF] dark:bg-[#1a221d] text-[#27AE60]' },
    { label: 'Occupied', value: rooms.filter(r => r.status === 'Occupied').length, color: 'bg-[#E0F2FE] dark:bg-[#0c1a2e] text-[#0EA5E9]' },
    { label: 'Reserved', value: rooms.filter(r => r.status === 'Reserved').length, color: 'bg-[#DCEB8C]/40 text-[#1A1D1F] dark:text-white' },
  ];

  const [isClockedIn, setIsClockedIn] = useState(localStorage.getItem('lodgify_isClockedIn') === 'true');
  const [clockInTime, setClockInTime] = useState(localStorage.getItem('lodgify_clockInTime') || null);
  const [counterStatus, setCounterStatus] = useState('Open');

  const handleClockIn = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const time = new Date().toTimeString().slice(0, 5);
    const date = new Date().toISOString().split('T')[0];
    const logs = JSON.parse(localStorage.getItem('lodgify_attendance') || '[]');
    logs.push({ staff: user.name || 'Receptionist', role: 'receptionist', type: 'Clock In', date, time });
    localStorage.setItem('lodgify_attendance', JSON.stringify(logs));
    localStorage.setItem('lodgify_isClockedIn', 'true');
    localStorage.setItem('lodgify_clockInTime', time);
    setIsClockedIn(true);
    setClockInTime(time);
  };

  const handleClockOut = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const time = new Date().toTimeString().slice(0, 5);
    const date = new Date().toISOString().split('T')[0];
    const logs = JSON.parse(localStorage.getItem('lodgify_attendance') || '[]');
    logs.push({ staff: user.name || 'Receptionist', role: 'receptionist', type: 'Clock Out', date, time });
    localStorage.setItem('lodgify_attendance', JSON.stringify(logs));
    localStorage.setItem('lodgify_isClockedIn', 'false');
    localStorage.removeItem('lodgify_clockInTime');
    setIsClockedIn(false);
    setClockInTime(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 overflow-hidden animate-in fade-in duration-700">
      <div className="flex-1 space-y-8 min-w-0">
        
        {/* Attendance & Counter Status Header */}
        <div className="bg-white dark:bg-[#1c1c24] p-6 rounded-[32px] border border-[#EFF2F5] dark:border-[#2a2a35] shadow-sm flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isClockedIn ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                 <CheckCircle size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance Status</p>
                 <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black text-gray-800 dark:text-white">{isClockedIn ? 'Front Desk Verified' : 'Clocked Out'}</h4>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${isClockedIn ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                       {isClockedIn ? `Since ${clockInTime || '—'}` : 'Off Duty'}
                    </span>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-4 border-l border-[#EFF2F5] dark:border-[#2a2a35] pl-6">
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-2">Counter</p>
                 <div className="flex bg-gray-100 dark:bg-[#13131a] p-1 rounded-xl">
                    {['Open', 'Break', 'Closed'].map(st => (
                      <button key={st} onClick={() => setCounterStatus(st)}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${counterStatus === st ? 'bg-white dark:bg-[#2a2a35] shadow-sm text-primary-500' : 'text-gray-400'}`}>
                         {st}
                      </button>
                    ))}
                 </div>
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Shift</p>
                 <p className="text-sm font-bold text-gray-800 dark:text-white">09:00 - 18:00</p>
              </div>
           </div>
           
           {/* Login / Logout Button */}
           {!isClockedIn ? (
             <button onClick={handleClockIn} className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:bg-primary-600 transition-all active:scale-95 ml-auto shadow-sm">
               <CheckCircle size={16} /> Login
             </button>
           ) : (
             <button onClick={handleClockOut} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:bg-red-600 transition-all active:scale-95 ml-auto shadow-sm">
               <XCircle size={16} /> Logout
             </button>
           )}
        </div>

        {/* KPI Top Row Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className={cn("rounded-[24px] p-6 shadow-sm border border-transparent transition-all relative overflow-hidden group", s.label === "Available" ? "bg-[#E9F5EF] dark:bg-[#1a221d]" : "bg-white dark:bg-[#1c1c24] border-[#EFF2F5] dark:border-[#2a2a35]")}>
              <p className="text-[12px] font-bold text-[#1A1D1F]/60 dark:text-white/60 uppercase tracking-widest mb-1">{s.label}</p>
              <h3 className="text-3xl font-bold text-[#1A1D1F] dark:text-white mb-4">{s.value}</h3>
              <div className="flex items-center gap-1.5 text-[11px] font-bold opacity-60 bg-white/40 dark:bg-[#1c1c24]/40 w-fit px-2 py-0.5 rounded-full">
                <Check size={12} className="text-gray-400 dark:text-[#a1a1aa]" /> Current count
              </div>
            </div>
          ))}
        </div>


        {/* Upcoming Activity */}
        <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
           <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-bold text-[#1A1D1F] dark:text-white">Upcoming Activity</h3>
             <button className="text-xs font-bold text-gray-400 uppercase tracking-widest">History</button>
           </div>
           <div className="flex flex-col items-center justify-center py-12 text-center">
             <div className="w-16 h-16 bg-gray-50 dark:bg-[#2a2a35] rounded-full flex items-center justify-center text-gray-200 mb-4"><CalendarCheck size={32} /></div>
             <p className="text-gray-400 font-bold text-sm">No upcoming activities yet</p>
             <p className="text-gray-300 text-xs mt-1">New bookings will appear here</p>
           </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 shrink-0 space-y-8">
         <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-base font-bold text-[#1A1D1F] dark:text-white tracking-tight uppercase opacity-40">Front Desk Checklist</h3>
               <button className="w-10 h-10 bg-[#DCEB8C] text-[#1A1D1F] rounded-xl flex items-center justify-center hover:shadow-lg transition-all shadow-sm"><Plus size={20} /></button>
            </div>
            <div className="space-y-4">
               {[
                 { text: 'Verify R104 Payment', time: '10 AM', done: true, color: 'bg-[#E9F5EF] dark:bg-[#1a221d]' },
                 { text: 'Keys for Priya Mehta', time: '11 AM', done: false, color: 'bg-[#F9FCB2]/30' },
                 { text: 'Wake Call R205', time: '12 PM', done: false, color: 'bg-white dark:bg-[#1c1c24] border-[#EFF2F5] dark:border-[#2a2a35]' },
                 { text: 'Guest Bill Check-Out', time: '02 PM', done: false, color: 'bg-white dark:bg-[#1c1c24] border-[#EFF2F5] dark:border-[#2a2a35]' },
               ].map((t, i) => (
                 <div key={i} className={cn("p-5 rounded-[24px] flex flex-col gap-1 border", t.color, t.done ? "opacity-60" : "opacity-100")}>
                    <div className="flex justify-between mb-1">
                       <div className="flex items-center gap-2">
                          <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", t.done ? "bg-[#27AE60] border-transparent" : "border-[#EFF2F5] dark:border-[#2a2a35]")}>
                             {t.done && <Check size={10} className="text-white" />}
                          </div>
                          <span className="text-[10px] font-bold text-[#1A1D1F]/50 dark:text-white/50 uppercase tracking-widest">{t.time} Session</span>
                       </div>
                    </div>
                    <p className={cn("text-xs font-bold text-[#1A1D1F] dark:text-white leading-[1.6]", t.done ? "line-through opacity-40" : "")}>{t.text}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-[#1A1D1F] rounded-[32px] p-8 shadow-premium relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
            <p className="text-[#C7E3D4] text-[10px] font-bold uppercase tracking-widest mb-3">Check-ins Info</p>
            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">5 Guest scheduled arrivals today.</h3>
            <p className="text-white/40 text-xs mb-8">Maintain readiness for high occupancy evening.</p>
            <button className="w-full py-4 bg-[#DCEB8C] text-[#1A1D1F] rounded-2xl font-bold text-sm shadow-sm hover:shadow-lg transition-all">Quick Check-In Portal</button>
         </div>
      </div>
    </div>
  );
}
