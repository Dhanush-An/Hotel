import React, { useState, useEffect } from 'react';
import {
  BedDouble, Search, LayoutGrid, List, Plus, Upload, Download,
  Eye, Edit2, Trash2, CheckCircle, Wrench, UserCheck, X, ChevronDown,
  Wifi, Tv, Wind, Loader2, AlertCircle, CheckCheck, Users
} from 'lucide-react';



const STATUS_COLOR = {
  Available:       'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
  Occupied:        'bg-gray-900 dark:bg-black text-white dark:text-gray-100 border-gray-800',
  Booked:          'bg-gray-900 dark:bg-black text-white dark:text-gray-100 border-gray-800',
  Reserved:        'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  Cleaning:        'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
  Maintenance:     'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'Out of Service':'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
};

const STATUS_DOT = {
  Available:       'bg-green-500',
  Occupied:        'bg-gray-900 dark:bg-white',
  Booked:          'bg-gray-900 dark:bg-white',
  Reserved:        'bg-amber-500',
  Cleaning:        'bg-yellow-500',
  Maintenance:     'bg-blue-500',
  'Out of Service':'bg-red-500',
};

const STATIC_ROOMS = [];

const INIT_FORM = {
  roomNumber: '', name: '', floor: '', maxOccupancy: '2', roomSize: '', numberOfBeds: '1',
  type: 'General', bedType: 'Single',
  price: '', price2: '400', price3: '400', price4: '300', 
  facilities: { ac: false, wifi: false, tv: false, bathroom: false, balcony: false, miniFridge: false, roomService: false, breakfastIncluded: false, kitchen: false },
  status: 'Available',
};


const StatusBadge = ({ status }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_DOT[status] || 'bg-gray-400'}`}></span>
    {status}
  </span>
);

const HKBadge = ({ status }) => {
  const map = { Clean: 'bg-green-50 text-green-600', Dirty: 'bg-red-50 text-red-600', 'In Progress': 'bg-blue-50 text-blue-600', Inspected: 'bg-purple-50 text-purple-600' };
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status] || 'bg-gray-50 text-gray-500'}`}>{status}</span>;
};

import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

