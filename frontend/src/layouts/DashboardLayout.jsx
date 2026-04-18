import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Hotel, Bell, Settings, Menu,
  Sun, Moon, X, BedDouble, ClipboardList, Clock, CheckCircle, CreditCard
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Chatbot from '../components/common/Chatbot';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

import api from '../services/api';

function useNotifications(role) {
  const [notifications, setNotifications] = useState([]);
  
  // Track read/dismissed IDs locally since the derivation logic is fresh on every fetch
  const getLocals = (key) => {
    try {
      const s = localStorage.getItem(`notifs_${key}`);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  };

  const saveLocal = (key, list) => localStorage.setItem(`notifs_${key}`, JSON.stringify(list));

  const fetchAndBuildNotifications = async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const dismissedIds = getLocals('dismissed');
      const readIds = getLocals('read');
 
      const data = await api.getNotifications();
      const { checkoutTasks, cleaningRooms, activeTasks } = data;
 
      const newNotifs = [];
 
      // ── Checkout alerts ──
      const managementRoles = ['receptionist', 'admin', 'subadmin', 'manager'];
      if (managementRoles.includes(role?.toLowerCase().replace(' ', ''))) {
        checkoutTasks.forEach(b => {
          const coTime = b.checkOutTime || b.checkoutTime || '12:00';
          const [timePart] = coTime.split(' ');
          const [ch, cm] = timePart.split(':').map(Number);
          
          const checkoutMs = new Date(today).setHours(ch || 12, cm || 0, 0, 0);
          const diffMins = (checkoutMs - now.getTime()) / 60000;
          
          const id = b._id || b.id;
          const roomLabel = (() => {
            const r = String(b.room || 'N/A');
            if (r.toLowerCase().includes('undefined') || r.toLowerCase().includes('null') || r.trim() === '') return 'Room N/A';
            return r.toUpperCase().startsWith('ROOM') ? r : `Room ${r}`;
          })();
          
          if (diffMins > 0 && diffMins <= 60) {
            newNotifs.push({ 
              id: `checkout-15-${id}`, 
              type: 'upcoming', 
              category: 'checkout', 
              title: `Checkout in ${Math.round(diffMins)} min`, 
              body: `${b.guest} · ${roomLabel}`, 
              time: coTime, 
              read: readIds.includes(`checkout-15-${id}`), 
              link: (role?.toLowerCase().includes('admin') ? 'bookings' : 'available'),
              bookingData: b 
            });
          }
          if (diffMins < 0) {
            newNotifs.push({ 
              id: `checkout-overdue-${id}`, 
              type: 'overdue', 
              category: 'checkout', 
              title: 'Overdue Check-out', 
              body: `${b.guest} · ${roomLabel}`, 
              time: coTime, 
              read: readIds.includes(`checkout-overdue-${id}`), 
              link: (role?.toLowerCase().includes('admin') ? 'bookings' : 'available'),
              bookingData: b
            });
          }
        });
      }
 
      // ── Cleaning alerts ──
      const staffRoles = ['housekeeping', 'roomboy', 'admin', 'manager', 'subadmin'];
      if (staffRoles.includes(role?.toLowerCase().replace(' ', ''))) {
        cleaningRooms.forEach(r => {
          const id = `cleaning-${r._id || r.id}`;
          const roomLabel = (() => {
            const num = r.roomNumber || r.no || 'N/A';
            const str = String(num);
            if (str.toLowerCase().includes('undefined') || str.toLowerCase().includes('null') || str.trim() === '') return 'Room N/A';
            return str.toUpperCase().startsWith('ROOM') ? str : `Room ${str}`;
          })();
          newNotifs.push({ id, type: 'cleaning', category: 'cleaning', title: r.status === 'Maintenance' ? 'Maintenance Required' : 'Room Needs Cleaning', body: `${roomLabel} · ${r.type}`, time: 'Now', read: readIds.includes(id), link: 'technical' });
        });
      }
 
      // ── Task alerts ──
      activeTasks.forEach(t => {
        const id = `task-${t._id || t.id}`;
        newNotifs.push({ id, type: 'task', category: 'task', title: 'New Task Assigned', body: `${t.title} · ${t.staffName || t.assignee || 'Unassigned'}`, time: 'Recently', read: readIds.includes(id), link: 'tasks' });
      });
 
      const filtered = newNotifs.filter(n => !dismissedIds.includes(n.id));
      setNotifications(filtered);


    } catch (err) {
      console.error("Notif error:", err);
    }
  };

  useEffect(() => {
    fetchAndBuildNotifications();
    const iv = setInterval(fetchAndBuildNotifications, 30000); // More frequent updates
    return () => clearInterval(iv);
  }, [role]);

  const markRead = (id) => {
    const read = getLocals('read');
    if (!read.includes(id)) {
      const updated = [...read, id];
      saveLocal('read', updated);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleRead = (id) => {
    markRead(id);
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    saveLocal('read', allIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismiss = (id) => {
    const dismissed = getLocals('dismissed');
    if (!dismissed.includes(id)) {
      const updated = [...dismissed, id];
      saveLocal('dismissed', updated);
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const unread = notifications.filter(n => !n.read).length;
  return { notifications, unread, markRead, markAllRead, dismiss };
}

/* ─── Notification Panel ─── */
function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onDismiss, onNavigate, onClose }) {
  const TYPE_STYLE = {
    upcoming: 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
    overdue:  'border-l-4 border-red-400 bg-red-50 dark:bg-red-900/10',
    cleaning: 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10',
    task:     'border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/10',
  };
  const TYPE_DOT = {
    upcoming: 'bg-yellow-400',
    overdue:  'bg-red-500',
    cleaning: 'bg-yellow-400',
    task:     'bg-blue-500',
  };

  return (
    <div className="absolute right-0 top-12 w-96 bg-white dark:bg-[#1A1D1F] border border-[#EFF2F5] dark:border-[#272B30] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EFF2F5] dark:border-[#272B30]">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm">Notifications</h3>
        <div className="flex gap-2 items-center">
          <button onClick={onMarkAllRead} className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:text-primary-700">All Read</button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-[#272B30] rounded-lg text-gray-400"><X size={16} /></button>
        </div>
      </div>
      <div className="max-h-[480px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle size={32} className="mx-auto text-gray-200 dark:text-[#2a2a35] mb-3" />
            <p className="text-sm font-bold text-gray-400 dark:text-[#a1a1aa]">All caught up!</p>
            <p className="text-xs text-gray-300 dark:text-[#555] mt-1">No new notifications</p>
          </div>
        ) : notifications.map(n => (
          <div key={n.id}
            onClick={() => { onMarkRead(n.id); onNavigate(n); }}
            className={cn(
              'px-5 py-4 transition-all cursor-pointer border-b border-[#EFF2F5] dark:border-[#272B30] last:border-0 hover:bg-gray-50 dark:hover:bg-[#272B30]',
              !n.read 
                ? (TYPE_STYLE[n.type] || 'bg-white dark:bg-[#1A1D1F]') 
                : 'bg-white dark:bg-[#1A1D1F] opacity-40'
            )}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-2 flex-1">
                <span className={cn(
                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  !n.read ? (TYPE_DOT[n.type] || 'bg-gray-400') : 'bg-gray-200 dark:bg-[#2a2a35]'
                )} />
                <div>
                  <p className={cn("text-xs font-black", !n.read ? "text-gray-800 dark:text-white" : "text-gray-400 dark:text-gray-500")}>{n.title}</p>
                  <p className="text-[11px] text-gray-500 dark:text-[#a1a1aa] mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-gray-400 dark:text-[#555] mt-1 flex items-center gap-1"><Clock size={10} /> {n.time}</p>
                </div>
              </div>
              <button onClick={e => { e.stopPropagation(); onDismiss(n.id); }}
                className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-gray-400 flex-shrink-0">
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ViewBookingBriefModal = ({ booking, onClose }) => {
  if (!booking) return null;
  const PAY_BADGE = { Paid: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700', Partial: 'bg-orange-100 text-orange-700' };
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col border border-gray-100 dark:border-[#272B30] animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 border-b border-gray-100 dark:border-[#272B30] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Notification Detail</h3>
            <p className="text-[10px] text-primary-500 font-bold uppercase tracking-widest mt-1">Guest Booking Record</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-red-50 hover:text-red-500 text-gray-400 transition-all"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-y-8 gap-x-12">
            {[
              { label: 'Guest Full Name', value: booking.guest || '—', icon: <Hotel size={14} /> },
              { label: 'Phone Number', value: booking.phone || booking.mobile || '—', icon: <Clock size={14} /> },
              { label: 'Room No.', value: (String(booking.room || 'N/A').toUpperCase().startsWith('ROOM') ? booking.room : `Room ${booking.room || 'N/A'}`), icon: <BedDouble size={14} /> },
              { label: 'Check-In', value: `${booking.checkin || booking.checkInDate || '—'} ${booking.checkInTime || ''}`, icon: <Clock size={14} /> },
              { label: 'Check-Out', value: `${booking.checkout || booking.checkOutDate || '—'} ${booking.checkOutTime || ''}`, icon: <Clock size={14} /> },
              { label: 'Payment Status', value: booking.payment || 'Pending', customClass: PAY_BADGE[booking.payment] || 'bg-gray-100 text-gray-700' },
              { label: 'Amount', value: `₹${booking.amount ? Number(booking.amount).toLocaleString() : '0'}`, icon: <CreditCard size={14} /> },
              { label: 'Source', value: booking.source || 'Direct' },
            ].map((item, i) => (
              <div key={i}>
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 block flex items-center gap-2">
                  {item.icon} {item.label}
                </label>
                {item.customClass ? (
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.customClass}`}>{item.value}</span>
                ) : (
                   <p className="text-sm font-black text-gray-800 dark:text-gray-200">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50 dark:bg-[#13131a] border-t border-gray-100 dark:border-[#272B30] flex justify-end">
          <button onClick={onClose} className="px-10 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl transition-all">Close Details</button>
        </div>
      </div>
    </div>
  );
};
/* ─── Profile Modal ─── */
const ProfileModal = ({ user, onClose, onEdit }) => {
  if (!user) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-sm rounded-[40px] shadow-2xl flex flex-col border border-gray-100 dark:border-[#272B30] animate-in zoom-in duration-300 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="relative h-32 bg-gradient-to-r from-primary-500 to-purple-600">
           <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl backdrop-blur-md transition-all"><X size={18} /></button>
        </div>
        
        <div className="px-8 pb-8 -mt-16 relative text-center">
          <div className="w-24 h-24 rounded-[30px] border-4 border-white dark:border-[#1c1c24] overflow-hidden mx-auto shadow-xl bg-white mb-4">
             <img src={user.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} className="w-full h-full object-cover" alt="Profile" />
          </div>
          
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{user.name}</h3>
          <p className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] mt-1">{user.role}</p>
          
          <div className="mt-8 space-y-4 text-left">
            <div className="p-4 bg-gray-50 dark:bg-[#13131a] rounded-2xl border border-gray-100 dark:border-[#272B30]">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
               <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.email || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-[#13131a] rounded-2xl border border-gray-100 dark:border-[#272B30]">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
               <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.mobile || user.phone || 'N/A'}</p>
            </div>
          </div>

          <button 
            onClick={onEdit}
            className="w-full mt-8 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Settings size={16} /> Edit Account Profile
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Layout ─── */
const DashboardLayout = ({ title, role, children, menuItems, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const bellRef = useRef(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { notifications, unread, markRead, markAllRead, dismiss } = useNotifications(role);

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (isDarkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDarkMode]);

  // Sync user photo across tabs/components
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error("User storage error:", e); }
    return null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('user');
        if (saved) setUser(JSON.parse(saved));
      } catch (e) { console.error(e); }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleNotifNavigate = (notif) => {
    setShowNotifs(false);
    if (notif.bookingData) {
      setSelectedBooking(notif.bookingData);
    } else if (notif.link && setActiveTab) {
      // Safeguard: Only navigate if the tab exists in menuItems
      const tabExists = menuItems?.some(item => item.id === notif.link);
      if (tabExists) {
        setActiveTab(notif.link);
      } else {
        console.warn(`Attempted to navigate to non-existent tab: ${notif.link}`);
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F9FB] dark:bg-[#111315] overflow-hidden text-[#1A1D1F] dark:text-white transition-colors duration-300 relative">
      {/* AI Chatbot removed as requested */}
      
      
      {/* Global Booking Detail Modal */}
      {selectedBooking && <ViewBookingBriefModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />}

      {/* Global Profile Details Modal */}
      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onEdit={() => {
            setShowProfile(false);
            if (setActiveTab) setActiveTab('settings'); // Redirect to settings tab if available
          }}
        />
      )}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#1A1D1F] border-r border-[#EFF2F5] dark:border-[#272B30] flex flex-col transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#EFF2F5] dark:border-[#272B30]">
          <div className="flex flex-row items-center gap-3">
             <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Hotel Shubha Sai" className="w-full h-full object-contain" />
             </div>
             <div className="flex flex-col leading-none">
                <h1 className="font-black text-[11px] tracking-[0.2em] text-[#1A1D1F] dark:text-white uppercase leading-none">HOTEL <span className="text-primary-500">SHUBHA SAI</span></h1>
                <p className="text-[7px] font-black text-gray-400 dark:text-[#a1a1aa] uppercase tracking-[0.4em] mt-1.5 opacity-60">Management Portal</p>
             </div>
          </div>
          <button className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
             <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 mt-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group',
                  isActive
                    ? 'bg-[#DCEB8C] dark:bg-[#272B30] text-[#1A1D1F] dark:text-white shadow-sm font-bold'
                    : 'text-[#6F767E] hover:bg-[#F4F4F4] dark:hover:bg-[#272B30] hover:text-[#1A1D1F] dark:hover:text-white'
                )}>
                <Icon size={20} className={cn(isActive ? 'text-[#1A1D1F] dark:text-white' : 'text-[#6F767E] group-hover:text-[#1A1D1F] dark:group-hover:text-white')} />
                <span className="text-sm leading-none">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-[#272B30]">
          <button 
             onClick={() => navigate('/login')}
             className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group font-black"
          >
             <LogOut size={16} className="shrink-0" />
             <span className="text-[11px] leading-none uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full lg:w-auto">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between shrink-0 z-40 bg-[#F7F9FB] dark:bg-[#111315] transition-colors duration-300">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:hover:bg-[#272B30]">
               <Menu size={24} />
             </button>
             <h2 className="text-lg md:text-[28px] font-extrabold text-[#1A1D1F] dark:text-white tracking-tight truncate max-w-[150px] sm:max-w-none">{title}</h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsSidebarOpen(false)} // Just to satisfy any layout issues, not actually mapping it 
              className="hidden" />
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 md:w-12 md:h-12 flex flex-shrink-0 items-center justify-center text-[#6F767E] dark:text-white hover:bg-[#F4F4F4] dark:hover:bg-[#272B30] rounded-xl md:rounded-2xl transition-colors bg-white dark:bg-[#1A1D1F] border border-[#EFF2F5] dark:border-[#272B30] shadow-sm">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 bg-transparent p-1 pr-4 rounded-2x border-none hover:bg-gray-100/50 dark:hover:bg-[#1A1D1F]/50 transition-all duration-300 group"
            >
              <img src={user?.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" alt="user" />
              <div className="hidden lg:block leading-tight text-left">
                <p className="text-sm font-bold text-[#1A1D1F] dark:text-white">{user?.name || 'User'}</p>
                <p className="text-[11px] font-bold text-[#6F767E] opacity-60 uppercase tracking-wider">{user?.role || 'Guest'}</p>
              </div>
            </button>

            <div className="flex items-center gap-2 md:gap-4 ml-1">
                {/* Notification Bell */}
                <div ref={bellRef} className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowNotifs(!showNotifs); }}
                    className="p-2 text-[#6F767E] hover:bg-[#F4F4F4] dark:hover:bg-[#272B30] rounded-xl transition-colors relative">
                    <Bell size={18} />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF6A55] text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-[#1A1D1F]">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                  {showNotifs && (
                    <NotificationPanel
                      notifications={notifications}
                      onMarkRead={markRead}
                      onMarkAllRead={markAllRead}
                      onDismiss={dismiss}
                      onNavigate={handleNotifNavigate}
                      onClose={() => setShowNotifs(false)}
                    />
                  )}
                </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#F7F9FB] dark:bg-[#111315] transition-colors duration-300">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
