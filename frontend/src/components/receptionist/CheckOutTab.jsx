import React, { useState, useEffect } from 'react';
import { User, Calendar, Home, Hash, ArrowRight, CheckCircle2, DollarSign, Calculator, Receipt, LogOut, Search, Filter, CreditCard, Clock, X, FileText, ChevronRight } from 'lucide-react';

import api from '../../services/api';

const CheckOutTab = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [shiftGuest, setShiftGuest] = useState(null);
  const [shiftForm, setShiftForm] = useState({ reason: '', newRoomId: '' });

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bData, rData] = await Promise.all([
        api.getBookings(),
        api.getRooms()
      ]);
      setBookings(bData);
      setRooms(rData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real data for "Checkout List" from Checked In bookings
  const checkoutList = bookings.filter(b => b.status === 'Checked In').map(b => {
    const checkInDate  = b.checkin  || b.checkIn;
    const checkOutDate = b.checkout || b.checkOut;

    // Use stored nights first; otherwise calculate from dates
    let nights = Number(b.nights) || 0;
    if (!nights) {
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      if (!isNaN(d1) && !isNaN(d2)) {
        nights = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
      }
    }
    nights = nights || 1;

    const roomPrice = nights > 0 ? Math.round(Number(b.amount) / nights) : 2500;

    return {
       id: b._id,
       name: b.guest,
       room: b.room,
       bookingId: b._id,
       in:  checkInDate,
       out: checkOutDate,
       nights,
       roomPrice: roomPrice || 2500,
       status: b.payment === 'Paid' ? 'Settled' : 'Pending',
       charges: { food: 0, laundry: 0, miniBar: 0, extraBed: 0, lateFee: 0 }
    };
  });

  const [tempCharges, setTempCharges] = useState({ food: 0, laundry: 0, miniBar: 0, extraBed: 0, lateFee: 0 });

  const filteredList = checkoutList.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.room.toLowerCase().includes(search.toLowerCase())
  );

  const handleProcessCheckout = (guest) => {
    setSelectedGuest(guest);
    setTempCharges({ ...guest.charges });
    setShowModal(true);
  };

  const calculateTotal = (guest, charges = null) => {
    const roomCost = guest.nights * guest.roomPrice;
    const finalCharges = charges || guest.charges;
    const additional = Object.values(finalCharges).reduce((a, b) => Number(a) + Number(b), 0);
    return roomCost + additional;
  };

  const updateCharge = (key, val) => {
    setTempCharges(prev => ({ ...prev, [key]: Number(val) }));
  };

  const handleFinalSettlement = async () => {
    if (!selectedGuest) return;
    try {
      // 1. Update Booking
      const b = bookings.find(x => x._id === selectedGuest.id);
      await api.updateBooking(selectedGuest.id, { ...b, status: 'Checked Out', payment: 'Paid' });

      // 2. Update Room Status to 'Cleaning'
      const roomNum = selectedGuest.room.split(' - ')[0].trim();
      const room = rooms.find(r => r.roomNumber === roomNum);
      if (room) {
        await api.updateRoom(room._id, { ...room, status: 'Cleaning' });
      }

      await fetchData();
      setShowModal(false);
      setSelectedGuest(null);
      alert(`Guest departure finalized. Room ${selectedGuest.room} is now set to CLEANING status.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRoomShiftClick = (guest) => {
    setShiftGuest(guest);
    setShiftForm({ reason: '', newRoomId: '' });
    setShowShiftModal(true);
  };

  const submitRoomShift = async (e) => {
    e.preventDefault();
    if (!shiftGuest || !shiftForm.newRoomId) return;

    try {
      const oldRoomNum = shiftGuest.room.split(' - ')[0].trim();
      const oldRoom = rooms.find(r => r.roomNumber === oldRoomNum);
      const newRoom = rooms.find(r => r._id === shiftForm.newRoomId);
      
      const b = bookings.find(x => x._id === shiftGuest.id);
      await api.updateBooking(shiftGuest.id, { 
        ...b, 
        room: `${newRoom.roomNumber} - ${newRoom.type}` 
      });

      if (oldRoom) {
        await api.updateRoom(oldRoom._id, { 
          ...oldRoom, 
          status: 'Maintenance',
          housekeeping: shiftForm.reason, // Use housekeeping as fallback if backend wasn't restarted to load `issue` schema
          issue: shiftForm.reason 
        });
      }

      await api.updateRoom(newRoom._id, {
          ...newRoom,
          status: 'Booked'
      });

      await fetchData();
      setShowShiftModal(false);
      setShiftGuest(null);
      alert('Room successfully shifted! The old room is now under maintenance.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Check Out Management</h2>
          <p className="text-sm text-gray-500 font-medium">Process guest departures and finalize room financial records</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-primary-50 text-primary-700 font-bold py-3 px-6 rounded-2xl transition-all shadow-sm flex items-center gap-2 hover:bg-primary-100 active:scale-95">
            <FileText size={18} />
            Daily Departure Report
          </button>
        </div>
      </div>

      {/* Departing Guest List */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by guest name, room or booking ID..." 
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all text-gray-800 font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-primary-600 shadow-sm transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-5 px-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Guest Details</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Stay Duration</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Check-In</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Checkout Schedule</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Billing</th>
                <th className="text-left py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Total</th>
                <th className="text-center py-5 px-6 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Room Shift</th>
                <th className="text-right py-5 px-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredList.map((guest) => (
                <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center font-bold text-xs group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                        {(() => {
                          const r = String(guest.room || 'N/A');
                          if (r.toLowerCase().includes('undefined') || r.toLowerCase().includes('null') || r.trim() === '') return 'N/A';
                          return r.toUpperCase().replace('ROOM', '').replace('R', '').trim();
                        })()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{guest.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{guest.bookingId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-bold text-gray-600 text-xs text-center">
                    {guest.nights} Nights
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                       <span className="text-[11px] font-black text-gray-700">{guest.in}</span>
                       <span className="text-[9px] font-bold text-green-500 uppercase">12:30 PM</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                       <div className="flex items-center gap-1.5 mb-1">
                          <Clock size={12} className="text-primary-500" />
                          <span className="text-[11px] font-black text-gray-700">{guest.out}</span>
                       </div>
                       <span className="text-[9px] font-bold text-orange-500 uppercase">11:00 AM TODAY</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase ${guest.status === 'Settled' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      {guest.status}
                    </span>
                  </td>
                  <td className="py-5 px-6 font-black text-gray-800 text-sm">
                    ₹{calculateTotal(guest).toLocaleString()}
                  </td>
                  <td className="py-5 px-6 text-center">
                    <button
                      onClick={() => handleRoomShiftClick(guest)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold py-2 px-4 rounded-xl text-[10px] transition-all shadow-sm mx-auto flex items-center gap-1"
                    >
                      Room Shift
                    </button>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button 
                      onClick={() => handleProcessCheckout(guest)}
                      className="bg-gray-900 border-4 border-white hover:bg-black text-white font-extrabold py-2 px-4 rounded-xl text-[10px] transition-all flex items-center gap-2 ml-auto shadow-sm"
                    >
                      Process Checkout
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Detailed Modal */}
      {showModal && selectedGuest && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#F7F9FB] w-full max-w-[95%] xl:max-w-6xl rounded-[32px] shadow-2xl relative overflow-hidden animate-slide-up border border-white/20">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-400 via-primary-400 to-blue-400"></div>
            
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tighter">Settlement Summary</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[.2em] mt-0.5">Final Invoice — Room {selectedGuest.room}</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2.5 bg-white hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-xl transition-all shadow-sm border border-gray-50 active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Column 1: Info */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50/50">
                  <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest mb-5 opacity-40">
                    <User size={14} /> Guest Identity
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Name</p>
                      <p className="text-sm font-bold text-gray-800">{selectedGuest.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Room</p>
                        <p className="text-sm font-bold text-primary-600">{(String(selectedGuest.room || 'N/A').toUpperCase().startsWith('ROOM') ? selectedGuest.room : `Room ${selectedGuest.room || 'N/A'}`)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Booking ID</p>
                        <p className="text-sm font-bold text-gray-800">{selectedGuest.bookingId}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Check-In</p>
                        <p className="text-xs font-bold text-gray-600">{selectedGuest.in}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Check-Out</p>
                        <p className="text-xs font-bold text-gray-600">{selectedGuest.out}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Stay & Charges */}
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50/50">
                    <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-800 uppercase tracking-widest mb-4 opacity-40">
                      <Calculator size={14} /> Stay Summary
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400 font-bold">Duration</span>
                        <span className="font-bold text-gray-700">{selectedGuest.nights} Nights</span>
                      </div>
                      <div className="flex justify-between text-xs border-b border-gray-50 pb-2.5">
                        <span className="text-gray-400 font-bold">Price / Night</span>
                        <span className="font-bold text-gray-700">₹{selectedGuest.roomPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-800 font-black text-xs uppercase">Room Total</span>
                        <span className="text-lg font-black text-primary-700">₹{(selectedGuest.nights * selectedGuest.roomPrice).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50/50">
                    <h4 className="flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest mb-6">
                      <Receipt size={16} className="text-primary-600" /> ADDITIONAL CHARGES
                    </h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Food', key: 'food' },
                        { label: 'Laundry', key: 'laundry' },
                        { label: 'Mini-bar', key: 'miniBar' },
                        { label: 'Extra Bed', key: 'extraBed' },
                        { label: 'Late Fee', key: 'lateFee' },
                      ].map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-sm py-2 group">
                          <span className="text-gray-900 font-extrabold uppercase tracking-tight">{c.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 font-black text-xs">₹</span>
                            <input 
                              type="number"
                              value={tempCharges[c.key]}
                              onChange={(e) => updateCharge(c.key, e.target.value)}
                              className="w-32 text-center bg-white border-2 border-gray-100 hover:border-primary-400 focus:border-primary-600 px-4 py-4 rounded-[20px] outline-none text-gray-900 font-extrabold text-lg shadow-sm transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: Grand Total & Action */}
                <div className="flex flex-col">
                  <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 mb-3">Total Payable</p>
                      <p className="text-4xl font-black tracking-tighter">₹{calculateTotal(selectedGuest, tempCharges).toLocaleString()}</p>
                      <div className="mt-4 pt-4 border-t border-white/10 space-y-2 opacity-60">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>Subtotal</span>
                          <span>₹{(calculateTotal(selectedGuest, tempCharges) / 1.12).toFixed(0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold">
                          <span>GST @ 12%</span>
                          <span>₹{(calculateTotal(selectedGuest, tempCharges) - (calculateTotal(selectedGuest, tempCharges) / 1.12)).toFixed(0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleFinalSettlement}
                      className="w-full mt-6 bg-[#DCEB8C] hover:bg-[#CDDC7A] text-[#1A1D1F] font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 text-sm relative z-10"
                    >
                      <CreditCard size={18} />
                      Settle & Print
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-primary-100/30 rounded-2xl border border-primary-200/50">
                    <p className="text-[10px] font-bold text-primary-800 leading-tight italic">
                      "Guest confirmed satisfaction with the amenities. Check for mini-bar inventory before final clearance."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Shift Modal */}
      {showShiftModal && shiftGuest && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative overflow-hidden animate-slide-up border border-white/20">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-400 via-primary-400 to-blue-400"></div>
            
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tighter">Room Shift</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[.2em] mt-0.5">Transfer Guest to New Room</p>
                </div>
                <button 
                  onClick={() => setShowShiftModal(false)}
                  className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-xl transition-all shadow-sm border border-gray-100 active:scale-90"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submitRoomShift} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Guest Name</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-bold text-sm">
                      {shiftGuest.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Current Room</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 font-bold text-sm">
                      {shiftGuest.room}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">New Assign Room</label>
                  <select 
                    required
                    value={shiftForm.newRoomId}
                    onChange={(e) => setShiftForm({...shiftForm, newRoomId: e.target.value})}
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  >
                    <option value="">-- Select Available Room --</option>
                    {rooms.filter(r => r.status === 'Available').map(r => (
                      <option key={r._id} value={r._id}>
                        {r.roomNumber} - {r.type} (₹{r.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Reason for Changing Room</label>
                  <textarea 
                    required
                    rows="3"
                    value={shiftForm.reason}
                    onChange={(e) => setShiftForm({...shiftForm, reason: e.target.value})}
                    placeholder="e.g. AC not working, leak in bathroom..."
                    className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowShiftModal(false)}
                    className="flex-1 py-3.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    Confirm Shift
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default CheckOutTab;


