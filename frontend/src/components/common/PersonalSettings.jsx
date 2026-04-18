import { User, Mail, Phone, Lock, Eye, EyeOff, Save, CheckCircle, AlertCircle, Camera, Home } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

export default function PersonalSettings() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || user?.phone || '',
    password: '',
    confirmPassword: ''
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [roomStats, setRoomStats] = useState({ total: 0, available: 0, occupied: 0 });
  const [imagePreview, setImagePreview] = useState(user?.photo || null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const rooms = await api.getRooms();
        const stats = {
          total: rooms.length,
          available: rooms.filter(r => r.status === 'Available').length,
          occupied: rooms.filter(r => r.status === 'Occupied' || r.status === 'Booked').length
        };
        setRoomStats(stats);
      } catch (err) {
        console.error("Failed to fetch room stats:", err);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // We use createStaff/updateStaff logic because the User model is linked to Staff
      // But we need to know the official ID. 
      // If the user is an admin without a staff record, we might need a generic user update endpoint.
      // Current API has updateStaff(id, data).
      
      const updateData = {
        name: form.name,
        email: form.email,
        phone: form.mobile,
      };
      if (form.password) updateData.password = form.password;
      if (imagePreview) updateData.photo = imagePreview;

      // Find my record
      const staffs = await api.getStaff();
      const me = staffs.find(s => s.email === user.email);
      
      if (me) {
        await api.updateStaff(me._id, updateData);
        
        // Update local storage
        const newUser = { ...user, ...updateData };
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        
        // Notify other components (like DashboardLayout) that user data changed
        window.dispatchEvent(new Event('userUpdated'));
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
         // If admin (no staff record), we still update the user record via a temp auth route or similar
         // For now, let's assume all users have a staff entry (except maybe the seed admin)
         // Actually, my clearDatabase script adds an Admin User without a staff entry.
         // Let's check auth routes for a profile update.
         throw new Error("Staff record not found. Please contact system developer.");
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-[#1c1c24] rounded-[32px] p-8 md:p-12 shadow-sm border border-[#EFF2F5] dark:border-[#2a2a35] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="w-full md:w-1/3 flex flex-col items-center text-center">
             <div className="relative group">
                <div 
                  onClick={handleImageClick}
                  className="w-32 h-32 rounded-[40px] bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-500 mb-6 border-4 border-white dark:border-[#2a2a35] shadow-xl overflow-hidden cursor-pointer hover:opacity-80 transition-all"
                >
                   <img 
                    src={imagePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} 
                    className="w-full h-full object-cover" 
                    alt="Profile" 
                   />
                </div>
                <button 
                  type="button"
                  onClick={handleImageClick}
                  className="absolute bottom-6 right-0 w-10 h-10 bg-white dark:bg-gray-800 border-4 border-white dark:border-[#2a2a35] rounded-2xl flex items-center justify-center text-primary-500 shadow-xl hover:scale-110 active:scale-90 transition-all cursor-pointer"
                >
                   <Camera size={18} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
             </div>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{user?.name}</h2>
             <p className="text-xs font-black text-primary-500 uppercase tracking-widest mt-1">{user?.role}</p>
             <p className="text-xs text-gray-400 mt-4 leading-relaxed px-4">Update your personal information and security credentials to keep your account safe.</p>
          </div>

          <div className="flex-1 w-full">
            <h3 className="text-lg font-black text-gray-800 dark:text-white mb-8 border-b border-gray-100 dark:border-[#2a2a35] pb-4">Account Settings</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><User size={12} /> Full Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Mail size={12} /> Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed" readOnly />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Phone size={12} /> Mobile Number</label>
                  <input 
                    value={form.mobile} 
                    onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setForm({...form, mobile: val});
                    }} 
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-[#2a2a35]">
                <div className="relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Lock size={12} /> New Password</label>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Leave blank to keep current" className="w-full bg-[#F7F9FB] dark:bg-[#13131A] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute bottom-3.5 right-4 text-gray-400 hover:text-primary-500 transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex items-center gap-2"><Lock size={12} /> Confirm Password</label>
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={form.confirmPassword} 
                    onChange={e => setForm({...form, confirmPassword: e.target.value})} 
                    placeholder="Confirm new password" 
                    className={`w-full bg-[#F7F9FB] dark:bg-[#13131A] border ${form.password && form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#EFF2F5] dark:border-[#2a2a35]'} rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all`} 
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col md:flex-row items-center gap-4">
                <button 
                  disabled={loading}
                  className="w-full md:w-auto px-10 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-[20px] font-black text-[11px] uppercase tracking-widest hover:opacity-90 shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loading ? 'Processing...' : <><Save size={16} /> Save Profile Changes</>}
                </button>
                
                {message && (
                  <p className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {message.text}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#1A1D1F] rounded-[32px] p-8 shadow-premium group">
            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 text-primary-400">Security Tips</h4>
            <ul className="space-y-4">
               <li className="text-sm font-bold text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div> Use a strong, unique password.
               </li>
               <li className="text-sm font-bold text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div> Don't share your login credentials.
               </li>
               <li className="text-sm font-bold text-gray-400 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div> Log out after finishing your session.
               </li>
            </ul>
         </div>

         <div className="bg-white dark:bg-[#1c1c24] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-[32px] p-8 shadow-sm">
            <h4 className="text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Home size={14} className="text-primary-500" /> Room Information</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Total Rooms</span>
                  <span className="font-bold text-gray-800 dark:text-white">{roomStats.total}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Available</span>
                  <span className="font-bold text-green-500">{roomStats.available}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Occupied</span>
                  <span className="font-bold text-red-500">{roomStats.occupied}</span>
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-[#1c1c24] border border-[#EFF2F5] dark:border-[#2a2a35] rounded-[32px] p-8 shadow-sm">
            <h4 className="text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest mb-4">Login Activity</h4>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-400 uppercase tracking-widest">Last Login Time</span>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-gray-800 dark:text-white whitespace-nowrap">{new Date().toLocaleDateString('en-GB')}</span>
                    <span className="font-black text-primary-500 text-[10px] mt-0.5">{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
