import React, { useState, useEffect } from 'react';
import { User, Calendar, Home, Hash, ArrowRight, CheckCircle2, Clock, Search, Filter, MoreVertical, LogIn } from 'lucide-react';

import api from '../../services/api';

const CheckInTab = () => {
  const [search, setSearch] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await api.getBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Calculate "Last Check-in Person" from real data
  const checkedInList = bookings.filter(b => b.status === 'Checked In');
  const lastBooking = checkedInList.length > 0 ? checkedInList[checkedInList.length - 1] : null;

  const lastCheckIn = lastBooking ? {
    guestName: lastBooking.guest,
    roomNumber: lastBooking.room,
    bookingId: lastBooking._id,
    checkInTime: lastBooking.checkin,
    checkOutDate: lastBooking.checkout,
    guestType: "Standard",
    identityProof: "Verified",
    status: "Checked In"
  } : {
    guestName: "No recent check-ins",
    roomNumber: "—",
    bookingId: "—",
    checkInTime: "—",
    checkOutDate: "—",
    guestType: "—",
    identityProof: "—",
    status: "None"
  };

  // Arrival List from Reserved, Confirmed, or Paid bookings (that are not yet checked in)
  const arrivals = bookings
    .filter(b => (b.status === 'Reserved' || b.status === 'Confirmed' || b.payment === 'Paid') && b.status !== 'Checked In' && b.status !== 'Checked Out')
    .map(b => ({
      id: b._id,
      name: b.guest,
      room: b.room,
      type: b.roomType || b.type,
      idProof: b.idNum ? 'Verified' : 'Pending',
      status: b.payment === 'Paid' ? 'Paid & Ready' : 'Expected',
      checkIn: b.checkin || b.checkIn,
      checkOut: b.checkout || b.checkOut
    }));

  const handleCheckIn = async (bookingId) => {
    try {
      const b = bookings.find(x => x._id === bookingId);
      if (!b) return;
      const updated = await api.updateBooking(bookingId, { ...b, status: 'Checked In' });
      setBookings(prev => prev.map(x => x._id === bookingId ? updated : x));
      alert(`Guest ${b.guest} has been successfully checked in!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredArrivals = arrivals.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) || 
    a.room.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Check In Management</h2>
          <p className="text-sm text-gray-500 font-medium">Manage daily arrivals and process guest registrations</p>
        </div>
        <button className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 active:scale-95">
          <CheckCircle2 size={18} />
          New Instant Check-In
        </button>
      </div>

      {/* Guest List Filter Bar */}

      {/* Guest List Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search guest name or room..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all text-gray-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-primary-600 shadow-sm transition-colors">
            <Filter size={18} />
          </button>
          <div className="h-12 w-[1px] bg-gray-100 mx-2"></div>
          <div className="flex bg-gray-100/50 p-1 rounded-xl">
            <button className="px-4 py-2 bg-white text-gray-800 text-xs font-bold rounded-lg shadow-sm">Today</button>
            <button className="px-4 py-2 text-gray-500 text-xs font-bold rounded-lg hover:text-gray-800">Tomorrow</button>
          </div>
        </div>
      </div>

      {/* Guest List Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-5 px-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Guest Info</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Room Type</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Verification</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Dates & Duration</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="text-right py-5 px-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredArrivals.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                        {guest.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{guest.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                          {(() => {
                            const r = String(guest.room || 'N/A');
                            if (r.toLowerCase().includes('undefined') || r.toLowerCase().includes('null') || r.trim() === '') return 'Room N/A';
                            return r.toUpperCase().startsWith('ROOM') ? r : `Room ${r}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="text-sm font-semibold text-gray-600">{guest.type}</span>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${guest.idProof === 'Verified' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      {guest.idProof}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-800 font-bold text-[11px]">
                        <Clock size={12} className="text-primary-500" />
                        In: {guest.checkIn}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px]">
                        <Calendar size={12} className="text-gray-300" />
                        Out: {guest.checkOut}
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <span className={`w-1.5 h-1.5 rounded-full ${guest.status === 'Expected' ? 'bg-blue-400' : guest.status === 'In Transit' ? 'bg-orange-400' : 'bg-green-400'} animate-pulse`}></span>
                      {guest.status}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button 
                      onClick={() => handleCheckIn(guest.id)}
                      className="bg-primary-50 hover:bg-primary-100 text-primary-700 font-extrabold py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-2 ml-auto"
                    >
                      <LogIn size={14} /> Process Check-In
                    </button>
                  </td>
                </tr>
              ))}
              {filteredArrivals.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="inline-flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-4">
                        <User size={32} />
                      </div>
                      <p className="text-gray-400 font-bold">No arrivals found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckInTab;

