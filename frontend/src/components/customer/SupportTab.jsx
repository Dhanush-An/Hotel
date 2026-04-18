import React from 'react';
import { Phone, MessageCircle, Mail, HelpCircle, Send } from 'lucide-react';

const SupportTab = () => {
    return (
        <div className="support-tab">
            <div className="tab-header">
                <div>
                    <h2>Support</h2>
                    <p className="text-slate-500 font-medium">We're here to help you 24/7 with any requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <h3 className="text-xl font-black mb-8">Reach Out Directly</h3>
                    
                    <a href="tel:+919901303998" className="flex items-center gap-6 p-8 bg-white border border-slate-200 rounded-[32px] transition-transform hover:scale-[1.02] cursor-pointer">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                            <Phone size={32} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Call Reception</p>
                            <h4 className="text-xl font-bold">+91 9901303998</h4>
                        </div>
                    </a>

                    <div className="flex items-center gap-6 p-8 bg-white border border-slate-200 rounded-[32px] transition-transform hover:scale-[1.02] cursor-pointer">
                        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                            <MessageCircle size={32} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">WhatsApp Support</p>
                            <h4 className="text-xl font-bold">Chat with us</h4>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-8 bg-white border border-slate-200 rounded-[32px] transition-transform hover:scale-[1.02] cursor-pointer">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                            <Mail size={32} />
                        </div>
                        <div>
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Email us</p>
                            <h4 className="text-xl font-bold">contactus@hotelshubhasai.in</h4>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-200">
                    <div className="flex items-center gap-4 mb-8">
                        <HelpCircle className="text-blue-600" />
                        <h3 className="text-lg font-black uppercase tracking-widest">Raise a Complaint / Request</h3>
                    </div>
                    
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                            <select className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm">
                                <option>Room Service Request</option>
                                <option>Housekeeping Need</option>
                                <option>Billing Issue</option>
                                <option>Maintenance Repair</option>
                                <option>Other Complaint</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message / Description</label>
                            <textarea rows="5" className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold text-sm focus:outline-none focus:border-blue-500" placeholder="Please describe how we can assist you..."></textarea>
                        </div>
                        <button className="w-full py-5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                            <Send size={16} /> SUBMIT REQUEST
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SupportTab;
