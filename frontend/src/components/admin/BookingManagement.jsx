import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, ChevronDown, X, Calendar, CalendarCheck, User, BedDouble, Clock, Hash, CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const BOOKINGS = [];

const STATUS_BADGE = {
  'Checked In': 'bg-gray-800 text-white',
  'Checked Out': 'bg-gray-100 dark:bg-[#2a2a35] text-gray-600 dark:text-[#a1a1aa]',
  Reserved: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  Confirmed: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  Cancelled: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400',
  Pending: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 animate-pulse',
};

const PAY_BADGE = {
  Paid: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  Pending: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  Partial: 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
  Refunded: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
};

const ViewBookingModal = ({ booking, onClose }) => {
  if (!booking) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-2xl rounded-[32px] shadow-premium overflow-hidden border border-border dark:border-[#2a2a35] animate-in fade-in zoom-in duration-300">
        <div className="px-8 py-6 border-b border-border dark:border-[#2a2a35] flex items-center justify-between bg-gray-50/50 dark:bg-[#13131a]/50">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Booking Details</h3>
            <p className="text-xs text-secondary-500 font-bold uppercase tracking-widest mt-0.5">{booking.id}</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl hover:bg-red-50 hover:text-red-500 text-gray-400 dark:text-[#a1a1aa] transition-all"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-y-8 gap-x-12">
            {[
              { label: 'Guest Full Name', value: booking.guest, icon: <User size={16} /> },
              { label: 'Phone Number', value: booking.phone || '—', icon: <Hash size={16} /> },
              { label: 'Room', value: booking.room, icon: <BedDouble size={16} /> },
              { label: 'Booking Source', value: booking.source, icon: <Calendar size={16} /> },
              { label: 'Check-In Date', value: booking.checkin, icon: <Clock size={16} /> },
              { label: 'Check-Out Date', value: booking.checkout, icon: <Clock size={16} /> },
              { label: 'No. of Adults', value: booking.adults || 1 },
              { label: 'No. of Children', value: booking.children || 0 },
              { label: 'Payment Method', value: booking.method, icon: <CreditCard size={16} /> },
              { label: 'Payment Status', value: booking.payment, customClass: PAY_BADGE[booking.payment] },
              { label: 'Residential Address', value: booking.address || '—', span: 2 },
              { label: 'ID Proof Type', value: booking.idType || '—' },
              { label: 'ID Proof Number', value: booking.idNum || '—' },
              { label: 'Visiting Purpose', value: booking.purpose || '—' },
              { label: 'Transportation', value: booking.transport || '—' },
              { label: 'Total Amount', value: `₹${booking.amount.toLocaleString()}`, icon: <DollarSign size={16} /> },
              ...(booking.transport === 'Vehicle' ? [{ label: 'Vehicle Reg. Number', value: booking.vehicleReg || '—' }] : []),
            ].map((item, i) => (
              <div key={i} className={item.span ? `col-span-${item.span}` : ''}>
                <label className="text-[10px] font-black text-gray-400 dark:text-[#a1a1aa] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  {item.icon} {item.label}
                </label>
                {item.customClass ? (
                   <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${item.customClass}`}>{item.value}</span>
                ) : (
                   <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50/50 dark:bg-[#13131a]/50 border-t border-border dark:border-[#2a2a35] flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-gray-900 border-4 border-white dark:border-[#2a2a35] text-white rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl active:scale-95">CLOSE PORTAL</button>
        </div>
      </div>
    </div>
  );
};


const AddBookingModal = ({ onClose, onSaved }) => {
  const [rooms, setRooms] = useState([]);
  const { showToast } = useToast();
  useEffect(() => {
    api.getRooms().then(setRooms).catch(console.error);
  }, []);
  
  const [form, setForm] = useState({
    guest: '', phone: '', room: '', roomType: 'General', source: 'Direct',
    bookingBasis: 'Day', 
    checkin: new Date().toISOString().split('T')[0], 
    checkout: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    durationHours: 1, 
    adults: 1, children: 0,
    paymentMethod: 'Cash', paymentStatus: 'Paid', requests: '',
    address: '', idProofType: 'Aadhar', idProofs: [''], 
    visitingPurpose: 'Personal', transportType: 'Public Transport', vehicleRegNumber: ''
  });

  // Unique Room Types available
  const availableTypes = [...new Set(rooms.map(r => String(r.type || '').trim()))];
  
  // Filtered rooms based on selected type
  const filteredRooms = rooms.filter(r => 
    String(r.type || '').trim() === String(form.roomType || '').trim() && 
    String(r.status || '').trim() === 'Available'
  );

  // Initialize first room if empty
  useEffect(() => {
    if (filteredRooms.length > 0 && !form.room) {
      setForm(prev => ({ prev, room: `${filteredRooms[0].roomNumber} - ${String(filteredRooms[0].type||'').trim()}` }));
    }
  }, [filteredRooms, form.room]);

  const handleChange = (field, value) => {
    if (field === 'roomType') {
       setForm(p => ({ ...p, [field]: value, room: '' }));
    } else {
       setForm(p => ({ ...p, [field]: value }));
    }
  };

  const handleSave = () => {
    if (!form.guest || !form.room) {
      showToast("Please fill in Guest Name and Select a Room", 'warning');
      return;
    }
    if (!form.address.trim()) {
      showToast("Residential Address is mandatory", 'warning');
      return;
    }
    const cleanProofs = (form.idProofs || []).map(p => p.trim()).filter(Boolean);
    if (cleanProofs.length === 0) {
      showToast("ID Proof Number is mandatory for primary guest.", 'warning');
      return;
    }
    
    // Find the selected room to get its specific price
    const selectedRoomNumber = form.room.split(' - ')[0];
    const roomDetails = rooms.find(r => String(r.roomNumber) === String(selectedRoomNumber));
    const dayPrice = Number(roomDetails?.price) || 1000;

    
    let totalAmount = 0;
    let nights = 0;
    let checkoutVal = form.checkout;

    if (form.bookingBasis === 'Day') {
        const d1 = new Date(form.checkin);
        const d2 = new Date(form.checkout);
        nights = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) || 1);
        totalAmount = dayPrice * nights;
    } else {
        // Hourly logic: 1/12th of day price per hour (example rate)
        const hourPrice = Math.round(dayPrice / 8); 
        const hours = Number(form.durationHours) || 1;
        totalAmount = hourPrice * hours;
        nights = hours / 24; // Represent as fraction of day
        checkoutVal = `${form.checkin} (${hours} Hours)`;
    }

    setSubmitting(true);
    onSaved({
      id: `BKG-${Math.floor(1000 + Math.random() * 9000)}`,
      guest: form.guest,
      room: form.room,
      type: form.room.split(' - ')[1] || form.roomType,
      checkin: form.checkin,
      checkout: checkoutVal,
      nights: nights,
      amount: totalAmount,
      status: 'Confirmed',
      payment: form.paymentStatus,
      method: form.paymentMethod,
      source: form.source,
      address: form.address,
      idType: form.idProofType,
      idNum: cleanProofs.join(', '),
      purpose: form.visitingPurpose,
      transport: form.transportType,
      vehicleReg: form.vehicleRegNumber,
      phone: form.phone,
      adults: form.adults,
      children: form.children,
      bookingBasis: form.bookingBasis // Extra metadata
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-xl rounded-2xl shadow-premium overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border dark:border-[#2a2a35]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">New Guest Registration</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a2a35] dark:bg-[#2a2a35] text-gray-500 dark:text-[#a1a1aa]"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
               <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-2 block">Booking Type</label>
               <div className="flex bg-gray-100 dark:bg-[#13131A] p-1 rounded-xl w-fit">
                  {['Day', 'Hour'].map(b => (
                    <button key={b} onClick={() => handleChange('bookingBasis', b)} 
                      className={`px-6 py-2 text-xs font-bold uppercase rounded-lg transition-all ${form.bookingBasis === b ? 'bg-white dark:bg-[#2a2a35] shadow-sm text-primary-500' : 'text-gray-400'}`}>
                      {b} Basis
                    </button>
                  ))}
               </div>
            </div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Guest Full Name</label>
            <input value={form.guest} onChange={e=>handleChange('guest', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="Guest Full Name" /></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Phone Number</label>
            <input value={form.phone} onChange={e=>handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="Phone Number" /></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Select Room Type</label>
            <select value={form.roomType} onChange={e=>handleChange('roomType', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              {availableTypes.length > 0 ? availableTypes.map(t => <option key={t} value={t}>{t}</option>) : <option>No Types Available</option>}
            </select></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Select Room</label>
            <select value={form.room} onChange={e=>handleChange('room', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option value="">{filteredRooms.length > 0 ? '-- Select Room --' : 'No Rooms Available'}</option>
              {filteredRooms.map(r => <option key={r.roomNumber} value={`${r.roomNumber} - ${String(r.type||'').trim()}`}>{r.roomNumber} - {r.name || String(r.type||'').trim()}</option>)}
            </select></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Booking Source</label>
            <select value={form.source} onChange={e=>handleChange('source', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option>Direct</option><option>Booking.com</option><option>OYO</option><option>MakeMyTrip</option>
            </select></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Check-In Date</label>
            <input type="date" value={form.checkin} onChange={e=>handleChange('checkin', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>

            {form.bookingBasis === 'Day' ? (
                <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Check-Out Date</label>
                <input type="date" value={form.checkout} onChange={e=>handleChange('checkout', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>
            ) : (
                <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Duration (Hours)</label>
                <input type="number" min="1" max="23" value={form.durationHours} onChange={e=>handleChange('durationHours', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Adults</label>
              <input type="number" min="1" value={form.adults} onChange={e=>handleChange('adults', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2 text-sm text-black font-bold focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>
              <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Children</label>
              <input type="number" min="0" value={form.children} onChange={e=>handleChange('children', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2 text-sm text-black font-bold focus:outline-none focus:ring-2 focus:ring-primary-200" /></div>
            </div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Payment Method</label>
            <select value={form.paymentMethod} onChange={e=>handleChange('paymentMethod', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option>Cash</option><option>QR Code</option><option>Card</option><option>UPI</option>
            </select></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Initial Status</label>
            <select value={form.paymentStatus} onChange={e=>handleChange('paymentStatus', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option>Paid</option><option>Pending</option><option>Partial</option>
            </select></div>

            <div className="col-span-2"><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Residential Address <span className="text-red-500">*</span></label>
            <textarea rows={2} value={form.address} onChange={e=>handleChange('address', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none" placeholder="Enter guest's full address (required)" /></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">ID Proof Type</label>
            <select value={form.idProofType} onChange={e=>handleChange('idProofType', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option>Aadhar</option><option>Passport</option><option>VoterID</option><option>Driving Licence</option>
            </select></div>

            <div className={`col-span-2 space-y-2`}>
               <label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] block">ID Proof Numbers <span className="text-red-500">*</span></label>
               <div className={`grid gap-3 ${form.adults > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                 {Array.from({ length: Math.max(1, Number(form.adults) || 1) }).map((_, i) => (
                   <input 
                     key={i}
                     value={form.idProofs?.[i] || ''} 
                     onChange={e => {
                       const newArr = [...(form.idProofs || [])];
                       newArr[i] = e.target.value;
                       handleChange('idProofs', newArr);
                     }} 
                     className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200" 
                     placeholder={`Member ${i + 1} ID Number (required)`} 
                   />
                 ))}
               </div>
            </div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Visiting Purpose <span className="text-red-500">*</span></label>
            <select value={form.visitingPurpose} onChange={e=>handleChange('visitingPurpose', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option value="">— Select Purpose —</option><option>Personal</option><option>Business</option><option>Leisure</option><option>Other</option>
            </select></div>

            <div><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Transportation</label>
            <select value={form.transportType} onChange={e=>handleChange('transportType', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option>Public Transport</option><option>Vehicle</option>
            </select></div>

            {form.transportType === 'Vehicle' && (
              <div className="col-span-2 animate-fade-in"><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Vehicle Reg. Number</label>
              <input value={form.vehicleRegNumber} onChange={e=>handleChange('vehicleRegNumber', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-black font-bold bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="e.g. TN30 AL 4727" /></div>
            )}
            <div className="col-span-2"><label className="text-sm font-medium text-gray-600 dark:text-[#a1a1aa] mb-1 block">Special Requests</label>
            <textarea rows={1} value={form.requests} onChange={e=>handleChange('requests', e.target.value)} className="w-full border border-border dark:border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white bg-white dark:bg-[#2a2a35] focus:outline-none focus:ring-2 focus:ring-primary-200 resize-none" placeholder="Any special requests..." /></div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-border dark:border-[#2a2a35] flex justify-end gap-3 bg-gray-50/50 dark:bg-[#13131a]/30">
          <button onClick={onClose} className="px-8 py-3 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50" disabled={submitting}>Cancel</button>
          <button onClick={handleSave} className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50" disabled={submitting}>
            {submitting ? 'Creating...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};


const AssignRoomModal = ({ booking, onClose, onAssigned }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await api.getRooms();
        // Filter by the type requested if possible, or just show all available
        const available = data.filter(r => r.status === 'Available');
        setRooms(available);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [booking]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1c24] w-full max-w-xl rounded-2xl shadow-premium overflow-hidden border border-border dark:border-[#2a2a35] flex flex-col max-h-[85vh]">
        <div className="px-6 py-5 border-b border-border dark:border-[#2a2a35] flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Assign Room</h3>
            <p className="text-xs text-secondary-500 font-bold uppercase tracking-widest mt-0.5">
              {booking.guest} • {booking.type}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a2a35] text-gray-400"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary-500 rounded-full"></div></div>
          ) : rooms.length === 0 ? (
            <div className="text-center py-10 text-gray-400 uppercase font-black tracking-widest text-xs">No Available Rooms Found</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {rooms.map(room => (
                <button 
                  key={room._id}
                  onClick={() => onAssigned(room)}
                  className="p-4 rounded-2xl border border-border dark:border-[#2a2a35] hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-all text-left flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#2a2a35] flex items-center justify-center text-gray-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    <BedDouble size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-800 dark:text-white">{room.roomNumber}</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-primary-400">{room.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-5 border-t border-border dark:border-[#2a2a35] bg-gray-50/50 dark:bg-[#13131a]/30 flex justify-end">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-500 border border-gray-200 dark:border-[#2a2a35] hover:bg-gray-100 dark:hover:bg-[#2a2a35] transition-all">CANCEL</button>
        </div>
      </div>
    </div>
  );
};


import api from '../../services/api';

export default function BookingManagement({ initialStatus = 'All', sourceFilter = null, onAssignToPortal = null }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [filterPayment, setFilterPayment] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewBooking, setViewBooking] = useState(null);
  const [assigningBooking, setAssigningBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, confirm } = useToast();

  const fetchBookings = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.getBookings('limit=100&summary=true');
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    
    // Auto-refresh every 3 seconds to catch new online requests silently
    const interval = setInterval(() => {
      fetchBookings(true);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const sourceFilteredBookings = sourceFilter 
    ? bookings.filter(b => 
        b.source === sourceFilter || 
        (sourceFilter === 'Website' && b.source === 'Direct Form') ||
        (sourceFilter === 'Website' && !b.source) // Fallback for old records
      )
    : bookings;

  const stats = [
    { label: 'Total Bookings', value: sourceFilteredBookings.length, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' },
    { label: 'Checked In', value: sourceFilteredBookings.filter(b => b.status === 'Checked In').length, color: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' },
    { label: 'Reserved', value: sourceFilteredBookings.filter(b => b.status === 'Reserved').length, color: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
    { label: 'Checked Out', value: sourceFilteredBookings.filter(b => b.status === 'Checked Out').length, color: 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400' },
    { label: 'Revenue (Check-In Today)', value: `₹${sourceFilteredBookings.filter(b => b.checkin === new Date().toISOString().split('T')[0]).reduce((s,b) => s + (Number(b.amount) || 0), 0).toLocaleString()}`, color: 'bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400' },
    { label: 'Pending Payment', value: sourceFilteredBookings.filter(b => b.payment === 'Pending').length, color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
    { label: 'New Requests', value: sourceFilteredBookings.filter(b => b.status === 'Pending').length, color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20' },
  ];

  const filtered = sourceFilteredBookings.filter(b => {
    const q = search.toLowerCase();
    const guest = (b.guest || '').toLowerCase();
    const id = (b.id || '').toLowerCase();
    const room = (b.room || '').toLowerCase();
    
    const matchesSearch = guest.includes(q) || id.includes(q) || room.includes(q);
    const matchesStatus = (filterStatus === 'All' || b.status === filterStatus);
    const matchesPayment = (filterPayment === 'All' || b.payment === filterPayment);
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {showModal && <AddBookingModal onClose={() => setShowModal(false)} onSaved={async (b) => {
        try {
          const created = await api.createBooking(b);
          setBookings(prev => [created, ...prev]);
          
          const roomsResponse = await api.getRooms();
          const selectedRoom = roomsResponse.find(r => `${r.roomNumber} - ${r.type}` === b.room);
          if (selectedRoom) {
            await api.updateRoom(selectedRoom._id, { status: 'Occupied' });
          }
          
          setShowModal(false);
        } catch (error) {
          alert('Booking error: ' + error.message);
        }
      }} />}

      {viewBooking && <ViewBookingModal booking={viewBooking} onClose={() => setViewBooking(null)} />}

      {assigningBooking && (
        <AssignRoomModal 
          booking={assigningBooking} 
          onClose={() => setAssigningBooking(null)} 
          onAssigned={async (room) => {
            if (onAssignToPortal) {
              onAssignToPortal(room, assigningBooking);
              setAssigningBooking(null);
              return;
            }
            try {
              const bookingId = assigningBooking._id || assigningBooking.id;
              if (!bookingId) throw new Error('Booking ID is missing');
              
              const updatedBooking = {
                ...assigningBooking,
                room: `${room.roomNumber} - ${room.type}`,
                status: 'Confirmed'
              };
              
              console.log('Assigning Room:', { bookingId, roomId: room._id, updatedBooking });
              
              await api.updateBooking(bookingId, updatedBooking);
              await api.updateRoom(room._id, { status: 'Booked' });
              
              setBookings(prev => prev.map(b => (b._id === bookingId || b.id === bookingId) ? { ...b, ...updatedBooking } : b));
              setAssigningBooking(null);
              showToast('Room assigned successfully', 'success');
            } catch (err) {
              console.error('Assignment Error:', err);
              alert('Failed to assign room: ' + err.message);
            }
          }}
        />
      )}

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl p-4 border border-border dark:border-[#2a2a35] shadow-card flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest / booking ID..." className="pl-9 pr-4 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm text-black font-bold bg-white dark:bg-[#1c1c24] focus:outline-none focus:ring-2 focus:ring-primary-200 w-56" />
          </div>
          {[
            [filterStatus, setFilterStatus, ['All','Pending','Checked In','Checked Out','Reserved','Confirmed','Cancelled'], 'Status'],
            [filterPayment, setFilterPayment, ['All','Paid','Pending','Partial'], 'Payment'],
          ].map(([val, setter, options, label]) => (
            <div key={label} className="relative">
              <select value={val} onChange={e => setter(e.target.value)} className="pl-3 pr-8 py-2 border border-border dark:border-[#2a2a35] rounded-xl text-sm text-black font-bold bg-white dark:bg-[#1c1c24] focus:outline-none appearance-none">
                {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label === 'Status' ? 'Statuses' : label + 's'}` : o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#a1a1aa] pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1c1c24] rounded-2xl shadow-card border border-border dark:border-[#2a2a35] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>{['Booking ID','Guest','Mobile','Room','Type','Check-In','Check-Out','Nights','Actions'].map(h => <th key={h} className="table-header text-center">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a35] dark:bg-[#13131A] transition-colors">
                  <td className="table-cell font-semibold text-primary-600 text-center">{b.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">{b.guest?.[0] || 'G'}</div>
                      <span className="font-medium text-gray-800 dark:text-white">{b.guest}</span>
                    </div>
                  </td>
                  <td className="table-cell text-center font-bold text-gray-600 dark:text-gray-400">{b.phone || '—'}</td>
                  <td className="table-cell font-medium text-center">{b.room}</td>
                  <td className="table-cell text-gray-500 dark:text-[#a1a1aa] text-center">{b.type}</td>
                  <td className="table-cell text-center">{b.checkin}</td>
                  <td className="table-cell text-center">{b.checkout}</td>
                  <td className="table-cell text-center">
                    {b.nights < 1 
                      ? `${Math.round(b.nights * 24)} (hours)` 
                      : `${b.nights} ${b.nights === 1 ? 'Night' : 'Nights'}`
                    }
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => setViewBooking(b)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-500" title="View Details"><Eye size={14} /></button>
                      {b.status === 'Pending' && (
                        <button 
                          onClick={() => setAssigningBooking(b)} 
                          className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"
                          title="Assign Room"
                        >
                          Assign Room
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border dark:border-[#2a2a35] flex items-center justify-between bg-gray-50 dark:bg-[#13131A]">
          <span className="text-sm text-gray-500 dark:text-[#a1a1aa]">{filtered.length} bookings found</span>
          <span className="text-sm font-semibold text-gray-800 dark:text-white">Total Revenue: ₹{filtered.reduce((s,b) => s+b.amount,0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
