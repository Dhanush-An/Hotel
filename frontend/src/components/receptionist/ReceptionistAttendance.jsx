import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, MapPin, Monitor, CheckCircle, XCircle, AlertCircle, RefreshCw, Camera, ChevronLeft, ChevronRight, List, LayoutGrid, Download, Timer, TrendingUp } from 'lucide-react';

export default function ReceptionistAttendance() {
  const [isClockedIn, setIsClockedIn] = useState(localStorage.getItem('lodgify_isClockedIn') === 'true');
  const [clockInTime, setClockInTime] = useState(localStorage.getItem('lodgify_clockInTime') || null);
  const [attendance, setAttendance] = useState([]);
  const [view, setView] = useState('table');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());

  const SHIFT_HOURS = 9;

  const loadLogs = () => {
    const logs = JSON.parse(localStorage.getItem('lodgify_attendance') || '[]');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Show only this receptionist's records
    const mine = logs.filter(l => l.staff === user.name || l.role === 'receptionist');
    setAttendance(mine);
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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
    loadLogs();
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
    loadLogs();
  };

  // Build daily records (pair clockin + clockout)
  const buildRecords = () => {
    const map = {};
    attendance.forEach(a => {
      const key = `${a.staff}__${a.date}`;
      if (!map[key]) map[key] = { staff: a.staff, date: a.date, clockIn: null, clockOut: null };
      if (a.type === 'Clock In') map[key].clockIn = a.time;
      if (a.type === 'Clock Out') map[key].clockOut = a.time;
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  };

  const computeHours = (cin, cout) => {
    if (!cin || !cout) return null;
    const [h1, m1] = cin.split(':').map(Number);
    const [h2, m2] = cout.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return diff > 0 ? diff / 60 : null;
  };

  const records = buildRecords();
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date === today);
  const currentHours = clockInTime ? computeHours(clockInTime, new Date().toTimeString().slice(0, 5)) : null;
  const totalOT = records.reduce((sum, r) => {
    const h = computeHours(r.clockIn, r.clockOut);
    return sum + (h && h > SHIFT_HOURS ? h - SHIFT_HOURS : 0);
  }, 0);

  // Calendar helpers
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`p${i}`} className="h-24 bg-gray-50 dark:bg-[#13131a] border border-gray-100 dark:border-[#2a2a35]" />);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const rec = records.find(r => r.date === dateStr);
      const isT = today === dateStr;
      const h = rec ? computeHours(rec.clockIn, rec.clockOut) : null;
      days.push(
        <div key={d} className={`h-24 border p-2 flex flex-col gap-1 transition-all ${isT ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-200' : 'border-gray-100 dark:border-[#2a2a35] hover:bg-gray-50 dark:hover:bg-[#1c1c24]'}`}>
          <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${isT ? 'bg-primary-500 text-white' : 'text-gray-400'}`}>{d}</span>
          {rec?.clockIn && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">IN {rec.clockIn}</span>}
          {rec?.clockOut && <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">OUT {rec.clockOut}</span>}
          {h && <span className="text-[9px] font-black text-primary-600">{h.toFixed(1)}h</span>}
          {!rec && <span className="text-[9px] text-gray-300 font-bold mt-auto">—</span>}
        </div>
      );
    }
    return days;
  };

  const handleExport = () => {
    const rows = [['Date','Login','Logout','Hours','Overtime']];
    records.forEach(r => {
      const h = computeHours(r.clockIn, r.clockOut);
      rows.push([r.date, r.clockIn||'—', r.clockOut||'—', h?h.toFixed(2):'—', h&&h>SHIFT_HOURS?(h-SHIFT_HOURS).toFixed(2):'0']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='my_attendance.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Status Today', value: isClockedIn ? 'On Duty' : 'Off Duty', icon: UserCheck, color: isClockedIn ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600' },
          { label: 'Login Time', value: todayRecord?.clockIn || (isClockedIn ? clockInTime : '—'), icon: Clock, color: 'bg-blue-50 text-blue-700' },
          { label: 'Current Hours', value: currentHours ? `${currentHours.toFixed(1)}h` : (todayRecord ? computeHours(todayRecord.clockIn, todayRecord.clockOut)?.toFixed(1)+'h' : '—'), icon: Timer, color: 'bg-yellow-50 text-yellow-700' },
          { label: 'Total Overtime', value: `${totalOT.toFixed(1)}h`, icon: TrendingUp, color: 'bg-purple-50 text-purple-700' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`${s.color} rounded-2xl p-5 shadow-sm border border-black/5`}>
              <Icon size={18} className="mb-2 opacity-70" />
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Clock In / Out */}
      <div className="bg-white dark:bg-[#1c1c24] rounded-[28px] p-6 border border-border dark:border-[#2a2a35] shadow-sm flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isClockedIn ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            <UserCheck size={28} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Front Desk Status</p>
            <h3 className="text-xl font-black text-gray-800 dark:text-white">{isClockedIn ? '● On Shift' : '○ Off Duty'}</h3>
            {isClockedIn && clockInTime && <p className="text-xs text-gray-400 font-bold">Started at {clockInTime}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          {!isClockedIn ? (
            <button onClick={handleClockIn} className="flex items-center gap-2 px-8 py-3.5 bg-primary-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-primary-500/25 hover:bg-primary-600 active:scale-95 transition-all uppercase tracking-widest">
              <CheckCircle size={18} /> Login / Clock In
            </button>
          ) : (
            <button onClick={handleClockOut} className="flex items-center gap-2 px-8 py-3.5 bg-red-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-500/25 hover:bg-red-600 active:scale-95 transition-all uppercase tracking-widest">
              <XCircle size={18} /> Logout / Clock Out
            </button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 border border-border dark:border-[#2a2a35] shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-[#2a2a35] p-1 rounded-xl">
            <button onClick={() => setView('table')} className={`p-2 rounded-lg transition-all ${view==='table' ? 'bg-white dark:bg-[#1c1c24] shadow-sm text-primary-500' : 'text-gray-400'}`}><List size={18}/></button>
            <button onClick={() => setView('calendar')} className={`p-2 rounded-lg transition-all ${view==='calendar' ? 'bg-white dark:bg-[#1c1c24] shadow-sm text-primary-500' : 'text-gray-400'}`}><LayoutGrid size={18}/></button>
          </div>
          {view === 'calendar' && (
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()-1)))} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a35] rounded-lg text-gray-500"><ChevronLeft size={16}/></button>
              <span className="text-sm font-bold text-gray-700 dark:text-white min-w-[130px] text-center">{currentDate.toLocaleString('default',{month:'long',year:'numeric'})}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth()+1)))} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2a35] rounded-lg text-gray-500"><ChevronRight size={16}/></button>
            </div>
          )}
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all">
          <Download size={15}/> Export My Log
        </button>
      </div>

      {/* Content */}
      {view === 'calendar' ? (
        <div className="bg-white dark:bg-[#1c1c24] rounded-3xl border border-border dark:border-[#2a2a35] overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b border-border dark:border-[#2a2a35]">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
              <div key={d} className="py-4 text-center text-[10px] font-black text-gray-400 tracking-widest bg-gray-50 dark:bg-[#13131a]">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">{renderCalendar()}</div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1c1c24] rounded-3xl border border-border dark:border-[#2a2a35] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#13131a] border-b border-border dark:border-[#2a2a35]">
              <tr>
                {['Date','Login Time','Logout Time','Total Hours','Overtime','Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2a2a35]">
              {records.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">No attendance records yet</td></tr>
              )}
              {records.map((r, i) => {
                const h = computeHours(r.clockIn, r.clockOut);
                const ot = h && h > SHIFT_HOURS ? h - SHIFT_HOURS : 0;
                return (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-[#13131a]/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">{r.date}</td>
                    <td className="px-6 py-4">{r.clockIn ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">{r.clockIn}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                    <td className="px-6 py-4">{r.clockOut ? <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">{r.clockOut}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                    <td className="px-6 py-4 font-bold text-gray-700 dark:text-gray-200">{h ? `${h.toFixed(1)}h` : <span className="text-gray-300">—</span>}</td>
                    <td className="px-6 py-4">{ot > 0 ? <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">{ot.toFixed(1)}h OT</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                    <td className="px-6 py-4">
                      {r.clockIn && r.clockOut ? <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full">✓ Complete</span>
                        : r.clockIn ? <span className="bg-yellow-100 text-yellow-700 text-xs font-black px-3 py-1 rounded-full">On Shift</span>
                        : <span className="bg-gray-100 text-gray-400 text-xs font-black px-3 py-1 rounded-full">No Record</span>}
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
