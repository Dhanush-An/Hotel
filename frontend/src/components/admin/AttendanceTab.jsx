import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Search, Download, UserCheck, Clock, ChevronLeft, ChevronRight, List, LayoutGrid, Timer, TrendingUp } from 'lucide-react';
import api from '../../services/api';

export default function AttendanceTab() {
  const [view, setView] = useState('table');
  const [attendance, setAttendance] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getAttendance();
      setAttendance(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const records = attendance.filter(r =>
    (r.staffName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.date || '').includes(search)
  );

  const computeHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return null;
    try {
      const [h1, m1] = clockIn.split(':').map(Number);
      const [h2, m2] = clockOut.split(':').map(Number);
      const minIn = h1 * 60 + m1;
      const minOut = h2 * 60 + m2;
      const diff = minOut - minIn;
      return diff > 0 ? diff / 60 : 0;
    } catch (e) {
      return null;
    }
  };

  const SHIFT_HOURS = 8;
  const today = new Date().toISOString().split('T')[0];
  const presentToday = [...new Set(attendance.filter(a => a.date === today).map(a => a.staffName))].length;
  const totalStaff = [...new Set(attendance.map(a => a.staffName))].length;
  
  const totalHoursAll = records.reduce((sum, r) => {
    const h = computeHours(r.checkin, r.checkout);
    return sum + (h || 0);
  }, 0);
  
  const totalOT = records.reduce((sum, r) => {
    const h = computeHours(r.checkin, r.checkout);
    return sum + (h && h > SHIFT_HOURS ? h - SHIFT_HOURS : 0);
  }, 0);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`pad-${i}`} className="h-28 border border-gray-100 dark:border-[#2a2a35] bg-gray-50/30 dark:bg-[#13131A]/30" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayAtt = attendance.filter(a => a.date === dateStr);
      const isToday = today === dateStr;
      days.push(
        <div key={d} className={`h-28 border border-gray-100 dark:border-[#2a2a35] p-2 flex flex-col gap-1 overflow-hidden ${isToday ? 'bg-primary-50/40 dark:bg-primary-500/10' : ''}`}>
          <span className={`text-xs font-bold ${isToday ? 'bg-primary-500 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-400 dark:text-[#a1a1aa]'}`}>{d}</span>
          {dayAtt.slice(0, 3).map((record, idx) => (
            <div key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 truncate">
              {record.staffName?.split(' ')[0]} {record.checkin?.slice(0,5)} – {record.checkout?.slice(0,5) || '…'}
            </div>
          ))}
          {dayAtt.length > 3 && (
            <span className="text-[9px] text-gray-400 dark:text-[#555] font-bold">+{dayAtt.length - 3} more</span>
          )}
        </div>
      );
    }
    return days;
  };

  const handleExport = () => {
    const rows = [['Staff', 'Date', 'Clock In', 'Clock Out', 'Total Hours', 'Overtime']];
    records.forEach(r => {
      const h = computeHours(r.checkin, r.checkout);
      const ot = h && h > SHIFT_HOURS ? (h - SHIFT_HOURS).toFixed(2) : '0';
      rows.push([r.staffName, r.date, r.checkin || '—', r.checkout || '—', h ? h.toFixed(2) : '—', ot]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'attendance_log.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present Today', value: presentToday, icon: UserCheck, color: 'bg-green-50 text-green-700' },
          { label: 'Total Staff', value: totalStaff, icon: CalendarIcon, color: 'bg-blue-50 text-blue-700' },
          { label: 'Total Hours (All)', value: `${totalHoursAll.toFixed(1)}h`, icon: Timer, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Overtime (All)', value: `${totalOT.toFixed(1)}h`, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.color} dark:bg-opacity-10 dark:border-white/5 rounded-2xl p-5 shadow-sm border border-black/5`}>
              <Icon size={20} className="mb-2 opacity-70" />
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs font-bold uppercase tracking-widest mt-1 opacity-60">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Control Bar */}
      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 border border-border dark:border-[#2a2a35] shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-gray-100 dark:bg-[#2a2a35] p-1 rounded-xl">
            <button onClick={() => setView('table')} className={`p-2 rounded-lg transition-all ${view === 'table' ? 'bg-white dark:bg-[#1c1c24] shadow-sm text-primary-500' : 'text-gray-400 hover:text-gray-600'}`}><List size={18} /></button>
            <button onClick={() => setView('calendar')} className={`p-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-white dark:bg-[#1c1c24] shadow-sm text-primary-500' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={18} /></button>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search staff or date..." className="pl-9 pr-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 w-52" />
          </div>
          {view === 'calendar' && (
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronLeft size={18} /></button>
              <span className="text-sm font-bold text-gray-700 min-w-[130px] text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><ChevronRight size={18} /></button>
            </div>
          )}
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {view === 'calendar' ? (
        <div className="bg-white dark:bg-[#1c1c24] rounded-3xl shadow-premium border border-border dark:border-[#2a2a35] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border dark:border-[#2a2a35]">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-gray-400 dark:text-[#a1a1aa] tracking-widest bg-gray-50/50 dark:bg-[#13131A]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-[#2a2a35] border-t border-l border-gray-100 dark:border-[#2a2a35]">{renderCalendar()}</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1c1c24] rounded-3xl shadow-premium border border-border dark:border-[#2a2a35] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#13131a] border-b border-border dark:border-[#2a2a35]">
              <tr>
                {['Date','Staff','Login Time','Logout Time','Total Hours','Overtime','Status'].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a35]">
              {records.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No Attendance Records Found</td></tr>
              )}
              {records.map((r, i) => {
                const h = computeHours(r.checkin, r.checkout);
                const ot = h && h > SHIFT_HOURS ? h - SHIFT_HOURS : 0;
                return (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-[#13131a]/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">{r.date}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm">{(r.staffName || '?')[0]}</div>
                        <span className="font-bold text-gray-800 dark:text-white text-sm">{r.staffName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {r.checkin ? <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black"><Clock size={11}/>{r.checkin}</span> : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {r.checkout ? <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black"><Clock size={11}/>{r.checkout}</span> : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-700 dark:text-gray-200 text-sm">
                      {h ? `${h.toFixed(1)}h` : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {ot > 0
                        ? <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">{ot.toFixed(1)}h OT</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      {r.checkin && r.checkout
                        ? <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full">✓ Complete</span>
                        : r.checkin
                          ? <span className="bg-yellow-100 text-yellow-700 text-xs font-black px-3 py-1 rounded-full">On Shift</span>
                          : <span className="bg-gray-100 text-gray-500 text-xs font-black px-3 py-1 rounded-full">Absent</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
