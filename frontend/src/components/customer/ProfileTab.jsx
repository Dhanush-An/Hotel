import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Shield, Camera } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ProfileTab = ({ user, setUser }) => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleUpdate = (e) => {
        e.preventDefault();
        showToast('Profile updated successfully', 'success');
    };

    return (
        <div className="profile-tab">
            <div className="tab-header">
                <div>
                    <h2>My Profile</h2>
                    <p className="text-slate-500 font-medium">Manage your personal information and security</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                    <div className="bg-white p-10 rounded-[40px] border border-slate-200 text-center relative overflow-hidden">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <img 
                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&size=256&background=random`} 
                                alt="Profile" 
                                className="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow-lg"
                            />
                            <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h3 className="text-xl font-black mb-1">{user.name}</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-8">{user.role}</p>
                        
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-4">
                            <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Email Verified</p>
                            <p className="text-sm font-bold text-blue-900">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[40px] border border-slate-200">
                        <h4 className="text-lg font-black mb-8 uppercase tracking-widest">General Information</h4>
                        <form className="space-y-6" onSubmit={handleUpdate}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input type="text" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-blue-500" defaultValue={user.name} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input 
                                            type="tel" 
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-blue-500" 
                                            value={user.mobile || ''} 
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setUser({...user, mobile: val});
                                            }}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input type="email" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:outline-none focus:border-blue-500" defaultValue={user.email} />
                                </div>
                            </div>
                            <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20">Save Changes</button>
                        </form>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] border border-slate-200">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center border border-red-100">
                                <Shield />
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-widest">Security</h4>
                        </div>
                        <div className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <p className="font-bold mb-1">Update Password</p>
                                <p className="text-xs text-slate-400 font-medium">Regularly changing your password helps secure your account.</p>
                            </div>
                            <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest">Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileTab;
