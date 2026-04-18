import React from 'react';
import { 
  Bed, Calendar, CreditCard, 
  Phone, Plus, CheckCircle2, 
  AlertCircle
} from 'lucide-react';

const OverviewTab = ({ user, setActiveTab }) => {
    // Mock data for now
    const stats = [
        { label: 'Active Booking', value: '1', icon: <CheckCircle2 />, color: '#10b981', bg: '#d1fae5' },
        { label: 'Upcoming Stay', value: '0', icon: <Calendar />, color: '#6366f1', bg: '#e0e7ff' },
        { label: 'Total Bookings', value: '4', icon: <Bed />, color: '#f59e0b', bg: '#fef3c7' },
        { label: 'Pending Payment', value: '₹0', icon: <AlertCircle />, color: '#ef4444', bg: '#fee2e2' },
    ];

    const quickActions = [
        { id: 'explore', label: 'Book Room', icon: <Plus size={24} /> },
        { id: 'bookings', label: 'View Booking', icon: <Calendar size={24} /> },
        { id: 'payments', label: 'Pay Now', icon: <CreditCard size={24} /> },
        { id: 'support', label: 'Contact Hotel', icon: <Phone size={24} /> },
    ];

    return (
        <div className="overview-tab">
            <section className="dashboard-intro mb-10">
                <div className="bg-white p-10 rounded-[32px] border border-slate-200 flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black mb-2 leading-tight">Welcome back,<br /> <span className="text-blue-600">{user.name}</span></h2>
                        <p className="text-slate-500 font-medium max-w-md">Your comfort is our priority. You have an active booking for Room 302 today.</p>
                        <div className="flex gap-4 mt-8">
                             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                 Currently Checked-in
                             </div>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                         <img src="https://cdni.iconscout.com/illustration/premium/thumb/hotel-booking-service-illustration-download-in-svg-png-gif-file-formats--checking-in-reception-vacation-stay-pack-holidays-illustrations-4720194.png" alt="Travel" className="w-[300px] object-contain" />
                    </div>
                </div>
            </section>

            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-info">
                            <h3>{stat.label}</h3>
                            <div className="stat-value">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <section className="quick-actions-section">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Quick Actions</h3>
                </div>
                <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                        <button 
                            key={action.id} 
                            className="action-btn"
                            onClick={() => setActiveTab(action.id)}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                                {action.icon}
                            </div>
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default OverviewTab;
