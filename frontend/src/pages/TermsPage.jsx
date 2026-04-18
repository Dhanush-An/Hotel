import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText, AlertTriangle } from 'lucide-react';

const TermsPage = () => {
    const terms = [
        "All payments are non-refundable under any circumstances.",
        "Guests are expected to take proper care of hotel property during their stay.",
        "Smoking is strictly allowed only in designated smoking areas.",
        "Pets are not allowed on the premises.",
        "Any damage or breakage of hotel property will be charged to the guest.",
        "Damage to room key or door lock will incur a penalty of ₹5,000, payable before checkout.",
        "Guests must submit room keys at reception while going out and collect them upon return.",
        "Loss of room key or failure to return the key at checkout will incur a charge of ₹5,000.",
        "The hotel is not responsible for loss of any valuables. Guests are advised to lock their rooms properly when leaving.",
        "Guests are not allowed to deposit valuables, luggage, or personal belongings at reception under any circumstances.",
        "If a room remains locked for 24 hours without prior intimation, management reserves the right to open the room using a master key, shift belongings to the locker room, and vacate the room.",
        "Guests may approach hotel staff for assistance and are expected to communicate respectfully and patiently.",
        "Any misbehavior, arguments, or inappropriate conduct with staff may lead to immediate termination of stay without refund.",
        "Guests are not permitted to collect personal information or contact numbers of hotel staff.",
        "Guests can contact reception directly for any service or assistance.",
        "All bills must be cleared in advance. Services cannot be availed on a post-payment basis.",
        "Additional persons are not allowed in the room unless registered at reception.",
        "Visitors are not permitted inside guest rooms.",
        "Orders from delivery services (e.g., food or online shopping) will not be accepted at reception, and delivery to room doorsteps is not allowed.",
        "Any damage to furniture or electronic items must be compensated by the guest before checkout.",
        "Staying beyond 24 hours will incur additional charges as per hotel policy.",
        "Rooms are strictly meant for lodging purposes only and must not be used for business or any other activities."
    ];

    return (
        <div className="min-h-screen bg-[#05070a] text-white font-inter selection:bg-primary-500/30">
            {/* Header / Navbar */}
            <header className="fixed top-0 w-full z-50 bg-[#05070a]/80 backdrop-blur-xl border-b border-white/5 py-4 px-8">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-primary-500" size={24} />
                        <span className="text-lg font-black tracking-tight uppercase">HOTEL <span className="text-primary-400">SHUBHA SAI</span></span>
                    </div>
                    <div className="w-24" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-4xl mx-auto pt-32 pb-20 px-6">
                <div className="text-center mb-16">
                    <div className="inline-flex p-3 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-6">
                        <FileText className="text-primary-500" size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Terms & <span className="italic text-primary-500 font-medium font-outfit uppercase">Conditions</span></h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">Please read these rules carefully before booking your stay at Hotel Shubha Sai. We aim for a secure and comfortable experience for all our guests.</p>
                </div>

                <div className="bg-[#0a0d14] border border-white/5 rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] pointer-events-none" />
                    
                    <div className="space-y-6">
                        {terms.map((term, index) => (
                            <div key={index} className="flex gap-6 items-start group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-500 group-hover:border-primary-500 group-hover:text-primary-500 transition-all duration-300">
                                    {(index + 1).toString().padStart(2, '0')}
                                </div>
                                <p className="text-gray-300 text-base leading-relaxed pt-1 group-hover:text-white transition-colors">
                                    {term.split(/\*(.*?)\*/).map((part, i) => (
                                        i % 2 === 1 ? <strong key={i} className="text-primary-400 font-bold">{part}</strong> : part
                                    ))}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex gap-6 items-center">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <p className="text-amber-500 font-black text-xs uppercase tracking-[0.2em] mb-1">Important Safety Notice</p>
                            <p className="text-gray-400 text-sm">Failure to comply with these terms may result in immediate dismissal from the hotel premises without refund.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-500 text-xs tracking-widest uppercase">
                    © 2026 FORGE INDIA CONNECT PVT LTD. ALL RIGHTS RESERVED.
                </div>
            </main>
        </div>
    );
};

export default TermsPage;
