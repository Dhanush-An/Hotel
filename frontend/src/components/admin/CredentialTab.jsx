import React, { useState, useEffect } from 'react';
import { Shield, Users, Key, Mail, Save, Edit, Search, Eye, EyeOff, Lock, X, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const CredentialTab = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal states
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPass, setNewPass] = useState({ password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Fetch staff for managing credentials
    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const data = await api.getStaff();
            // Filter only subadmin, manager, receptionist for "Employee Credentials"
            const filtered = data.filter(s => 
                ['subadmin', 'manager', 'receptionist'].includes(s.role?.toLowerCase().replace(/\s/g, '').replace(/-/g, ''))
            );
            setStaff(filtered);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPass.password || newPass.password !== newPass.confirm) {
            alert('Passwords must match and cannot be empty');
            return;
        }

        try {
            setLoading(true);
            // In our system, staff update with password field handles user credential sync
            await api.updateStaff(selectedEmployee._id, { 
                password: newPass.password 
            });
            
            setSuccessMsg('Credential updated successfully!');
            setTimeout(() => {
                setSuccessMsg('');
                setIsModalOpen(false);
                setSelectedEmployee(null);
                setNewPass({ password: '', confirm: '' });
            }, 2000);
        } catch (err) {
            alert(err.message || 'Failed to update credential');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-[#1A1D1F] dark:text-white flex items-center gap-3">
                    <Key className="text-blue-500" /> Credential Management
                </h2>
                <p className="text-[#6F767E] dark:text-gray-400 font-bold mt-1 uppercase tracking-widest text-[11px]">
                    Manage System & Employee Access
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Admin Credentials Box */}
                <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-8 border border-gray-100 dark:border-[#272B30] shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-[#1A1D1F] dark:text-white uppercase tracking-tight">Admin Credentials</h3>
                            <p className="text-[11px] text-[#6F767E] font-bold">System Root Access</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-[11px] font-black text-[#6F767E] uppercase tracking-[0.2em] mb-2 px-1">ROOT EMAIL ID</p>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-[#272B30]">
                                <Mail size={18} className="text-[#6F767E]" />
                                <input type="text" value="admin@hotel.com" disabled className="bg-transparent font-black text-[#1A1D1F] dark:text-white w-full outline-none" />
                            </div>
                        </div>
                        
                        <div>
                            <p className="text-[11px] font-black text-[#6F767E] uppercase tracking-[0.2em] mb-2 px-1">SECURITY PASSWORD</p>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-[#272B30] relative">
                                <Key size={18} className="text-[#6F767E]" />
                                <input type={showPass ? "text" : "password"} value="admin123" disabled className="bg-transparent font-black text-[#1A1D1F] dark:text-white w-full outline-none" />
                                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 text-gray-400">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all mt-4 border border-white/10">
                            <Edit size={16} /> Update Admin Login
                        </button>
                    </div>
                </div>

                {/* 2. Employee Credentials Box */}
                <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-8 border border-gray-100 dark:border-[#272B30] shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-500">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-[#1A1D1F] dark:text-white uppercase tracking-tight">Employee Credentials</h3>
                                <p className="text-[11px] text-[#6F767E] font-bold">Manage Staff Access</p>
                            </div>
                        </div>
                    </div>

                    {/* Simple Search */}
                    <div className="relative mb-6">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6F767E]" />
                        <input 
                            type="text" 
                            placeholder="SEARCH BY NAME OR EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-[#272B30] text-sm font-bold uppercase tracking-widest text-[#1A1D1F] dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin">
                        {staff.filter(s => 
                            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                        ).map((emp) => (
                            <div 
                                key={emp._id} 
                                onClick={() => { setSelectedEmployee(emp); setIsModalOpen(true); }}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-50 dark:border-[#272B30] group hover:border-purple-500/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center font-black text-xs text-purple-500 uppercase tracking-tighter shadow-sm">
                                        {(emp.name || 'S').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#1A1D1F] dark:text-white capitalize">{emp.name}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md">
                                                {emp.role}
                                            </span>
                                            <p className="text-[11px] text-[#6F767E] font-bold">{emp.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-3 text-[#6F767E] group-hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 rounded-xl transition-colors">
                                    <Key size={18} />
                                </button>
                            </div>
                        ))}

                        {staff.length === 0 && (
                            <div className="text-center py-20 bg-gray-50 dark:bg-black/10 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                                <Users size={40} className="mx-auto text-gray-300 mb-4 opacity-20" />
                                <p className="text-[#6F767E] font-bold uppercase tracking-widest text-xs">No active staff found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Credential Update Modal */}
            {isModalOpen && selectedEmployee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-md rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-500">
                                <Key size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-[#1A1D1F] dark:text-white uppercase tracking-tight">Edit Credentials</h3>
                                <p className="text-xs text-[#6F767E] font-bold uppercase tracking-widest">{selectedEmployee.name}</p>
                            </div>
                        </div>

                        {successMsg ? (
                            <div className="py-12 text-center space-y-4 animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto">
                                    <CheckCircle size={40} />
                                </div>
                                <p className="font-black text-green-600 dark:text-green-400 uppercase tracking-widest text-sm">{successMsg}</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-[#6F767E] uppercase tracking-[0.2em] mb-2 px-1">NEW PASSWORD</p>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                           <Lock size={18} />
                                        </div>
                                        <input 
                                            type={showPass ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={newPass.password}
                                            onChange={(e) => setNewPass({...newPass, password: e.target.value})}
                                            className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-[#272B30] text-sm font-bold text-[#1A1D1F] dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50"
                                        />
                                        <button 
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                                        >
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-[#6F767E] uppercase tracking-[0.2em] mb-2 px-1">CONFIRM PASSWORD</p>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 group-focus-within:text-purple-500 transition-colors">
                                           <Lock size={18} />
                                        </div>
                                        <input 
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={newPass.confirm}
                                            onChange={(e) => setNewPass({...newPass, confirm: e.target.value})}
                                            className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-[#272B30] text-sm font-bold text-[#1A1D1F] dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50"
                                        />
                                        <button 
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-purple-500 transition-colors"
                                        >
                                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleUpdatePassword}
                                    disabled={loading}
                                    className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 hover:bg-purple-700 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Securely Update Access'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Disclaimer */}
            <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                 <p className="text-xs text-blue-800 dark:text-blue-400 font-bold leading-relaxed">
                     <span className="uppercase text-[10px] tracking-widest py-1 px-3 bg-blue-100 dark:bg-blue-800 rounded-full mr-2">Security Notice</span>
                     System credentials allow access to sensitive areas. Ensure all passwords updated are high-security and unique. All login IDs are linked to the employee's registered email address.
                 </p>
            </div>
        </div>
    );
};

export default CredentialTab;
