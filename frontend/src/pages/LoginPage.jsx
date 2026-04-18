import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, Timer, User, Phone } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ name: '', mobile: '', email: '', password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const normalizedData = {
                email: formData.email.trim().toLowerCase(),
                password: formData.password
            };
            const data = await api.login(normalizedData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            
            showToast(`Welcome back, ${data.name || 'User'}!`, 'success');

            const role = data.role?.toLowerCase() || '';
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'subadmin') navigate('/subadmin/dashboard');
            else if (role === 'manager') navigate('/manager/dashboard');
            else if (role === 'receptionist') navigate('/reception/dashboard');
            else navigate('/');
        } catch (err) {
            showToast(err.message || 'Authentication failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative flex flex-col lg:flex-row items-center justify-center lg:justify-start overflow-auto bg-black font-sans box-border m-0 p-0">
            {/* Background Image with Overlay */}
            <div className="fixed inset-0 z-0 select-none pointer-events-none">
                <img 
                    src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
                    alt="Luxury Hotel" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/50 to-black/80" />
            </div>

            {/* Left Content - Hidden on Mobile */}
            <div className="relative z-10 hidden lg:flex w-full lg:w-1/2 px-12 md:px-24 flex-col justify-center gap-6 py-20">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#DCEB8C]/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-[#DCEB8C]/20">
                        <Sparkles className="text-[#DCEB8C]" size={24} />
                    </div>
                    <div className="leading-tight">
                        <p className="text-white text-lg font-black tracking-tight">HOTEL</p>
                        <p className="text-[#DCEB8C] text-lg font-black tracking-tight -mt-1">MANAGEMENT</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-white text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                        Welcome<br />
                        <span className="text-gray-300">Back</span>
                    </h1>
                    <p className="text-gray-300 text-lg max-w-sm font-medium leading-relaxed">
                        Securely manage your premium suites and guest services with ease.
                    </p>
                    <div className="w-16 h-1.5 bg-[#DCEB8C] rounded-full mt-4" />
                </div>
            </div>

            {/* Login Card Container */}
            <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-4 min-h-screen py-12 lg:py-0">
                <div className="w-full max-w-[440px] bg-white/10 backdrop-blur-[40px] border border-white/20 rounded-[32px] md:rounded-[50px] p-6 md:p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    {/* Inner Glow/Gradients */}
                    <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[80px]" />

                    {/* Logo Header Internal */}
                    <div className="bg-white/5 border border-white/10 rounded-[30px] p-4 flex items-center gap-4 mb-10">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <p className="text-white text-lg font-black tracking-tight">HOTEL <span className="text-blue-400">SHUBHA SAI</span></p>
                            <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">LUXURY ROOMS & SUITES</p>
                        </div>
                    </div>



                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 border-r border-white/10 pr-3 my-3">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                className="w-full pl-[55px] pr-5 py-5 bg-black/40 border border-white/10 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-600"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 pr-3">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-[55px] pr-12 py-5 bg-black/40 border border-white/10 rounded-2xl text-white font-bold text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder-gray-600"
                                placeholder="Enter Password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-gradient-to-r from-[#4E65FF] via-[#9260FF] to-[#DB55FF] text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-[0_15px_30px_rgba(146,96,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? "PROCESSING..." : "SECURE ACCESS"}
                        </button>
                    </form>




                    {/* Floating Decoration Icons like in screenshot */}
                    <div className="absolute bottom-10 right-4 flex flex-col items-center gap-1 opacity-20 pointer-events-none">
                         <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white">
                             <Timer size={14} />
                         </div>
                         <div className="w-0.5 h-6 bg-white/20 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
