import React from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';

const NotificationsTab = () => {
    const notifications = [
        { id: 1, title: 'Booking Confirmed', msg: 'Your reservation for the Junior Suite (Room 302) is confirmed.', time: '2h ago', type: 'success', icon: <CheckCircle2 /> },
        { id: 2, title: 'Check-in Reminder', msg: 'Don\'t forget! Your check-in is today at 12:00 PM.', time: '5h ago', type: 'info', icon: <Clock /> },
        { id: 3, title: 'Payment Successful', msg: 'We have received your payment of ₹3,000.', time: '1d ago', type: 'success', icon: <Zap /> },
        { id: 4, title: 'Special Offer', msg: 'Enjoy 20% off on your next spa visit.', time: '2d ago', type: 'offer', icon: <AlertCircle /> },
    ];

    const getTypeStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-green-50 text-green-600 border-green-100';
            case 'info': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'offer': return 'bg-purple-50 text-purple-600 border-purple-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="notifications-tab">
            <div className="tab-header">
                <div>
                    <h2>Notifications</h2>
                    <p className="text-slate-500 font-medium">Stay updated with your stay and exclusive offers</p>
                </div>
                <button className="text-xs font-black uppercase tracking-widest text-blue-600">Mark all as read</button>
            </div>

            <div className="space-y-4 max-w-4xl">
                {notifications.map((n) => (
                    <div key={n.id} className={`p-6 rounded-[24px] border flex gap-6 items-start transition-transform hover:scale-[1.01] ${getTypeStyles(n.type)}`}>
                        <div className="mt-1">{n.icon}</div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-black text-sm uppercase tracking-tight">{n.title}</h4>
                                <span className="text-[10px] font-bold opacity-60 uppercase">{n.time}</span>
                            </div>
                            <p className="text-sm font-medium opacity-80">{n.msg}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsTab;
