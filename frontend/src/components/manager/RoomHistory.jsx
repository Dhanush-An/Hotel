
import React, { useState, useEffect } from 'react';
import { 
  History, Calendar, Filter, Search, 
  ArrowRight, User, BedDouble, 
  Download, ChevronDown, CheckCircle, 
  Clock, XCircle
} from 'lucide-react';

import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const RoomHistory = (props) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState(props.initialSearch || '');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [timeFilter, setTimeFilter] = useState('All');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Fetch summary (no guestsList) and limit to 100 recent for fast load
      const data = await api.getBookings('limit=100&summary=true');
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSearch = (e) => setSearch(e.target.value);

  const filteredHistory = history.filter(item => {
    const matchesSearch = (item.room?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (item.guest?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (item.id?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = (filterStatus === 'All' || item.status === filterStatus);
    const matchesDate = (!selectedDate || item.checkin === selectedDate);
    
    let matchesTime = true;
    if (timeFilter !== 'All') {
      const itemDate = new Date(item.checkin);
      const now = new Date();
      now.setHours(0,0,0,0);
      
      if (timeFilter === 'Day') {
        matchesTime = item.checkin === now.toISOString().split('T')[0];
      } else if (timeFilter === 'Week') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        matchesTime = itemDate >= lastWeek && itemDate <= now;
      } else if (timeFilter === 'Month') {
        matchesTime = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'Year') {
        matchesTime = itemDate.getFullYear() === now.getFullYear();
      }
    }
    return matchesSearch && matchesStatus && matchesDate && matchesTime;
  });

  const handleExport = async () => {
    try {
      setLoading(true);
      showToast("Preparing Excel report with images...", "info");
      
      // Fetch ALL data with full details for export
      let fullData = await api.getBookings('all=true');

      if (selectedDate) {
        fullData = fullData.filter(item => item.checkin === selectedDate);
      } else if (timeFilter !== 'All') {
        const now = new Date();
        now.setHours(0,0,0,0);
        const todayStr = now.toISOString().split('T')[0];
        
        fullData = fullData.filter(item => {
          const itemDate = new Date(item.checkin);
          if (timeFilter === 'Day') return item.checkin === todayStr;
          if (timeFilter === 'Week') {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            return itemDate >= lastWeek && itemDate <= now;
          }
          if (timeFilter === 'Month') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
          if (timeFilter === 'Year') return itemDate.getFullYear() === now.getFullYear();
          return true;
        });
      }

      if (fullData.length === 0) {
        showToast(`No bookings found for the selected range`, 'warning');
        setLoading(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Room History');

      // Define columns
      worksheet.columns = [
        { header: 'Booking ID', key: 'id', width: 15 },
        { header: 'Room', key: 'room', width: 10 },
        { header: 'Guest Name', key: 'guest_name', width: 25 },
        { header: 'Mobile', key: 'mobile', width: 15 },
        { header: 'ID Type', key: 'id_type', width: 15 },
        { header: 'ID Number', key: 'id_number', width: 20 },
        { header: 'Check-In', key: 'checkin', width: 15 },
        { header: 'Check-Out', key: 'checkout', width: 15 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Aadhar Front', key: 'aadhar_front', width: 30 },
        { header: 'Aadhar Back', key: 'aadhar_back', width: 30 },
        { header: 'Guest Photo', key: 'guest_photo', width: 30 }
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      let currentRow = 2;

      for (const item of fullData) {
        const guests = (item.guestsList && Array.isArray(item.guestsList) && item.guestsList.length > 0) 
          ? item.guestsList 
          : [{ 
              name: item.guest, 
              mobile: item.phone, 
              idProof: item.idType, 
              documentNo: item.idNum,
              frontImage: item.frontImage || null,
              addressImage: item.addressImage || null,
              guestPhoto: item.guestPhoto || null
            }];

        for (const [index, guest] of guests.entries()) {
          const row = worksheet.addRow({
            id: index === 0 ? item.id : '',
            room: index === 0 ? item.room : '',
            guest_name: guest.name || 'N/A',
            mobile: guest.mobile || 'N/A',
            id_type: guest.idProof || 'N/A',
            id_number: guest.documentNo || 'N/A',
            checkin: index === 0 ? item.checkin : '',
            checkout: index === 0 ? item.checkout : '',
            amount: index === 0 ? item.amount : '',
            status: index === 0 ? item.status : ''
          });

          // Set row height for images (about 100 pixels)
          row.height = 100;
          row.alignment = { vertical: 'middle', horizontal: 'left' };

          // Helper to process and add images
          const processAndAddImage = (imageData, colIndex) => {
            if (!imageData || typeof imageData !== 'string' || !imageData.includes('base64,')) return;
            
            try {
              const parts = imageData.split(';base64,');
              if (parts.length !== 2) return;
              
              const extension = parts[0].split('/')[1] === 'jpeg' ? 'jpeg' : 'png';
              const base64Data = parts[1];
              
              const imageId = workbook.addImage({
                base64: base64Data,
                extension: extension,
              });
              
              worksheet.addImage(imageId, {
                tl: { col: colIndex, row: currentRow - 1 },
                br: { col: colIndex + 1, row: currentRow },
                editAs: 'oneCell'
              });
            } catch (err) {
              console.error("Error adding image to Excel:", err);
            }
          };

          // Diagnostic log for photos
          if (index === 0) {
            console.log(`Exporting booking ${item.id}:`, {
              hasFront: !!guest.frontImage,
              hasAddress: !!guest.addressImage,
              hasPhoto: !!(guest.guestPhoto || guest.profilePhoto || guest.photo || item.guestPhoto)
            });
          }

          processAndAddImage(guest.frontImage, 10);
          processAndAddImage(guest.addressImage, 11);
          processAndAddImage(guest.guestPhoto || guest.profilePhoto || guest.photo || item.guestPhoto, 12);

          currentRow++;
        }
      }

      // Generate buffer and save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Hotel_History_${selectedDate || new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast("Excel exported successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Export failed: " + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (item) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(0, 122, 122);
      doc.text('HOTEL SHUBHA SAI', 105, 20, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Booking Confirmation & Invoice', 105, 26, { align: 'center' });
      doc.line(20, 32, 190, 32);

      // Details
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Booking ID: #${item.id || item._id}`, 20, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);

      autoTable(doc, {
        startY: 55,
        head: [['Guest Info', 'Room Details', 'Stay Period', 'Amount']],
        body: [[
          item.guest || 'N/A',
          `Room ${item.room || 'N/A'}\n${item.type || 'Standard'}`,
          `${item.checkin} to\n${item.checkout}`,
          `INR ${Number(item.amount).toLocaleString()}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [0, 122, 122] },
        styles: { fontSize: 9 }
      });

      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setTextColor(0, 122, 122);
      doc.text(`Total Amount: INR ${Number(item.amount).toLocaleString()}`, 140, finalY, { align: 'right' });

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Thank you for choosing Hotel Shubha Sai.', 105, 280, { align: 'center' });

      doc.save(`Invoice_${item.id || item._id}.pdf`);
    } catch (err) {
      console.error("PDF Export failed:", err);
      showToast("PDF generation failed. Check console for details.", "error");
    }
  };


  const getStatusStyle = (status) => {
    switch (status) {
      case 'Confirmed':
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Checked-in':
      case 'Occupied': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: history.length, icon: History, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'This Month', value: history.filter(h => new Date(h.checkin).getMonth() === new Date().getMonth()).length, icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Total Revenue', value: `₹${history.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0).toLocaleString()}`, icon: CheckCircle, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Avg Stay', value: `${(history.reduce((acc, curr) => acc + (Number(curr.nights) || 0), 0) / (history.length || 1)).toFixed(1)} Nights`, icon: BedDouble, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1A1D1F] p-5 rounded-3xl border border-gray-100 dark:border-[#272B30] shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} p-3 rounded-2xl`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black text-gray-800 dark:text-white leading-none mt-1">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white dark:bg-[#1A1D1F] p-4 rounded-3xl border border-gray-100 dark:border-[#272B30] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 gap-3 w-full">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search room number or guest..."
              className="w-full bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500/50 outline-none"
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="flex bg-gray-50 dark:bg-[#272B30] rounded-2xl p-1 gap-1">
             {['All', 'Day', 'Week', 'Month', 'Year'].map(t => (
               <button 
                 key={t}
                 onClick={() => setTimeFilter(t)}
                 className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === t ? 'bg-white dark:bg-[#1A1D1F] text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 {t}
               </button>
             ))}
          </div>

          <div className="relative">
             <input 
               type="date"
               className="bg-gray-50 dark:bg-[#272B30] border-none rounded-2xl py-3 px-4 text-xs font-black text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500/50 outline-none h-full"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
             />
             {selectedDate && (
               <button 
                 onClick={() => setSelectedDate('')}
                 className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all"
               >
                 <XCircle size={12} />
               </button>
             )}
          </div>

          <div className="relative group">
            <button className={`bg-gray-50 dark:bg-[#272B30] p-3 rounded-2xl transition-colors ${filterStatus !== 'All' ? 'text-primary-500 bg-primary-500/10' : 'text-gray-400 hover:text-gray-600'}`}>
              <Filter size={18} />
            </button>
            <div className="absolute top-full left-0 mt-2 bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-[#272B30] rounded-2xl shadow-xl p-2 hidden group-hover:block z-50 min-w-[150px]">
              {['All','Confirmed','Checked In','Checked Out','Cancelled'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} className={`w-full text-left px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${filterStatus === s ? 'bg-primary-500 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-[#272B30]'}`}>{s === 'All' ? 'All Statuses' : s}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 dark:bg-[#272B30] text-gray-600 dark:text-gray-300 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-all"
          >
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-[#1A1D1F] rounded-[2rem] border border-gray-100 dark:border-[#272B30] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-[#272B30]/50 border-b border-gray-100 dark:border-[#272B30]">
                {['Booking ID', 'Room Details', 'Guest Info', 'Check-In', 'Check-Out', 'Amount', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-[#272B30]">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Loading History...</td></tr>
              ) : filteredHistory.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-[#272B30]/50 transition-colors">
                   <td className="px-6 py-5">
                    <span className="text-xs font-black text-primary-500 tracking-wider">#{item.id}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                       <div className="bg-primary-500/10 p-2 rounded-xl text-primary-500">
                          <BedDouble size={16} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-tight">
                            {(() => {
                              const r = String(item.room || 'N/A');
                              if (r.toLowerCase().includes('undefined') || r.toLowerCase().includes('null') || r.trim() === '') return 'Room N/A';
                              return r.toUpperCase().startsWith('ROOM') ? r : `Room ${r}`;
                            })()}
                          </p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.type || 'Standard'}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#272B30] flex items-center justify-center text-gray-400">
                        <User size={14} />
                      </div>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-tight">{item.guest}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{item.checkin}</p>
                      <p className="text-[10px] font-bold text-primary-500 mt-0.5">{item.checkInTime || '12:00 PM'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight">{item.checkout}</p>
                      <p className="text-[10px] font-bold text-primary-500 mt-0.5">{item.checkOutTime || '11:00 AM'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-gray-800 dark:text-white tracking-widest">₹{item.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => handleDownloadInvoice(item)}
                      className="p-2 bg-gray-50 dark:bg-[#272B30] text-gray-400 hover:text-primary-500 rounded-xl transition-all"
                      title="Download Invoice"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredHistory.length === 0 && (
                <tr>
                   <td colSpan="8" className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-5 border-t border-gray-100 dark:border-[#272B30] flex items-center justify-between">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total {filteredHistory.length} bookings</p>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-50 dark:bg-[#272B30] text-gray-800 dark:text-white font-bold rounded-xl text-xs" onClick={fetchBookings}>Refresh</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RoomHistory;
