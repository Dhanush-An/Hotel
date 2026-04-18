import React from 'react';
import { CreditCard, ArrowUpRight, Download } from 'lucide-react';

const PaymentsTab = () => {
    return (
        <div className="payments-tab">
            <div className="tab-header">
                <div>
                    <h2>Payments</h2>
                    <p className="text-slate-500 font-medium">View your billing history and settle pending amounts</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[32px] text-white shadow-xl">
                    <p className="text-white/70 font-bold uppercase text-[10px] tracking-widest mb-2">Total Outstanding</p>
                    <h3 className="text-4xl font-black mb-6">₹0.00</h3>
                    <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest">Pay Now</button>
                </div>
                
                <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Paid Amount</p>
                    <h3 className="text-4xl font-black mb-2">₹12,450</h3>
                    <p className="text-green-500 font-bold text-xs flex items-center gap-1">
                        <ArrowUpRight size={14} /> + ₹3,000 this month
                    </p>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-slate-200">
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-2">Preferred Method</p>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                            <CreditCard className="text-slate-400" />
                        </div>
                        <div>
                            <p className="font-bold">UPI / Cards</p>
                            <p className="text-xs text-slate-400 font-medium underline cursor-pointer">Manage methods</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black uppercase tracking-widest text-sm">Payment History</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-slate-50/50 text-left">
                        <tr>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-5 font-bold text-sm">TXN-098127</td>
                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">12 Apr 2026</td>
                            <td className="px-8 py-5 text-sm text-slate-500 font-medium">UPI (PhonePe)</td>
                            <td className="px-8 py-5 font-black text-sm text-right">₹3,000.00</td>
                            <td className="px-8 py-5 text-center">
                                <button className="text-blue-600 hover:text-blue-800 transition-colors"><Download size={18} /></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsTab;