/* ─── Add Room Modal ───────────────────────── */
const AddRoomModal = ({ onClose, onSaved, initialData = null }) => {
  const [tab, setTab] = useState('basic');
  const [form, setForm] = useState(() => {
    if (!initialData) return INIT_FORM;
    const data = { ...initialData };
    if (!['VVIP', 'VIP', 'General'].includes(data.type)) data.type = 'General';
    if (!['Single', 'Double'].includes(data.bedType)) data.bedType = 'Double';
    if (!data.facilities) data.facilities = INIT_FORM.facilities;
    return data;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const tabs = ['basic', 'facilities', 'pricing', 'status'];


  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setFacility = (key) => setForm(prev => ({
    ...prev,
    facilities: { ...prev.facilities, [key]: !prev.facilities[key] }
  }));

  const handleSave = async () => {
    setError('');
    // Basic validation
    if (!form.roomNumber.trim()) { setTab('basic'); setError('Room Number is required.'); return; }
    if (!form.floor)             { setTab('basic'); setError('Floor Number is required.'); return; }
    if (!form.price)             { setTab('pricing'); setError('Price is required.'); return; }

    const payload = {
      roomNumber:     form.roomNumber.trim(),
      floor:          String(form.floor).trim(),
      maxOccupancy:   Number(form.maxOccupancy) || 2,
      roomSize:       form.roomSize.trim(),
      numberOfBeds:   Number(form.numberOfBeds) || 1,
      type:           form.type,
      bedType:        form.bedType,
      price:          Number(form.price),
      price2:         Number(form.price2) || 400,
      price3:         Number(form.price3) || 400,
      price4:         Number(form.price4) || 300,

      facilities:     form.facilities,
      status:         form.status,
    };

    setSaving(true);
    // Mock save
    setTimeout(() => {
      setSaving(false);
      if (initialData) {
        onSaved({ ...initialData, ...payload });
      } else {
        onSaved(payload);
      }
    }, 800);
  };

  const inputCls = 'w-full border border-gray-200 dark:border-[#272B30] rounded-xl px-4 py-2.5 text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-primary-300 bg-white dark:bg-[#272B30] placeholder-gray-400';
  const labelCls = 'text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100 dark:border-[#272B30]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-[#272B30]">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{initialData ? 'Edit Room' : 'Add New Room'}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{initialData ? 'Update this room details' : 'Fill in the details to register a new room'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#272B30] text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-[#272B30] px-6">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-colors -mb-px
                ${tab === t ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* ── Basic Tab ── */}
          {tab === 'basic' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. 101"
                  value={form.roomNumber}
                  onChange={e => set('roomNumber', e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Floor Number</label>
                <select 
                  value={form.floor} 
                  onChange={e => set('floor', e.target.value)} 
                  className={inputCls}
                >
                  <option value="" disabled>Select Floor</option>
                  <option value="Ground">Ground Floor</option>
                  {[1, 2, 3, 4, 5, 6].map(f => (
                    <option key={f} value={f}>Floor {f}</option>
                  ))}
                </select>
              </div>

              {[
                ['maxOccupancy','Max Occupancy','e.g. 2','number'],
                ['roomSize',   'Room Size',   'e.g. 350 sqft','text'],
                ['numberOfBeds','Number of Beds','e.g. 1','number'],
              ].map(([field, label, ph, type]) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <input
                    type={type}
                    placeholder={ph}
                    value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    className={inputCls}
                  />
                </div>
              ))}

              <div>
                <label className={labelCls}>Room Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                  {['VVIP','VIP','General'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Bed Type</label>
                <select value={form.bedType} onChange={e => set('bedType', e.target.value)} className={inputCls}>
                  {['Single','Double'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}



          {/* ── Facilities Tab ── */}
          {tab === 'facilities' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                ['ac',               'AC'],
                ['wifi',             'WiFi'],
                ['tv',               'TV'],
                ['bathroom',         'Bathroom'],
                ['balcony',          'Balcony'],
                ['miniFridge',       'Mini Fridge'],
                ['roomService',      'Room Service'],
                ['breakfastIncluded','Breakfast Included'],
                ['kitchen',          'Kitchen'],
              ].map(([key, label]) => (
                <label
                  key={key}
                  onClick={() => setFacility(key)}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors
                    ${form.facilities[key]
                      ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-300 dark:border-primary-500/40 text-primary-700 dark:text-primary-400'
                      : 'bg-gray-50 dark:bg-[#272B30] border-gray-200 dark:border-[#3a3a45] text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#343440]'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${form.facilities[key] ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                    {form.facilities[key] && <CheckCheck size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          )}

          {/* ── Pricing Tab ── */}
          {tab === 'pricing' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="col-span-2 bg-primary-50 dark:bg-primary-500/10 p-4 rounded-xl border border-primary-200 dark:border-primary-500/20 mb-2">
                <p className="text-xs font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2">
                  <AlertCircle size={14} /> Tiered pricing based on guest count for this room
                </p>
              </div>
              
              {[
                ['price',  '1 Person Price', 'e.g. 1500'],
                ['price2', '2 Person Price', 'e.g. 1900'],
                ['price3', '3 Person Price', 'e.g. 2300'],
                ['price4', '4 Person Price', 'e.g. 2600'],
              ].map(([field, label, ph]) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs font-black">₹</span>
                    <input
                      type="number"
                      placeholder={ph}
                      value={form[field]}
                      onChange={e => set(field, e.target.value)}
                      className={`${inputCls} pl-8`}
                      style={{ color: 'black', fontWeight: '900' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Status Tab ── */}
          {tab === 'status' && (
            <div className="grid grid-cols-2 gap-3">
              {['Available','Occupied','Reserved','Cleaning','Maintenance','Out of Service'].map(s => (
                <label
                  key={s}
                  onClick={() => set('status', s)}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors
                    ${form.status === s
                      ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-400 dark:border-primary-500/40 text-primary-700 dark:text-primary-400'
                      : 'bg-gray-50 dark:bg-[#272B30] border-gray-200 dark:border-[#3a3a45] text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#343440]'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${form.status === s ? 'border-primary-500' : 'border-gray-300'}`}>
                    {form.status === s && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                  </div>
                  <span className="text-sm font-medium">{s}</span>
                  <span className={`ml-auto w-2 h-2 rounded-full ${STATUS_DOT[s] || 'bg-gray-400'}`} />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-[#272B30] flex justify-between items-center gap-3">
          <div className="flex gap-1.5">
            {tabs.map((t, i) => (
              <div key={t} className={`h-1.5 rounded-full transition-all ${tab === t ? 'w-6 bg-primary-500' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 dark:border-[#272B30] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#272B30] transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 shadow-md shadow-primary-500/20 transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : <><Plus size={16} /> {initialData ? 'Update Room' : 'Save Room'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewRoomModal = ({ data, onClose }) => {
  if (!data) return null;
  const isOccupied = data.status === 'Occupied' || data.status === 'Booked';
  const gd = data.guests || {};

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1D1F] w-full max-w-xl rounded-[32px] shadow-2xl p-8 relative animate-in fade-in zoom-in duration-300 border border-gray-100 dark:border-[#272B30]">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-[#272B30] transition-colors">
          <X size={20} />
        </button>

        <div className="flex justify-between items-start mb-10 pt-4 pr-14">
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1 block opacity-70">Property Analytics / Room Detail</span>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Room {data.roomNumber}</h2>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 bg-gray-50/50 dark:bg-[#272B30]/30 p-6 rounded-[24px]">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><LayoutGrid size={12}/> Type</p>
            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{data.type}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><CheckCircle size={12}/> Floor</p>
            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{data.floor}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><BedDouble size={12}/> Bed Type</p>
            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{data.bedType}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><UserCheck size={12}/> Max Occupancy</p>
            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{data.maxOccupancy} Persons</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><LayoutGrid size={12}/> Room Size</p>
            <p className="text-sm font-black text-gray-800 dark:text-gray-200">{data.roomSize || 'N/A'}</p>
          </div>
        </div>

        {isOccupied && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] pl-1 border-l-2 border-primary-500">Guest Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">Primary Guest</p>
                <p className="text-sm font-black text-gray-800 dark:text-white capitalize">{gd.name || 'Anonymous'}</p>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{gd.mobile || 'No contact info'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">ID Verification</p>
                <p className="text-sm font-black text-gray-800 dark:text-white">{gd.idProof}: {gd.documentNo || 'N/A'}</p>
              </div>
              
              <div className="col-span-1 md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-[#272B30]">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Check-In</p>
                  <p className="text-xs font-black text-gray-700 dark:text-gray-300">{gd.checkInDate || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Check-Out</p>
                  <p className="text-xs font-black text-gray-700 dark:text-gray-300">{gd.checkOutDate || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Guests</p>
                  <p className="text-xs font-black text-gray-700 dark:text-gray-300">{gd.numPersons} Adult(s)</p>
                </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Total Stay Bill</p>
                  <p className="text-xs font-black text-primary-600">
                    ₹{(() => {
                        const isAC = data.facilities?.ac;
                        const rates = [
                          Number(data.price) || (isAC ? 1500 : 1000),
                          Number(data.price2) || (isAC ? 400 : 500),
                          Number(data.price3) || (isAC ? 400 : 400),
                          Number(data.price4) || (isAC ? 300 : 400)
                        ];
                        const persons = parseInt(gd.numPersons) || 1;
                        let total = 0;
                        for (let i = 0; i < persons; i++) total += rates[i] || 400;
                        return (total * (gd.numDays || 1)).toLocaleString();
                    })()}
                  </p>

              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:opacity-90 transition-opacity shadow-lg">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Room Card (Grid View) ────────────────── */
const RoomCard = ({ room, onAction }) => (
  <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl p-5 border border-gray-100 dark:border-[#272B30] shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col gap-3">
    <div className="flex justify-between items-start">
      <div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-widest">Room</span>
        <h4 className="font-bold text-gray-800 dark:text-white text-3xl leading-tight mb-1">{room.roomNumber}</h4>
        <p className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">{room.type} · Fl {room.floor}</p>
      </div>
      <StatusBadge status={room.status} />
    </div>

    <div className="flex items-center gap-3 text-gray-400 text-xs">
      {room.facilities?.ac   && <span className="flex items-center gap-1"><Wind size={13} /> AC</span>}
      {room.facilities?.wifi && <span className="flex items-center gap-1"><Wifi size={13} /> WiFi</span>}
      {room.facilities?.tv   && <span className="flex items-center gap-1"><Tv size={13} /> TV</span>}
      <span className="flex items-center gap-1"><Users size={13} /> {room.maxOccupancy} ADULTS</span>
    </div>

    <div />

    <div className="flex gap-2 mt-1">
      <button onClick={() => onAction('view', room)} className="flex-1 text-xs border border-gray-200 dark:border-[#272B30] rounded-lg px-2 py-2 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 transition-colors flex items-center justify-center gap-1">
        <Eye size={13} /> View
      </button>
      {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user'))?.role !== 'receptionist' && (
        <>
          <button onClick={() => onAction('edit', room)} className="flex-1 text-xs border border-gray-200 dark:border-[#272B30] rounded-lg px-2 py-2 text-gray-600 dark:text-gray-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:text-yellow-600 transition-colors flex items-center justify-center gap-1">
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={() => onAction('delete', room)} className="flex-1 text-xs bg-red-500 text-white rounded-lg px-2 py-2 hover:bg-red-600 transition-colors flex items-center justify-center gap-1 font-bold">
            <Trash2 size={13} /> Delete
          </button>
        </>
      )}
    </div>
  </div>
);

/* ─── Main Component ───────────────────────── */
const statuses = ['All', 'Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'];
const types    = ['All', 'VVIP', 'VIP', 'General'];
const floors   = ['All', 'Ground', '1', '2', '3', '4', '5', '6'];

export default function RoomManagement() {
  const [user] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [view,         setView]        = useState('table');
  const [search,       setSearch]      = useState('');
  const [filterStatus, setFilterStatus]= useState('All');
  const [filterType,   setFilterType]  = useState('All');
  const [filterFloor,  setFilterFloor] = useState('All');
  const [showModal,    setShowModal]   = useState(false);
  const [viewModal,    setViewModal]   = useState(null);
  const [editModal,    setEditModal]   = useState(null);
  const [rooms,        setRooms]       = useState([]);
  const [loading,      setLoading]     = useState(true);
  const { showToast, confirm } = useToast();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Room No', 'Type', 'Floor', 'Bed Type', 'Max Occupancy', 'Status'];
    const csvLines = [headers.join(',')];
    filtered.forEach(r => csvLines.push([r.roomNumber, r.type, r.floor, r.bedType, r.maxOccupancy, r.status].join(',')));
    const csvStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvLines.join('\n'));
    const link = document.createElement('a');
    link.href = csvStr;
    link.download = "rooms_export.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSaved = async (newRoom) => {
    try {
      if (editModal) {
        const updated = await api.updateRoom(editModal._id, newRoom);
        setRooms(prev => prev.map(r => r._id === updated._id ? updated : r));
        setEditModal(null);
        showToast(`Room ${updated.roomNumber} updated successfully!`);
      } else {
        const created = await api.createRoom(newRoom);
        setRooms(prev => [created, ...prev]);
        setShowModal(false);
        showToast(`Room ${created.roomNumber} added successfully!`);
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const countBy = (status) => rooms.filter(r => r.status === status).length;

  const stats = [
    { label: 'Total Rooms', value: rooms.length,             color: 'bg-gray-100 dark:bg-[#1e1e26] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2a2a35]' },
    { label: 'Available',   value: countBy('Available'),      color: 'bg-green-600 text-white shadow-lg' },
    { label: 'Occupied',    value: countBy('Occupied') + countBy('Booked'), color: 'bg-black text-white shadow-lg' },
    { label: 'Reserved',    value: countBy('Reserved'),       color: 'bg-amber-500 text-white shadow-lg' },
    { label: 'Cleaning',    value: countBy('Cleaning'),       color: 'bg-yellow-500 text-gray-900 shadow-lg' },
    { label: 'Maintenance', value: countBy('Maintenance'),    color: 'bg-blue-600 text-white shadow-lg' },
  ];

  const filtered = rooms.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = (r.roomNumber || '').toLowerCase().includes(q)
      || (r.name || '').toLowerCase().includes(q)
      || (r.guest || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchType   = filterType   === 'All' || r.type   === filterType;
    const matchFloor  = filterFloor  === 'All' || String(r.floor) === filterFloor;
    return matchSearch && matchStatus && matchType && matchFloor;
  }).sort((a, b) => {
    const numA = parseInt(String(a.roomNumber).replace(/\D/g, '')) || 0;
    const numB = parseInt(String(b.roomNumber).replace(/\D/g, '')) || 0;
    if (numA !== numB) return numA - numB;
    return String(a.roomNumber).localeCompare(String(b.roomNumber));
  });

  const handleAction = async (action, room) => {
    if (action === 'delete') {
      if (await confirm(`Are you sure you want to delete Room ${room.roomNumber}?`, 'Delete Room')) {
        try {
          await api.deleteRoom(room._id);
          setRooms(prev => prev.filter(r => r._id !== room._id));
          showToast('Room deleted successfully', 'success');
        } catch (error) {
          showToast(error.message, 'error');
        }
      }
    } else if (action === 'view' || action === 'edit') {
      try {
        setLoading(true);
        const fullRoom = await api.getRoomById(room._id);
        if (action === 'view') setViewModal(fullRoom);
        else setEditModal(fullRoom);
      } catch (err) {
        showToast("Error loading room details: " + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Modal */}
      {showModal && <AddRoomModal onClose={() => setShowModal(false)} onSaved={handleSaved} />}
      {editModal && <AddRoomModal initialData={editModal} onClose={() => setEditModal(null)} onSaved={handleSaved} />}
      {viewModal && <ViewRoomModal data={viewModal} onClose={() => setViewModal(null)} />}

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl p-4 border border-gray-100 dark:border-[#272B30] shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search room / guest..."
              className="pl-9 pr-4 py-2 border border-gray-300 dark:border-[#272B30] rounded-xl text-sm bg-white dark:bg-[#272B30] text-black font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 w-52"
            />
          </div>
          {[[filterStatus, setFilterStatus, statuses, 'Status'], [filterType, setFilterType, types, 'Type'], [filterFloor, setFilterFloor, floors, 'Floor']].map(([val, setter, options, label]) => (
            <div key={label} className="relative">
              <select
                value={val}
                onChange={e => setter(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 dark:border-[#272B30] rounded-xl text-sm bg-white dark:bg-[#1A1D1F] text-black font-bold focus:outline-none focus:ring-2 focus:ring-primary-300 appearance-none"
              >
                {options.map(o => <option key={o} value={o}>{o === 'All' ? `All ${label === 'Status' ? 'Statuses' : label + 's'}` : o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {user?.role !== 'receptionist' && (
            <button 
              onClick={() => setShowModal(true)} 
              className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
            >
              <Plus size={16} /> Add Room
            </button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setView('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'table' ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          <List size={16} /> Table View
        </button>
        <button
          onClick={() => setView('grid')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${view === 'grid' ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600'}`}
        >
          <LayoutGrid size={16} /> Grid View
        </button>
        <span className="ml-auto text-sm text-gray-500">
          {loading ? 'Loading…' : `${filtered.length} rooms found`}
        </span>
      </div>

      {/* Table View */}
      {view === 'table' && (
        <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl shadow-sm border border-gray-100 dark:border-[#272B30] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#272B30] border-b border-gray-200 dark:border-[#3a3a45]">
                  {['Room No', 'Type', 'Floor', 'Max Occupancy', 'Status', 'Housekeeping', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-500 dark:text-[#a1a1aa] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#272B30]">
                {filtered.map(room => (
                  <tr key={room._id} className="hover:bg-gray-50 dark:hover:bg-[#272B30] transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-800 dark:text-gray-200 text-sm">{room.roomNumber}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{room.type}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">{room.floor}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm font-black">{room.maxOccupancy} ADULTS</td>
                    <td className="px-5 py-4 whitespace-nowrap"><StatusBadge status={room.status} /></td>
                    <td className="px-5 py-4 whitespace-nowrap"><HKBadge status={room.housekeeping || 'Clean'} /></td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleAction('view', room)}        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10   text-blue-500   transition-colors" title="View">        <Eye         size={15} /></button>
                        {user?.role !== 'receptionist' && (
                          <>
                            <button onClick={() => handleAction('edit', room)}        className="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-500/10 text-yellow-600 transition-colors" title="Edit">        <Edit2       size={15} /></button>
                            <button onClick={() => handleAction('delete', room)}      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10    text-red-500    transition-colors" title="Delete">      <Trash2      size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-14 text-gray-400 text-sm font-medium">No rooms found matching your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(room => <RoomCard key={room._id} room={room} onAction={handleAction} />)}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400 text-sm">No rooms found matching your filters.</div>
          )}
        </div>
      )}
    </div>
  );
}
