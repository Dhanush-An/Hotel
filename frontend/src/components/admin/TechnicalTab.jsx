import React, { useState, useEffect } from 'react';
import { Wrench, CheckCircle, AlertTriangle, Building, Hash, History, Clock, Trash2 } from 'lucide-react';
import api from '../../services/api';

const TechnicalTab = () => {
  const [rooms, setRooms] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRoomsAndHistory = async () => {
    try {
      setLoading(true);
      const [rData, tData] = await Promise.all([
        api.getRooms(),
        api.getTasks().catch(() => []) // In case tasks api isn't strictly available, fallback safely
      ]);
      setRooms(rData.filter(r => r.status === 'Maintenance'));
      
      const hist = tData.filter(t => t.dept === 'Maintenance History').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(hist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndHistory();
  }, []);

  const handleDeleteHistory = async () => {
    if (window.confirm('Clear all maintenance history logs? Active pending issues will remain.')) {
      try {
        await api.deleteAllTasks('Maintenance History');
        setHistory([]);
      } catch (err) {
        alert('Clear history error: ' + err.message);
      }
    }
  };

  const handleFixIssue = async (room) => {
    try {
      const reason = room.issue || (room.housekeeping && !['Clean','Dirty','In Progress','Inspected'].includes(room.housekeeping) ? room.housekeeping : 'No specific reason provided');

      // 1. Save issue to historical task registry
      await api.createTask({
        id: `M-HIST-${Date.now()}`,
        staffName: 'System / Reception',
        dept: 'Maintenance History',
        title: reason,
        status: 'Completed',
        notes: `Room ${room.roomNumber}`,
        priority: 'Low'
      }).catch(err => console.log('Silently ignoring task issue creation failure', err));

      // 2. Update room status back to available
      await api.updateRoom(room._id, {
        ...room,
        status: 'Available',
        housekeeping: 'Clean',
        issue: ''
      });
      // Optionally update local state to show it temporarily green before removing
      setRooms(rooms.map(r => r._id === room._id ? { ...r, status: 'Available' } : r));
      
      setTimeout(() => {
        fetchRoomsAndHistory();
      }, 1500); // Wait 1.5s to show the green state
    } catch (err) {
      alert('Failed to update room: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-wrap justify-end items-center gap-4">
        <div className="flex gap-3">
          <div className="bg-orange-50 text-orange-700 font-bold py-3 px-6 rounded-2xl transition-all shadow-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            {rooms.filter(r => r.status === 'Maintenance').length} Pending Issues
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] border border-gray-100 dark:border-[#2a2a35] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#13131A]">
                <th className="text-left py-5 px-8 text-[10px] font-extrabold text-gray-400 dark:text-[#a1a1aa] uppercase tracking-[0.2em]">S.No</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 dark:text-[#a1a1aa] uppercase tracking-[0.2em]">Room No</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 dark:text-[#a1a1aa] uppercase tracking-[0.2em]">Floor</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 dark:text-[#a1a1aa] uppercase tracking-[0.2em]">Reason / Issue</th>
                <th className="text-right py-5 px-8 text-[10px] font-extrabold text-gray-400 dark:text-[#a1a1aa] uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a35]">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400 text-sm font-bold">
                    No pending technical issues. All rooms are operational.
                  </td>
                </tr>
              ) : (
                rooms.map((room, index) => {
                  const isFixed = room.status === 'Available';
                  return (
                    <tr 
                      key={room._id} 
                      className={`transition-colors group ${isFixed ? 'bg-green-50 dark:bg-green-900/10' : 'hover:bg-gray-50/50 dark:hover:bg-[#2a2a35]'}`}
                    >
                      <td className="py-5 px-8 text-sm font-bold text-gray-500">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${isFixed ? 'bg-green-200 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-[#2a2a35] text-gray-500 dark:text-[#a1a1aa]'}`}>
                            <Hash size={16} />
                          </div>
                          <span className={`font-bold text-sm ${isFixed ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-white'}`}>
                            {room.roomNumber}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <Building size={16} className={isFixed ? 'text-green-500' : 'text-gray-400 dark:text-[#a1a1aa]'} />
                          <span className={`text-sm font-bold ${isFixed ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {room.floor || 'Ground'}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          {!isFixed && <Wrench size={16} className="text-orange-500" />}
                          <span className={`text-sm font-bold ${isFixed ? 'text-green-600 line-through opacity-70' : 'text-orange-700'}`}>
                            {room.issue || (room.housekeeping && !['Clean','Dirty','In Progress','Inspected'].includes(room.housekeeping) ? room.housekeeping : 'No specific reason provided (Pending check)')}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button 
                          onClick={() => handleFixIssue(room)}
                          disabled={isFixed}
                          className={`font-extrabold py-2 px-4 rounded-xl text-[10px] transition-all flex items-center gap-2 ml-auto shadow-sm tracking-wide uppercase ${isFixed ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-gray-900 border-4 border-white hover:bg-black text-white'}`}
                        >
                          <CheckCircle size={14} />
                          {isFixed ? 'Issue Fixed' : 'Mark as Fixed'}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolved History Table */}
      {history.length > 0 && (
        <div className="mt-10">
          <h3 className="flex items-center gap-2 text-lg font-black text-gray-800 dark:text-white tracking-tight mb-4">
            <History size={20} className="text-gray-400/60" /> Resolved Maintenance log
          </h3>
          <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] border border-gray-100 dark:border-[#2a2a35] shadow-sm overflow-hidden opacity-80">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-[#13131A]">
                    <th className="text-left py-4 px-8 text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Log ID</th>
                    <th className="text-left py-4 px-6 text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Room / Asset</th>
                    <th className="text-left py-4 px-6 text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Past Issue</th>
                    <th className="text-left py-4 px-6 text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="text-right py-4 px-8 text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#2a2a35]">
                  {history.map((log) => (
                    <tr key={log._id || log.id} className="hover:bg-gray-50/50 dark:hover:bg-[#2a2a35] transition-colors">
                      <td className="py-4 px-8 text-[10px] font-bold text-gray-400 dark:text-[#a1a1aa]">{log.id}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-gray-600 dark:text-[#e4e4e7]">{log.notes}</span>
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-500 dark:text-[#a1a1aa]">
                        {log.title}
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20 px-3 py-1 rounded-lg text-[9px] font-extrabold uppercase flex items-center gap-1.5 w-max tracking-wider">
                           <CheckCircle size={10} /> Resolved
                        </span>
                      </td>
                      <td className="py-4 px-8 text-right text-xs font-bold text-gray-400 dark:text-[#a1a1aa] flex items-center justify-end gap-1.5">
                        <Clock size={12} /> {new Date(log.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TechnicalTab;
