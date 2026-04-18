import React from 'react';
import { Download, X, Eye, FileText } from 'lucide-react';

const MyBookingsTab = () => {
    // Mock data for bookings
    const bookings = [
        { id: 'BK-7821', type: 'Junior Suite', room: '302', checkIn: '2026-04-12', checkOut: '2026-04-15', status: 'Checked-in', payment: 'Paid', color: '#10b981' },
        { id: 'BK-7890', type: 'Executive Suite', room: '105', checkIn: '2026-05-10', checkOut: '2026-05-12', status: 'Confirmed', payment: 'Pending', color: '#6366f1' },
        { id: 'BK-7500', type: 'Family Suite', room: '208', checkIn: '2026-03-01', checkOut: '2026-03-05', status: 'Checked-out', payment: 'Paid', color: '#64748b' },
    ];

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Confirmed': return 'status-confirmed';
            case 'Checked-in': return 'status-confirmed';
            case 'Cancelled': return 'status-cancelled';
            default: return 'status-confirmed';
        }
    };

    return (
        <div className="my-bookings-tab">
            <div className="tab-header">
                <div>
                    <h2>My Bookings</h2>
                    <p className="text-slate-500 font-medium">Manage your past and upcoming reservations</p>
                </div>
            </div>

            <div className="bookings-list">
                {bookings.map((booking) => (
                    <div key={booking.id} className="booking-ticket">
                        <div className="booking-status-accent" style={{ backgroundColor: booking.color }}></div>
                        <div className="booking-ticket-content">
                            <div className="b-info-group">
                                <label>Booking ID</label>
                                <div className="b-val font-black text-blue-600">{booking.id}</div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">{booking.type} • Room {booking.room}</div>
                            </div>
                            <div className="b-info-group">
                                <label>Dates</label>
                                <div className="b-val">{booking.checkIn} → {booking.checkOut}</div>
                            </div>
                            <div className="b-info-group">
                                <label>Status</label>
                                <div className={`b-status-pill ${getStatusClass(booking.status)}`}>
                                    {booking.status}
                                </div>
                            </div>
                            <div className="booking-actions">
                                <div className="b-action-icon" title="View Details"><Eye size={18} /></div>
                                <div className="b-action-icon" title="Download Invoice"><Download size={18} /></div>
                                {booking.status === 'Confirmed' && (
                                    <div className="b-action-icon text-red-500 border-red-100 bg-red-50" title="Cancel Booking"><X size={18} /></div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-12 p-8 bg-blue-50 border border-blue-100 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-blue-900">Need a detailed report?</h4>
                        <p className="text-blue-700/70 font-medium">Download your complete booking history as a PDF.</p>
                    </div>
                </div>
                <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg shadow-blue-500/20">Download All</button>
            </div>
        </div>
    );
};

export default MyBookingsTab;
