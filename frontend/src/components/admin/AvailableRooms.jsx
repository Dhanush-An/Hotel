import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, List, Info, Edit2, X, PlusCircle, UserPlus, Timer, LogOut, Wind, Thermometer, User, CreditCard, Calendar, Home, Phone, MapPin, Briefcase, Car, Coffee, Users, GlassWater, UtensilsCrossed, Receipt, ChevronRight, RefreshCw, ArrowRightLeft, Clock, Share2, Download, Mail, ArrowDownLeft, ArrowUpRight, QrCode, Banknote, Smartphone, DoorOpen, Camera, Upload, Image as ImageIcon, Map } from 'lucide-react';
import html2canvas from 'html2canvas';
import api from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '../../context/ToastContext';
import { performOCR } from '../../services/ocrService';

const INIT_BOOKING_FORM = {
  numPersons: 1,
  name: '',
  mobile: '',
  idProof: 'Aadhar',
  documentNo: '',
  dob: '',
  address: '',
  altMobile: '',
  numDays: 1,
  numHours: 1,
  checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  checkOutTime: new Date(new Date().setDate(new Date().getDate()+1)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  checkInDate: new Date().toISOString().split('T')[0],
  checkOutDate: new Date(new Date().setDate(new Date().getDate()+1)).toISOString().split('T')[0],
  hasKids: false,
  purpose: 'Personal',
  transport: 'Public',
  vehicleType: '',
  vehicleNumber: '',
  hasKitchen: false,
  referPerson: '',
  manualAmount: '',
  envType: 'AC',
  addons: {
    water: 0,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    coffee: 0,
    tea: 0
  },
  useGst: false,
  companyName: '',
  gstNumber: '',
  paymentMode: 'Cash',
  guestsList: [
    { name: '', idProof: 'Aadhar', documentNo: '', dob: '', address: '', mobile: '', frontImage: null, addressImage: null, guestPhoto: null },
    { name: '', idProof: 'Aadhar', documentNo: '', dob: '', address: '', mobile: '', frontImage: null, addressImage: null, guestPhoto: null },
    { name: '', idProof: 'Aadhar', documentNo: '', dob: '', address: '', mobile: '', frontImage: null, addressImage: null, guestPhoto: null },
    { name: '', idProof: 'Aadhar', documentNo: '', dob: '', address: '', mobile: '', frontImage: null, addressImage: null, guestPhoto: null }
  ]
};

const AvailableRooms = (props) => {
  const { showToast, confirm } = useToast();
  const [activeFloor, setActiveFloor] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [bookingStep, setBookingStep] = useState('options'); // 'options', 'new_booking', 'addons', 'payment', 'extend', 'shift', 'checkout_summary'
  const [acFilter, setAcFilter] = useState('All'); // 'All', 'AC', 'Non-AC'
  const [bookingType, setBookingType] = useState('New'); // 'New', 'Referral', 'Hour'
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [billNo] = useState(() => 'B' + (Math.floor(Math.random() * 9000) + 1000));

  
  const [bookingForm, setBookingForm] = useState(INIT_BOOKING_FORM);


  // Extending State
  const [extendDays, setExtendDays] = useState(1);
  const [extendGst, setExtendGst] = useState(false);

  // Shifting State
  const [shiftReason, setShiftReason] = useState('');
  const [targetRoomId, setTargetRoomId] = useState('');
  const [checkoutAlerts, setCheckoutAlerts] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraTarget, setCameraTarget] = useState({ index: 0, type: 'front' });
  const [showExtendGuests, setShowExtendGuests] = useState(false);

  const floors = ['All', 'Ground', 1, 2, 3, 4, 5, 6];
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(new Date());
  const [customers, setCustomers] = useState([]);
  const billRef = useRef(null);

  const handleShareAsImage = async (customText) => {
    if (!billRef.current) return;
    
    try {
      showToast('Generating official bill image...', 'info');
      
      // Higher quality capture
      const canvas = await html2canvas(billRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          const clonedBill = clonedDoc.querySelector('.print-area');
          if (clonedBill) {
            clonedBill.style.height = 'auto';
            clonedBill.style.maxHeight = 'none';
            clonedBill.style.width = '600px'; // Consistent width for sharing
            const clonedScroll = clonedBill.querySelector('.overflow-y-auto');
            if (clonedScroll) {
              clonedScroll.style.overflow = 'visible';
              clonedScroll.style.height = 'auto';
              clonedScroll.style.maxHeight = 'none';
            }
            // Hide action buttons in the image
            const noPrint = clonedBill.querySelectorAll('.no-print');
            noPrint.forEach(el => el.style.display = 'none');
          }
        }
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `bill_${selectedRoom.no}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Hotel Shubha Sai Bill',
            text: customText || `Official bill for Room ${selectedRoom.no} - Hotel Shubha Sai`
          });
        } else {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `bill_${selectedRoom.no}.png`;
          link.click();
          showToast('Generating image for manual share...', 'success');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Share error:', err);
      showToast('Could not generate image.', 'error');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(data.map(r => ({
        ...r,
        no: String(r.roomNumber || '').trim(),
        type: String(r.type || '').trim(),
        floor: String(r.floor || 'Ground').trim(),
        bed: String(r.bedType || '').trim(),
        price: Number(r.price) || 0,
        price2: Number(r.price2) || 600,
        price3: Number(r.price3) || 500,
        price4: Number(r.price4) || 400,
        status: String(r.status || 'Available').trim()
      })));

      const custData = await api.getCustomers();
      setCustomers(custData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // 15-minute Checkout Alert Check
    const interval = setInterval(() => {
      const now = new Date();
      const alerts = [];
      
      rooms.filter(r => r.status === 'Occupied' && r.guests?.checkOutDate && r.guests?.checkOutTime).forEach(room => {
        try {
          const [hours, minutes] = room.guests.checkOutTime.split(/[: ]/);
          const isPM = room.guests.checkOutTime.toLowerCase().includes('pm');
          let h = parseInt(hours);
          if (isPM && h < 12) h += 12;
          if (!isPM && h === 12) h = 0;
          
          const outTime = new Date(room.guests.checkOutDate);
          outTime.setHours(h, parseInt(minutes), 0);
          
          const diffInMinutes = (outTime.getTime() - now.getTime()) / (1000 * 60);
          
          if (diffInMinutes > 0 && diffInMinutes <= 15) {
            alerts.push({ roomNo: room.no, minutes: Math.ceil(diffInMinutes) });
          }
        } catch (e) {
          console.error(`Error checking checkout for room ${room.no}:`, e);
        }
      });
      setCheckoutAlerts(alerts);
    }, 60000);

    return () => clearInterval(interval);
  }, [rooms.length]); // Check when rooms list changes

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (props.initialRoom && rooms.length > 0) {
      const room = rooms.find(r => r._id === props.initialRoom._id);
      if (room) {
        setSelectedRoom(room);
        setShowPopup(true);
        setBookingStep('new_booking');
        setBookingType('New');
        
        // Pre-fill form if booking exists
        if (props.initialBooking) {
          const b = props.initialBooking;
          const times = updateTimes(b.nights || 1, 'days');
          
          setBookingForm(prev => ({
            ...prev,
            ...times,
            name: b.guest || '',
            mobile: (b.mobile || b.phone || '').toString().slice(-10),
            checkInDate: b.checkin || prev.checkInDate,
            checkOutDate: b.checkout || prev.checkOutDate,
            numDays: b.nights || 1,
            onlineBookingId: b._id || b.id,
            guestsList: prev.guestsList.map((g, i) => i === 0 ? { 
              ...g, 
              name: b.guest || '', 
              mobile: (b.mobile || b.phone || '').toString().slice(-10) 
            } : g)
          }));
        }
      }
    }
  }, [props.initialRoom, rooms.length]);

  // Update check-in/out logic based on stay type
  const updateTimes = (val, type) => {
    const now = new Date();
    
    if (type === 'days') {
        const d = parseInt(val) || 1;
        const checkIn = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const checkInD = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        
        const outDate = new Date(now);
        outDate.setDate(now.getDate() + d);
        const checkOut = outDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const checkOutD = outDate.getFullYear() + '-' + String(outDate.getMonth() + 1).padStart(2, '0') + '-' + String(outDate.getDate()).padStart(2, '0');
        
        return {
          checkInTime: checkIn,
          checkInDate: checkInD,
          checkOutTime: checkOut,
          checkOutDate: checkOutD
        };
    } else {
        // Hours for Hour Basis
        const h = parseInt(val) || 1;
        const checkIn = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const checkInD = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        
        const outDate = new Date(now);
        outDate.setHours(now.getHours() + h);
        const checkOut = outDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const checkOutD = outDate.getFullYear() + '-' + String(outDate.getMonth() + 1).padStart(2, '0') + '-' + String(outDate.getDate()).padStart(2, '0');
        
        return {
          checkInTime: checkIn,
          checkInDate: checkInD,
          checkOutTime: checkOut,
          checkOutDate: checkOutD
        };
    }
  };

  const handleBookingFormChange = (e) => {
    let { name, value, type, checked } = e.target;
    
    // 10-digit validation for mobile
    if (name === 'mobile' || name === 'altMobile') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    const val = type === 'checkbox' ? checked : value;
    
    setBookingForm(prev => {
      const actualVal = (name === 'numPersons' || name === 'numDays' || name === 'numHours') ? (parseInt(val) || 1) : val;
      const updated = { ...prev, [name]: actualVal };
      if (name === 'numDays') {
        const times = updateTimes(value, 'days');
        Object.assign(updated, times);
      } else if (name === 'numHours') {
        const times = updateTimes(value, 'hours');
        Object.assign(updated, times);
      }
      return updated;
    });
  };

  const handleFileUpload = async (index, type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf'; // Support both images and PDFs
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const toastId = showToast('Processing Document... Please wait', 'info');
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        
        try {
          // Perform actual OCR using Tesseract
          const extracted = await performOCR(dataUrl, type === 'address');
          
          setBookingForm(prev => {
            const newList = [...prev.guestsList];
            const curr = { ...newList[index] };
            
            if (type === 'front') {
              curr.frontImage = dataUrl;
              // Only auto-fill if data was found (to maintain high accuracy/no mismatch)
              if (extracted.name) curr.name = extracted.name;
              if (extracted.documentNo) curr.documentNo = extracted.documentNo;
              if (extracted.dob) curr.dob = extracted.dob;
              
              if (extracted.name || extracted.documentNo) {
                showToast('Data extracted successfully!', 'success');
              } else {
                showToast('Could not extract clear data. Please enter manually.', 'warning');
              }
            } else {
              curr.addressImage = dataUrl;
              if (extracted.address) {
                curr.address = extracted.address;
                showToast('Address extracted!', 'success');
              }
            }
            
            newList[index] = curr;
            const update = { guestsList: newList };
            // Sync with primary fields if first guest
            if (index === 0) {
               if (curr.name) update.name = curr.name;
               if (curr.documentNo) update.documentNo = curr.documentNo;
               if (curr.dob) update.dob = curr.dob;
               if (curr.address) update.address = curr.address;
            }
            
            return { ...prev, ...update };
          });
        } catch (ocrErr) {
          console.error("OCR Error:", ocrErr);
          showToast('OCR Failed. Please enter details manually.', 'error');
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleCameraScan = (index, type) => {
    setCameraTarget({ index, type });
    setShowCamera(true);
  };

  const captureAndProcess = async (videoRef) => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    setShowCamera(false);
    
    const { index, type } = cameraTarget;
    const toastId = showToast('Processing Captured Image...', 'info');

    try {
      const extracted = await performOCR(dataUrl, type === 'address');
      setBookingForm(prev => {
        const newList = [...prev.guestsList];
        const curr = { ...newList[index] };
        
        if (type === 'front') {
          curr.frontImage = dataUrl;
          if (extracted.name) curr.name = extracted.name;
          if (extracted.documentNo) curr.documentNo = extracted.documentNo;
          if (extracted.dob) curr.dob = extracted.dob;
          showToast('Scan Successful!', 'success');
        } else if (type === 'address') {
          curr.addressImage = dataUrl;
          if (extracted.address) curr.address = extracted.address;
          showToast('Address Scan Successful!', 'success');
        } else if (type === 'photo') {
          curr.guestPhoto = dataUrl;
          showToast('Photo Captured!', 'success');
        }
        
        newList[index] = curr;
        const update = { guestsList: newList };
        if (index === 0) {
           if (curr.name) update.name = curr.name;
           if (curr.documentNo) update.documentNo = curr.documentNo;
           if (curr.dob) update.dob = curr.dob;
           if (curr.address) update.address = curr.address;
        }
        return { ...prev, ...update };
      });
    } catch (err) {
      showToast('Scan Failed: ' + err.message, 'error');
    }
  };

  const handleGuestInfoChange = (index, e) => {
    let { name, value } = e.target;

    // 10-digit validation for mobile
    if (name === 'mobile') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setBookingForm(prev => {
      const newList = [...prev.guestsList];
      newList[index] = { ...newList[index], [name]: value };
      
      // Keep primary name synchronized with guest[0]
      const update = { guestsList: newList };
      if (index === 0 && name === 'name') update.name = value;
      if (index === 0 && name === 'mobile') update.mobile = value;
      if (index === 0 && name === 'idProof') update.idProof = value;
      if (index === 0 && name === 'documentNo') update.documentNo = value;
      
      // AUTO-FILL LOGIC: If 10-digit mobile is entered, search customers
      if (name === 'mobile' && value.length === 10) {
        const existing = customers.find(c => c.phone === value);
        if (existing) {
          newList[index] = {
            ...newList[index],
            name: existing.name || newList[index].name,
            idProof: existing.idType || newList[index].idProof,
            documentNo: existing.idNum || newList[index].documentNo,
            address: existing.address || newList[index].address
          };
          update.guestsList = newList;
          if (index === 0) {
            update.name = existing.name;
            update.idProof = existing.idType;
            update.documentNo = existing.idNum;
            update.address = existing.address;
          }
          showToast(`Welcome back, ${existing.name}! Details autofilled.`, 'success');
        }
      }

      return { ...prev, ...update };
    });
  };

  const updateAddon = (item, delta) => {
    setBookingForm(prev => ({
      ...prev,
      addons: {
        ...prev.addons,
        [item]: Math.max(0, prev.addons[item] + delta)
      }
    }));
  };

  const calculateBreakdown = (form = bookingForm) => {
    if (!selectedRoom) return { roomTotal: 0, addonsTotal: 0, subtotal: 0, gst: 0, finalTotal: 0, perPersonCosts: [] };
    
    const persons = parseInt(form.numPersons);
    const bType = form.bookingType || bookingType;
    
    let perPersonCosts = [];
    let roomTotal = 0;

    if (bType === 'Referral') {
        const days = parseInt(form.numDays) || 1;
        const manual = Number(form.manualAmount) || 0;
        roomTotal = manual * days;
        const perPerson = manual / persons;
        for(let i=0; i<persons; i++) perPersonCosts.push(perPerson);
    } else if (bType === 'Hour') {
        const hours = parseInt(form.numHours) || 1;
        const ratePerPersonPerHour = 599;
        const totalPerPerson = ratePerPersonPerHour * hours;
        for (let i = 0; i < persons; i++) {
            perPersonCosts.push(totalPerPerson);
            roomTotal += totalPerPerson;
        }
    } else {
        const days = parseInt(form.numDays) || 1;
        const isAC = form.envType === 'AC';
        
        // Exact Price Mapping (Finalized):
        if (isAC) {
            // AC Rates: 1p:1500, 2p:1900, 3p:2300, 4p:2600
            if (persons === 1) roomTotal = 1500;
            else if (persons === 2) roomTotal = 1900;
            else if (persons === 3) roomTotal = 2300;
            else roomTotal = 2600;
            
            perPersonCosts = [1500, 400, 400, 300].slice(0, persons);
        } else {
            // Non-AC Rates: 1p:1000, 2p:1500, 3p:1900, 4p:2300
            if (persons === 1) roomTotal = 1000;
            else if (persons === 2) roomTotal = 1500;
            else if (persons === 3) roomTotal = 1900;
            else roomTotal = 2300;
            
            perPersonCosts = [1000, 500, 400, 400].slice(0, persons);
        }

        roomTotal *= days;
    }



    if (form.hasKitchen) roomTotal += 300;


    const addonsTotal = ((form.addons?.water || 0) * 25) + 
                        ((form.addons?.breakfast || 0) * 100) + 
                        ((form.addons?.lunch || 0) * 150) + 
                        ((form.addons?.dinner || 0) * 150) + 
                        ((form.addons?.coffee || 0) * 25) + 
                        ((form.addons?.tea || 0) * 20);
    const subtotal = roomTotal + addonsTotal;
    const gst = form.useGst ? subtotal * 0.05 : 0;
    const finalTotal = subtotal + gst;

    return { roomTotal, addonsTotal, subtotal, gst, finalTotal, perPersonCosts };
  };

  const { roomTotal, addonsTotal, subtotal, gst, finalTotal, perPersonCosts } = calculateBreakdown();

  const generatePDF = () => {
    const doc = new jsPDF();
    const { roomTotal, addonsTotal, subtotal, gst, finalTotal, perPersonCosts } = calculateBreakdown(bookingForm);

    // Business Header
    doc.setFontSize(22);
    doc.setTextColor(22, 163, 74); // Green Primary
    doc.text('HOTEL SHUBHA SAI', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Luxury Stay & Comfort', 105, 26, { align: 'center' });
    doc.line(20, 32, 190, 32);

    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Invoiced To: ${bookingForm.name}`, 20, 45);
    doc.setFontSize(9);
    doc.text(`Contact: ${bookingForm.mobile}`, 20, 50);
    doc.text(`Address: ${bookingForm.address || 'N/A'}`, 20, 55);
    if (bookingForm.useGst) {
      doc.text(`Company: ${bookingForm.companyName || 'N/A'}`, 20, 60);
      doc.text(`GST No: ${bookingForm.gstNumber || 'N/A'}`, 20, 65);
    }

    doc.text(`Bill No: HG-${Date.now().toString().slice(-6)}`, 140, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 50);
    doc.text(`Room No: ${selectedRoom.no}`, 140, 55);

    // Table Data
    const tableData = perPersonCosts.map((cost, i) => [`Guest ${i+1} Stay`, `1`, `₹${cost}`, `₹${cost}`]);
    if (bookingForm.hasKitchen) tableData.push(['Kitchen Access', '1', '₹300', '₹300']);
    if (bookingForm.addons.water) tableData.push(['Water Bottles', bookingForm.addons.water, '₹25', `₹${bookingForm.addons.water * 25}`]);
    if (bookingForm.addons.breakfast) tableData.push(['Breakfast', bookingForm.addons.breakfast, '₹100', `₹${bookingForm.addons.breakfast * 100}`]);
    if (bookingForm.addons.coffee) tableData.push(['Coffee', bookingForm.addons.coffee, '₹25', `₹${bookingForm.addons.coffee * 25}`]);
    if (bookingForm.addons.tea) tableData.push(['Tea', bookingForm.addons.tea, '₹20', `₹${bookingForm.addons.tea * 20}`]);

    doc.autoTable({
      startY: bookingForm.useGst ? 75 : 65,
      head: [['Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [31, 41, 55] },
      margin: { top: 65 }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${subtotal.toFixed(0)}`, 140, finalY);
    if (bookingForm.useGst) doc.text(`GST (5%): ₹${gst.toFixed(0)}`, 140, finalY + 5);
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text(`Total Amount: ₹${finalTotal.toFixed(0)}`, 140, finalY + 15);

    doc.save(`HG_Bill_Room${selectedRoom.no}.pdf`);
  };

  const handleShare = (method) => {
    const text = `Hello ${bookingForm.name}, Your bill for Room ${selectedRoom.no} at Hotel Shubha Sai is ready. Total Payable: ₹${finalTotal.toFixed(0)}. Thank you for staying with us!`;
    if (method === 'whatsapp') {
      window.open(`https://wa.me/${bookingForm.mobile}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      window.open(`mailto:?subject=Hotel Shubha Sai Bill - Room ${selectedRoom.no}&body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const currentRooms = rooms.filter(r => {
    const floorMatch = activeFloor === 'All' || String(r.floor) === String(activeFloor);
    const acMatch = acFilter === 'All' || (acFilter === 'AC' ? r.facilities?.ac : !r.facilities?.ac);
    return floorMatch && acMatch;
  }).sort((a, b) => {
    const numA = parseInt(String(a.no).replace(/\D/g, '')) || 0;
    const numB = parseInt(String(b.no).replace(/\D/g, '')) || 0;
    if (numA !== numB) return numA - numB;
    return String(a.no).localeCompare(String(b.no));
  });

  const handleRoomClick = async (room) => {
    if (room.status === 'Maintenance') return;
    
    try {
      setLoading(true);
      // Fetch full room details (with guests) when clicked
      const fullRoom = await api.getRoomById(room._id);
      setSelectedRoom({ ...fullRoom, no: String(fullRoom.roomNumber || "").trim() });
      
      const no = String(fullRoom.roomNumber || fullRoom.no || '').trim();
      setBookingStep('options');
      setShowExtendGuests(false);
      setBookingForm(prev => ({...prev, envType: fullRoom.facilities?.ac ? 'AC' : 'Non-AC'}));
      
      if (fullRoom.status === 'Occupied' && fullRoom.guests) {
        setBookingForm({
          ...bookingForm, // Keep defaults for fields not in guests
          ...fullRoom.guests
        });
      } else {
        // Reset booking form if not occupied
        setBookingForm({
          ...INIT_BOOKING_FORM, // I might need to define this if it's not there, but for now I'll use the default state
          envType: fullRoom.facilities?.ac ? 'AC' : 'Non-AC'
        });
      }
      setShowPopup(true);
    } catch (err) {
      console.error("Error fetching room details:", err);
      alert("Could not load room details. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handleCheckOut = async (room) => {
    if (await confirm(`Are you sure you want to check out Room ${room.no}?`, 'Confirm Check-Out')) {
        confirmFinalCheckOut();
    }
  };

  const confirmFinalCheckOut = async () => {
    if(!selectedRoom) return;
    try {
      await api.updateRoom(selectedRoom._id, { ...selectedRoom, status: 'Cleaning', housekeeping: 'Dirty', guests: null });
      setShowPopup(false);
      fetchData();
      showToast('Checked out successfully!', 'success');
    } catch(err) {
      showToast('Failed: ' + err.message, 'error');
    }
  };

  const handleFinalBooking = async () => {
    if(!selectedRoom || submitting) return;
    setSubmitting(true);

    // MANDATORY FIELD VALIDATION
    const persons = parseInt(bookingForm.numPersons);
    for (let i = 0; i < persons; i++) {
      const g = bookingForm.guestsList[i];
      if (!g.name?.trim()) { showToast(`Guest ${i+1} Name is mandatory!`, 'error'); setSubmitting(false); return; }
      if (i === 0 && !g.mobile?.trim()) { showToast(`Primary Guest Mobile Number is mandatory!`, 'error'); setSubmitting(false); return; }
      if (!g.documentNo?.trim()) { showToast(`Guest ${i+1} ID Document Number is mandatory!`, 'error'); setSubmitting(false); return; }
      if (!g.address?.trim()) { showToast(`Guest ${i+1} Address is mandatory!`, 'error'); setSubmitting(false); return; }
    }

    try {
      // 1. Mark room as Occupied
      await api.updateRoom(selectedRoom._id, { 
        ...selectedRoom, 
        status: 'Occupied',
        guests: { ...bookingForm, roomType: selectedRoom.type }
      });

      // 2. Save a Booking record (shows in Booking History)
      let bookingRecord = null;
      try {
        bookingRecord = await api.createBooking({
          id: `BKG-${Math.floor(1000 + Math.random() * 9000)}`,
          room: selectedRoom.roomNumber || selectedRoom.no || 'N/A',
          guest: bookingForm.guestsList[0]?.name || bookingForm.name || 'Guest',
          phone: bookingForm.guestsList[0]?.mobile || bookingForm.mobile || '',
          checkin: bookingForm.checkInDate,
          checkout: bookingForm.checkOutDate,
          nights: bookingForm.numDays || (bookingForm.numHours ? bookingForm.numHours / 24 : 1),
          numPersons: bookingForm.numPersons,
          type: selectedRoom.type || 'General', // Correctly access from selectedRoom
          envType: bookingForm.envType,
          method: bookingForm.paymentMode, // Matches 'method' in schema
          amount: finalTotal,
          status: 'Confirmed',
          payment: 'Paid',
          referPerson: bookingForm.referPerson || '',
          address: bookingForm.address || '',
          idType: bookingForm.idProof || '',
          idNum: bookingForm.documentNo || '',
          purpose: bookingForm.purpose || '',
          transport: bookingForm.transport || '',
          vehicleReg: bookingForm.vehicleNumber || '',
          adults: bookingForm.numPersons || 1,
          children: 0,
          guestsList: bookingForm.guestsList,
          roomId: selectedRoom._id,
          checkInTime: bookingForm.checkInTime || '',
          checkOutTime: bookingForm.checkOutTime || '',
        });
      } catch(e) { console.warn('Booking record save failed:', e.message); }

      // 3. Save a Payment record (shows in Payment Tab)
      try {
        await api.createPayment({
          booking: bookingRecord?._id || bookingRecord?.id || selectedRoom._id,
          guest: bookingForm.guestsList[0]?.name || bookingForm.name || 'Guest',
          room: selectedRoom.no || 'N/A',
          amount: finalTotal,
          method: bookingForm.paymentMode,
          status: 'Completed',
          date: new Date().toISOString(),
          ref: `REF${Math.floor(10000000 + Math.random() * 90000000)}`,
          useGst: bookingForm.useGst,
        });
      } catch(e) { console.warn('Payment record save failed:', e.message); }

      // 4. Close popup — booking confirmed
      setShowPopup(false);
      fetchData();
      if(props.onBookingComplete) props.onBookingComplete();
      showToast('Booking Confirmed!', 'success');
    } catch(err) {
      showToast('Booking Failed: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtendConfirm = async () => {
    if(!selectedRoom) return;
    try {
      // Safe date parsing to prevent "Invalid time value" errors
      const baseDate = bookingForm.checkOutDate ? new Date(bookingForm.checkOutDate) : new Date();
      const currentOut = isNaN(baseDate.getTime()) ? new Date() : baseDate;
      
      currentOut.setDate(currentOut.getDate() + parseInt(extendDays));
      
      const updatedGuests = {
        ...bookingForm,
        numDays: parseInt(bookingForm.numDays || 0) + parseInt(extendDays),
        checkOutDate: currentOut.toISOString().split('T')[0]
      };
      
      await api.updateRoom(selectedRoom._id, {
        ...selectedRoom,
        guests: updatedGuests
      });
      
      showToast(`Room ${selectedRoom.no} extended by ${extendDays} days!`, 'success');
      setShowPopup(false);
      fetchData();
    } catch(err) {
      showToast('Extension Failed: ' + err.message, 'error');
    }
  };

  const handleShiftConfirm = async () => {
    if(!selectedRoom || !shiftReason || !targetRoomId) {
      showToast('Please provide a reason and select a target room.', 'warning');
      return;
    }
    try {
      const targetRoom = rooms.find(r => r._id === targetRoomId);
      if (!targetRoom) return;

      // 1. Mark current room as Maintenance
      await api.updateRoom(selectedRoom._id, {
        ...selectedRoom,
        status: 'Maintenance',
        issue: `Shifted to ${targetRoom.no}: ${shiftReason}`,
        guests: null
      });

      // 2. Move guest to target room
      await api.updateRoom(targetRoomId, {
        ...targetRoom,
        status: 'Occupied',
        guests: { ...selectedRoom.guests }
      });

      showToast(`Guest shifted from Room ${selectedRoom.no} to Room ${targetRoom.no}!`, 'success');
      setShowPopup(false);
      setTargetRoomId('');
      setShiftReason('');
      fetchData();
    } catch(err) {
      showToast('Shift Failed: ' + err.message, 'error');
    }
  };

  const markAsAvailable = async (room) => {
    if(!(await confirm(`Mark Room ${room.no} as Clean & Available?`, 'Housekeeping Check'))) return;
    try {
      await api.updateRoom(room._id, { ...room, status: 'Available', housekeeping: 'Clean' });
      showToast(`Room ${room.no} is now Available!`, 'success');
      fetchData();
    } catch(err) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-gray-400 shadow-sm";
  const labelClass = "text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1 block ml-1 opacity-90";

  const getRemainingTime = (room) => {
    if (!room.guests?.checkOutDate || !room.guests?.checkOutTime) return null;
    try {
      const [hours, minutes] = room.guests.checkOutTime.split(/[: ]/);
      const isPM = room.guests.checkOutTime.toLowerCase().includes('pm');
      let h = parseInt(hours);
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      
      const outTime = new Date(room.guests.checkOutDate);
      outTime.setHours(h, parseInt(minutes), 0);
      
      const diff = outTime.getTime() - now.getTime();
      if (diff <= 0) return "Overdue";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days >= 1) return `${days} Day${days > 1 ? 's' : ''} Remaining`;
      
      const hh = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mm = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const ss = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
    } catch (e) {
      return null;
    }
  };

  const isExpiringSoon = (room) => {
    if (!room.guests?.checkOutDate || !room.guests?.checkOutTime) return false;
    try {
      const [hours, minutes] = room.guests.checkOutTime.split(/[: ]/);
      const isPM = room.guests.checkOutTime.toLowerCase().includes('pm');
      let h = parseInt(hours);
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      
      const outTime = new Date(room.guests.checkOutDate);
      outTime.setHours(h, parseInt(minutes), 0);
      
      const diff = outTime.getTime() - now.getTime();
      return diff > 0 && diff <= (3 * 60 * 60 * 1000); // 3 hours in ms
    } catch (e) {
      return false;
    }
  };

  const isOverdue = (room) => {
    if (!room.guests?.checkOutDate || !room.guests?.checkOutTime) return false;
    try {
      const [hours, minutes] = room.guests.checkOutTime.split(/[: ]/);
      const isPM = room.guests.checkOutTime.toLowerCase().includes('pm');
      let h = parseInt(hours);
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      
      const outTime = new Date(room.guests.checkOutDate);
      outTime.setHours(h, parseInt(minutes), 0);
      
      return now.getTime() > outTime.getTime();
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
       {/* Floating Checkout Alert Notifications */}
      {checkoutAlerts.length > 0 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4 space-y-2 pointer-events-auto">
          {checkoutAlerts.map((alert, idx) => (
            <div key={idx} className="bg-white border-2 border-orange-500 rounded-3xl p-4 shadow-2xl flex items-center gap-4 animate-bounce">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Clock size={24} /></div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Urgent: Checkout Alert</p>
                <h4 className="text-sm font-black text-gray-900">Room {alert.roomNo} checks out in {alert.minutes} min</h4>
              </div>
              <button 
                onClick={() => setCheckoutAlerts(prev => prev.filter((_, i) => i !== idx))} 
                className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Floor Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: activeFloor === 'All' ? 'Total Portfolio' : 'Floor Total', value: currentRooms.length, color: 'text-gray-800', bg: 'bg-white border-gray-100' },
          { label: 'Available Now', value: currentRooms.filter(r => r.status === 'Available').length, color: 'text-white', bg: 'bg-[#4ADE80] border-[#22C55E] shadow-md' },
          { label: 'Occupied', value: currentRooms.filter(r => r.status === 'Occupied' || r.status === 'Booked').length, color: 'text-white', bg: 'bg-[#38BDF8] border-[#0EA5E9] shadow-md' },
          { label: 'Reserved', value: currentRooms.filter(r => r.status === 'Reserved').length, color: 'text-white', bg: 'bg-amber-500 border-amber-600 shadow-md' },
          { label: 'Dirty / Cleaning', value: currentRooms.filter(r => r.status === 'Cleaning').length, color: 'text-white', bg: 'bg-[#8B4513] border-[#703011] shadow-lg' },
          { label: 'Maintenance', value: currentRooms.filter(r => r.status === 'Maintenance').length, color: 'text-white', bg: 'bg-gray-500 border-gray-600 shadow-md' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} border rounded-[24px] p-5 shadow-sm flex flex-col items-center justify-center transition-transform hover:-translate-y-1`}>
             <p className={`text-4xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
             <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mt-2 text-center">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter Header */}
      <div className="bg-white rounded-[32px] p-2 space-y-1 mb-6 border border-gray-50 shadow-sm">
         <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Floors:</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-2">
               {floors.map(f => (
                 <button key={f} onClick={() => setActiveFloor(f)} className={`flex-shrink-0 px-6 py-3 rounded-[20px] text-[10px] font-black tracking-widest transition-all ${activeFloor === f ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>{f === 'All' ? 'ALL FLOORS' : f === 'Ground' ? 'GROUND' : `FLOOR ${f}`}</button>
               ))}
            </div>
         </div>
         <div className="flex items-center gap-3 border-t border-gray-50 pt-3 px-2">
            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em] mr-2">Environment:</span>
            {['All', 'AC', 'Non-AC'].map((type) => (
               <button key={type} onClick={() => setAcFilter(type)} className={`px-5 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all flex items-center gap-2 border ${acFilter === type ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}>{type === 'AC' && <Wind size={14} className={acFilter === type ? 'text-blue-300' : 'text-gray-300'} />}{type === 'Non-AC' && <Thermometer size={14} className={acFilter === type ? 'text-orange-300' : 'text-gray-300'} />}{type.toUpperCase()}</button>
            ))}
         </div>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {currentRooms.map((room, i) => (
          <div key={i} onClick={() => handleRoomClick(room)} className={`aspect-square rounded-[32px] border-2 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center justify-center p-5 relative overflow-hidden cursor-pointer 
            ${room.status === 'Available' ? 'bg-[#4ADE80] border-[#22C55E] text-black' : 
              room.status === 'Cleaning' ? 'bg-[#8B4513] border-[#703011] text-white' : 
              room.status === 'Maintenance' ? 'bg-gray-500 border-gray-600 text-white' : 
              room.status === 'Reserved' ? 'bg-amber-500 border-amber-600 text-white' :
              ((room.status === 'Occupied' || room.status === 'Booked') && isOverdue(room)) ? 'bg-red-500 border-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]' :
              ((room.status === 'Occupied' || room.status === 'Booked') && isExpiringSoon(room)) ? 'bg-[#991B1B] border-[#7F1D1D] text-white animate-pulse shadow-[0_0_20px_rgba(153,27,27,0.5)]' :
              'bg-[#38BDF8] border-[#0EA5E9] text-black'}`}>
            
            {room.status === 'Available' && (
              <div className="mb-2 px-4 py-1.5 bg-white/20 border border-white/30 rounded-full shadow-sm">
                <p className="text-[9px] font-black tracking-[0.2em] text-black uppercase">Available</p>
              </div>
            )}

            {room.status === 'Cleaning' && (
              <div className="mb-2 px-4 py-1.5 bg-white/10 border border-white/10 rounded-full shadow-sm">
                <p className="text-[9px] font-black tracking-[0.2em] text-white uppercase">Dirty</p>
              </div>
            )}

            {room.status === 'Maintenance' && (
              <div className="mb-2 px-4 py-1.5 bg-gray-100/20 border border-white/20 rounded-full shadow-sm">
                <p className="text-[9px] font-black tracking-[0.2em] text-white uppercase">Fixing</p>
              </div>
            )}

            {(room.status === 'Occupied' || room.status === 'Booked') && room.status !== 'Cleaning' && (
              <div className="mb-2 px-4 py-1.5 bg-[#FF9800] border border-[#F57C00] rounded-full shadow-inner">
                <p className="text-xs font-black tracking-widest text-white animate-pulse">
                  {getRemainingTime(room) || (room.guests?.checkOutTime ? `${room.guests.checkOutTime}` : 'Occupied')}
                </p>
              </div>
            )}

            <h3 className={`text-4xl font-black ${
              room.status === 'Available' || 
              ((room.status === 'Occupied' || room.status === 'Booked') && !isOverdue(room) && !isExpiringSoon(room)) 
              ? 'text-black' : 'text-white'
            }`}>{room.no}</h3>
            <span className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
              room.status === 'Available' || 
              ((room.status === 'Occupied' || room.status === 'Booked') && !isOverdue(room) && !isExpiringSoon(room)) 
              ? 'text-black/70' : 'text-white/80'
            }`}>{room.type}</span>
          </div>
        ))}
      </div>

      {/* GLOBAL PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; background: none !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { 
            position: fixed !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 100% !important; 
            height: 100% !important; 
            display: block !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            box-shadow: none !important; 
            border-radius: 0 !important;
            overflow: visible !important;
            z-index: 9999999 !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          /* Scaling to fit A4 */
          .print-area > div { 
            width: 100% !important; 
            transform: scale(0.95); 
            transform-origin: top center;
          }
        }
      `}</style>

      {/* POPUP MODAL */}
      {showPopup && selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center p-3 overflow-hidden">
          <div ref={billRef} className={`print-area bg-white rounded-[40px] w-full ${['options', 'cleaning','checkout_summary'].includes(bookingStep) ? 'max-w-sm' : 'max-w-2xl text-center'} overflow-hidden shadow-2xl animate-scale-in mx-auto flex flex-col`} style={{maxHeight: 'calc(100vh - 24px)'}}>
            
            {/* Header / Letterhead Container */}
            {['payment','addons','checkout_summary'].includes(bookingStep) ? (
              <div className="relative">
                <div className="h-4 bg-[#007A7A] w-full" />
                <div className="p-6 flex border-b border-gray-50 items-start justify-between bg-white relative">
                  <div className="flex gap-6 items-start">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-gray-50 flex-shrink-0 p-2">
                       <img src="/logo.png" alt="Hotel Shubha Sai" className="w-16 h-16 object-contain" />
                    </div>
                    <div className="pt-1 text-left">
                       <h1 className="text-2xl font-black text-[#007A7A] tracking-tighter mb-1 font-serif">Hotel Shubha Sai</h1>
                       <p className="text-[8px] font-bold text-gray-400 max-w-xs leading-tight uppercase tracking-widest">
                          Plot No. 145/14, 2nd Cross, Behind Priyanka Petrol Bunk,<br/>
                          Bommasandra Industrial Area, Hosur Main Road,<br/>
                          Bangalore - 560099
                       </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right pt-2">
                       <p className="text-[10px] font-black text-[#007A7A] uppercase tracking-widest mb-0.5">Bill No: {billNo}</p>
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Official Document</p>
                       <div className="text-[8px] font-bold text-gray-400 space-y-0.5">
                          <p>Date: {new Date().toLocaleDateString()}</p>
                          <p>Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-6 border-b ${bookingStep === 'invoice' ? 'bg-[#1A2E63] border-white/10' : 'border-gray-50 bg-white'} flex items-center justify-start sticky top-0 z-50`}>
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${bookingStep === 'invoice' ? 'text-white/40' : 'text-gray-400'}`}>
                      {bookingStep.replace('_', ' ')} Portal
                    </p>
                    <h2 className={`text-xl font-black ${bookingStep === 'invoice' ? 'text-white' : 'text-gray-900'}`}>
                      Room {selectedRoom.no}
                      <span className={`mx-2 ${bookingStep === 'invoice' ? 'text-white/20' : 'text-gray-300'}`}>/</span> 
                      {bookingStep === 'new_booking' ? (
                        <div className="inline-flex bg-gray-100 p-0.5 rounded-lg ml-2 align-middle">
                          <button type="button" onClick={() => setBookingForm(prev => ({...prev, envType: 'AC'}))} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-[0.1em] transition-all ${bookingForm.envType === 'AC' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>AC</button>
                          <button type="button" onClick={() => setBookingForm(prev => ({...prev, envType: 'Non-AC'}))} className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-[0.1em] transition-all ${bookingForm.envType === 'Non-AC' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>Non-AC</button>
                        </div>
                      ) : (
                        <span className={`${selectedRoom.status === 'Maintenance' ? 'text-gray-500' : selectedRoom.facilities?.ac ? 'text-blue-500' : 'text-gray-400'}`}>
                          {selectedRoom.status === 'Maintenance' ? 'MAINTENANCE' : selectedRoom.facilities?.ac ? 'AC' : 'NON-AC'}
                        </span>
                      )}
                    </h2>
                  </div>
                </div>
              </div>
            )}

            {/* Steps Container */}
            <div className={`overflow-y-auto custom-scrollbar flex-1 ${bookingStep === 'invoice' ? 'bg-gray-50/50' : 'px-6 py-4'}`}>
              
              {/* Step 1: Options */}
              {bookingStep === 'options' && (
                <div className="space-y-3">
                  {/* Historical View Option for Managers */}
                  {JSON.parse(localStorage.getItem('user'))?.role === 'manager' && (
                    <button onClick={() => props.onHistory?.(selectedRoom.no)} className="w-full flex items-center gap-4 p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all group font-black text-[10px] uppercase tracking-widest shadow-lg">
                      <Clock size={16} className="text-primary-400" /> View Room History
                    </button>
                  )}

                  {/* Hidden actions for Managers */}
                  {JSON.parse(localStorage.getItem('user'))?.role !== 'manager' && (
                    <>
                      {selectedRoom.status === 'Available' ? (
                        <div className="grid grid-cols-1 gap-2">
                          <button onClick={() => { 
                            setBookingStep('new_booking'); 
                            setBookingType('New');
                            const times = updateTimes(1, 'days');
                            setBookingForm(prev => ({ ...prev, ...times, numDays: 1, numHours: 1, bookingType: 'New' }));
                          }} className="flex items-center gap-4 p-4 bg-[#E3F9E5] text-green-700 rounded-2xl hover:bg-green-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                            <PlusCircle size={16} /> New Booking
                          </button>
                          <button onClick={() => { 
                            setBookingStep('new_booking'); 
                            setBookingType('Referral');
                            const times = updateTimes(1, 'days');
                            setBookingForm(prev => ({ ...prev, ...times, numDays: 1, numHours: 1, bookingType: 'Referral' }));
                          }} className="flex items-center gap-4 p-4 bg-[#FFF9E5] text-yellow-700 rounded-2xl hover:bg-yellow-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                            <UserPlus size={16} /> Referral
                          </button>
                          <button onClick={() => { 
                            setBookingStep('new_booking'); 
                            setBookingType('Hour');
                            const times = updateTimes(1, 'hours');
                            setBookingForm(prev => ({ ...prev, ...times, numHours: 1, numDays: 1, bookingType: 'Hour' }));
                          }} className="flex items-center gap-4 p-4 bg-[#E5F1FF] text-blue-700 rounded-2xl hover:bg-blue-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                            <Timer size={16} /> Hour Basis
                          </button>
                        </div>
                      ) : selectedRoom.status === 'Cleaning' ? (
                        <div className="space-y-3">
                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col items-center text-center gap-2">
                                <Wind size={24} className="text-blue-500 animate-pulse" />
                                <h4 className="text-xs font-black text-blue-900 uppercase">Room is Under Cleaning</h4>
                            </div>
                            <button onClick={() => markAsAvailable(selectedRoom)} className="w-full p-4 bg-[#E3F9E5] text-green-700 rounded-2xl hover:bg-green-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">Cleaning Completed</button>
                        </div>
                      ) : selectedRoom.status === 'Maintenance' ? (
                        <div className="space-y-3">
                            <div className="bg-gray-100 p-5 rounded-2xl border border-gray-200 text-left">
                                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Issue:</p>
                                <p className="text-[10px] font-bold text-gray-700 italic">"{selectedRoom.issue || 'No specific reason logged'}"</p>
                            </div>
                            <button onClick={() => markAsAvailable(selectedRoom)} className="w-full p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all font-black text-[10px] uppercase tracking-widest">Issue Resolved</button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          <button onClick={() => handleCheckOut(selectedRoom)} className="flex items-center gap-4 p-4 bg-[#FFE9E9] text-red-700 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                            <LogOut size={16} /> Check Out
                          </button>
                          <button onClick={() => setBookingStep('extend')} className="flex items-center gap-4 p-4 bg-[#FFF9E5] text-yellow-700 rounded-2xl hover:bg-yellow-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                            <RefreshCw size={16} /> Extend Stay
                          </button>
                          <button onClick={() => setBookingStep('shift')} className="flex items-center gap-4 p-4 bg-[#E5F1FF] text-blue-700 rounded-2xl hover:bg-blue-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                            <ArrowRightLeft size={16} /> Room Shift
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}


              {/* Step: Extend Stay */}
              {bookingStep === 'extend' && (
                <div className="space-y-6 animate-scale-in">
                   <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Guest Information</p>
                      <h4 className="text-lg font-black text-gray-900">{bookingForm.name}</h4>
                      <p className="text-xs font-bold text-gray-500">{bookingForm.idProof}: {bookingForm.documentNo}</p>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                         <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">Current Check-Out</span><span className="text-gray-900">{bookingForm.checkOutDate}</span></div>
                      </div>
                   </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                          <label className={labelClass}>Extend By (Days)</label>
                          <input type="number" min="1" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} className={inputClass} style={{ color: 'black', fontWeight: '900' }} />
                       </div>
                       <div className="flex items-end">
                          <button 
                            type="button"
                            onClick={() => {
                              if (bookingForm.numPersons < 4) {
                                handleBookingFormChange({ target: { name: 'numPersons', value: bookingForm.numPersons + 1 } });
                                setShowExtendGuests(true);
                                showToast(`Guest ${bookingForm.numPersons + 1} slot added!`, 'success');
                              } else {
                                showToast('Maximum 4 guests allowed per room.', 'warning');
                              }
                            }}
                            className="w-full h-[38px] flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"
                          >
                            <UserPlus size={16} /> Add Guest
                          </button>
                       </div>
                    </div>

                    {/* Guest Details Procedure - Only shown when Add Guest is clicked */}
                    {showExtendGuests && (
                      <div className="space-y-4 col-span-full border-t border-gray-100 pt-6 animate-in slide-in-from-top-4 duration-500">
                          <div className="flex items-center justify-between mb-2">
                             <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Update Guest Information</h4>
                             <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">{bookingForm.numPersons} Guests Total</span>
                          </div>

                          {Array.from({ length: parseInt(bookingForm.numPersons) || 1 }).map((_, idx) => (
                            <div key={idx} className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-3 relative overflow-hidden group hover:border-blue-100 transition-all text-left">
                               <div className="relative z-10 flex items-center gap-3 mb-2">
                                  <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-black">
                                     <User size={16} />
                                  </div>
                                  <div>
                                     <h4 className="text-sm font-black text-gray-900">Guest {idx + 1} Details</h4>
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                     <label className={labelClass}>Full Name</label>
                                     <input type="text" name="name" value={bookingForm.guestsList[idx].name} onChange={(e) => handleGuestInfoChange(idx, e)} placeholder="Name" className={inputClass} />
                                  </div>
                                  <div>
                                     <label className={labelClass}>Mobile</label>
                                     <input type="tel" name="mobile" value={bookingForm.guestsList[idx].mobile} onChange={(e) => handleGuestInfoChange(idx, e)} placeholder="Mobile" maxLength={10} className={inputClass} />
                                  </div>
                                  <div>
                                     <label className={labelClass}>Document Number</label>
                                     <input type="text" name="documentNo" value={bookingForm.guestsList[idx].documentNo} onChange={(e) => handleGuestInfoChange(idx, e)} placeholder="Doc No" className={inputClass} />
                                  </div>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                     <label className={labelClass}>ID Type</label>
                                     <select name="idProof" value={bookingForm.guestsList[idx].idProof} onChange={(e) => handleGuestInfoChange(idx, e)} className={inputClass}>
                                        {['Aadhar', 'PAN', 'Passport', 'Driving License'].map(id => <option key={id} value={id}>{id}</option>)}
                                     </select>
                                  </div>
                                  <div className="md:col-span-2">
                                     <label className={labelClass}>Address</label>
                                     <input type="text" name="address" value={bookingForm.guestsList[idx].address} onChange={(e) => handleGuestInfoChange(idx, e)} placeholder="Address" className={inputClass} />
                                  </div>
                               </div>

                               {/* OCR / Image Upload / Camera support for each guest */}
                               <div className="grid grid-cols-3 gap-2 mt-2">
                                  <button type="button" onClick={() => handleCameraScan(idx, 'front')} className="h-9 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg text-[8px] font-black uppercase text-gray-600 hover:bg-blue-50 transition-all overflow-hidden relative">
                                     {bookingForm.guestsList[idx].frontImage ? <img src={bookingForm.guestsList[idx].frontImage} className="w-full h-full object-cover" alt="ID" /> : "FRONT ID"}
                                  </button>
                                  <button type="button" onClick={() => handleCameraScan(idx, 'address')} className="h-9 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg text-[8px] font-black uppercase text-gray-600 hover:bg-blue-50 transition-all overflow-hidden relative">
                                     {bookingForm.guestsList[idx].addressImage ? <img src={bookingForm.guestsList[idx].addressImage} className="w-full h-full object-cover" alt="ID" /> : "BACK ID"}
                                  </button>
                                  <button type="button" onClick={() => handleCameraScan(idx, 'photo')} className="h-9 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg text-[8px] font-black uppercase text-gray-600 hover:bg-blue-50 transition-all overflow-hidden relative">
                                     {bookingForm.guestsList[idx].guestPhoto ? <img src={bookingForm.guestsList[idx].guestPhoto} className="w-full h-full object-cover" alt="Face" /> : "FACE"}
                                  </button>
                               </div>
                            </div>
                          ))}
                      </div>
                    )}

                   <div className="bg-gray-900 rounded-[32px] p-8 text-white">
                      <div className="flex justify-between items-center mb-6">
                         <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Extension Bill</p>
                         <button onClick={() => setExtendGst(!extendGst)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${extendGst ? 'bg-primary-500 text-white' : 'bg-white/10 text-gray-400'}`}>GST (+5%)</button>
                      </div>
                      
                      <div className="space-y-3">
                         <div className="flex justify-between text-xs font-bold text-gray-400"><span>Daily Rate (Base)</span><span>₹{(roomTotal/bookingForm.numDays).toFixed(0)}</span></div>
                         <div className="flex justify-between text-xs font-bold text-gray-400"><span>Duration</span><span>{extendDays} Day(s)</span></div>
                         <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest">Extension Total</span>
                            <h3 className="text-3xl font-black tracking-tighter">₹{((roomTotal/bookingForm.numDays) * extendDays * (extendGst ? 1.05 : 1)).toLocaleString(undefined, {maximumFractionDigits: 0})}</h3>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => {
                        const { roomTotal } = calculateBreakdown(bookingForm);
                        const dailyRate = roomTotal / bookingForm.numDays;
                        const extTotal = dailyRate * extendDays * (extendGst ? 1.05 : 1);
                        
                        const doc = new jsPDF();
                        doc.setFontSize(22);
                        doc.setTextColor(22, 163, 74);
                        doc.text('HOTEL SHUBHA SAI - EXTENSION', 105, 20, { align: 'center' });
                        doc.setFontSize(10);
                        doc.setTextColor(100);
                        doc.text('Luxury Stay & Comfort', 105, 26, { align: 'center' });
                        doc.line(20, 32, 190, 32);

                        doc.setFontSize(12);
                        doc.setTextColor(0);
                        doc.text(`Invoiced To: ${bookingForm.name}`, 20, 45);
                        doc.text(`Stay Extension for Room: ${selectedRoom.no}`, 140, 45);
                        doc.setFontSize(9);
                        doc.text(`Contact: ${bookingForm.mobile}`, 20, 50);
                        doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 50);

                        doc.autoTable({
                          startY: 65,
                          head: [['Description', 'Duration', 'Rate', 'Amount']],
                          body: [[`Stay Extension`, `${extendDays} Day(s)`, `₹${dailyRate.toFixed(0)}`, `₹${(dailyRate * extendDays).toFixed(0)}`]],
                          theme: 'grid',
                          headStyles: { fillColor: [31, 41, 55] }
                        });

                        const finalY = doc.lastAutoTable.finalY + 10;
                        if (extendGst) doc.text(`GST (5%): ₹${(dailyRate * extendDays * 0.05).toFixed(0)}`, 140, finalY);
                        doc.setFontSize(14);
                        doc.setTextColor(22, 163, 74);
                        doc.text(`Total Amount: ₹${extTotal.toFixed(0)}`, 140, finalY + 10);

                        doc.save(`HG_Extension_Room${selectedRoom.no}.pdf`);
                      }} className="flex flex-col items-center gap-2 p-5 bg-white border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all shadow-sm no-print">
                          <Download size={20} className="text-primary-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Download Bill</span>
                      </button>
                      <div className="relative no-print">
                          <button onClick={() => setShowShareOptions(!showShareOptions)} className="w-full flex flex-col items-center gap-2 p-5 bg-white border border-gray-100 rounded-3xl hover:bg-gray-50 transition-all shadow-sm">
                              <Share2 size={20} className="text-blue-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Share Bill</span>
                          </button>
                          {showShareOptions && (
                              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 animate-scale-in flex flex-col gap-1 z-[110]">
                                  <button onClick={() => {
                                      const text = `Hello ${bookingForm.name}, Your extension bill for Room ${selectedRoom.no} at Hotel Shubha Sai is ready. Total: ₹${((roomTotal/bookingForm.numDays) * extendDays * (extendGst ? 1.05 : 1)).toFixed(0)}. Thank you!`;
                                      handleShareAsImage(text);
                                  }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 text-primary-600 transition-all">
                                      <Share2 size={16} />
                                      <span className="text-[10px] font-black uppercase">Official Share (Image)</span>
                                  </button>
                                  <div className="h-px bg-gray-50 my-1"></div>
                                  <button onClick={() => {
                                      const text = `Hello ${bookingForm.name}, Your extension bill for Room ${selectedRoom.no} at Hotel Shubha Sai is ready. Duration: ${extendDays} Days, Total: ₹${((roomTotal/bookingForm.numDays) * extendDays * (extendGst ? 1.05 : 1)).toFixed(0)}. Thank you!`;
                                      window.open(`https://wa.me/${bookingForm.mobile}?text=${encodeURIComponent(text)}`, '_blank');
                                  }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 text-green-600 transition-all">
                                      <Smartphone size={16} />
                                      <span className="text-[10px] font-black uppercase">WhatsApp</span>
                                  </button>
                                  <button onClick={() => {
                                      const text = `Hello ${bookingForm.name}, Your extension bill for Room ${selectedRoom.no} at Hotel Shubha Sai is ready. Duration: ${extendDays} Days, Total: ₹${((roomTotal/bookingForm.numDays) * extendDays * (extendGst ? 1.05 : 1)).toFixed(0)}.`;
                                      window.open(`mailto:?subject=Hotel Shubha Sai Extension Bill&body=${encodeURIComponent(text)}`, '_blank');
                                  }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-blue-600 transition-all">
                                      <Mail size={16} />
                                      <span className="text-[10px] font-black uppercase">Email</span>
                                  </button>
                              </div>
                          )}
                      </div>
                   </div>

                   <button onClick={handleExtendConfirm} className="w-full py-5 bg-green-500 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100 hover:bg-green-600 transition-all active:scale-[0.98]">Finalize & Update Stay</button>
                </div>
              )}

               {/* Step: Shift Room */}
               {bookingStep === 'shift' && (
                <div className="space-y-6 animate-scale-in">
                   <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Shift Portal</p>
                      <p className="text-xs font-bold text-blue-900 leading-relaxed">Select a destination room of the same category for this guest.</p>
                   </div>

                   <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Select Destination Room ({selectedRoom.facilities?.ac ? 'AC' : 'Non-AC'})</label>
                        <select 
                          value={targetRoomId} 
                          onChange={(e) => setTargetRoomId(e.target.value)} 
                          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm cursor-pointer"
                        >
                          <option value="">Choose Available Room...</option>
                          {rooms
                            .filter(r => r.status === 'Available' && r.facilities?.ac === selectedRoom.facilities?.ac)
                            .map(r => (
                              <option key={r._id} value={r._id} className="text-black font-black">Room {r.no} ({r.floor} Floor)</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className={labelClass}>Reason for Shifting</label>
                        <textarea 
                          rows="3" 
                          value={shiftReason} 
                          onChange={(e) => setShiftReason(e.target.value)} 
                          placeholder="e.g. Broken AC, guest request..." 
                          className={`${inputClass} resize-none text-black font-black`}
                        ></textarea>
                      </div>
                   </div>

                   <button 
                    onClick={handleShiftConfirm} 
                    disabled={!targetRoomId || !shiftReason}
                    className="w-full py-5 bg-primary-500 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-100 hover:bg-primary-600 transition-all disabled:opacity-50 disabled:grayscale"
                   >
                     Confirm Room Shift
                   </button>
                </div>
              )}

              {/* Step: New / Referral / Day Booking Details */}
              {bookingStep === 'new_booking' && (
                <div className="animate-scale-in space-y-3 pb-4">
                      <div className="space-y-3">
                        {/* 1. No. of Days — full width for New/Day, half for Referral */}
                        {bookingType === 'Referral' ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}><Clock size={14} className="inline mr-2 text-primary-500" /> No. of Days</label>
                              <input type="number" name="numDays" value={bookingForm.numDays} onChange={handleBookingFormChange} min="1" className={inputClass} style={{ color: 'black', fontWeight: '900' }} />
                            </div>
                            <div>
                              <label className={labelClass}><User size={14} className="inline mr-2 text-primary-500" /> Refer Person Name</label>
                              <input type="text" name="referPerson" value={bookingForm.referPerson} onChange={handleBookingFormChange} placeholder="Who referred?" className={inputClass} />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className={labelClass}><Clock size={14} className="inline mr-2 text-primary-500" /> {bookingType === 'Hour' ? 'No. of Hours' : 'No. of Days'}</label>
                            <input type="number" name={bookingType === 'Hour' ? 'numHours' : 'numDays'} value={bookingType === 'Hour' ? bookingForm.numHours : bookingForm.numDays} onChange={handleBookingFormChange} min="1" className={inputClass} style={{ color: 'black', fontWeight: '900' }} />
                          </div>
                        )}

                        {/* Environment & Amount — only for Referral */}
                        {bookingType === 'Referral' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className={labelClass}>Select Environment</label>
                              <select name="envType" value={bookingForm.envType} onChange={handleBookingFormChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm cursor-pointer" style={{ color: 'black', fontWeight: '900' }}>
                                <option value="AC">AC</option>
                                <option value="Non-AC">Non-AC</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Amount (Per Room ₹)</label>
                              <input type="number" name="manualAmount" value={bookingForm.manualAmount} onChange={handleBookingFormChange} placeholder="e.g. 1500" className={inputClass} style={{ color: 'black', fontWeight: '900' }} />
                              <p className="text-center text-[10px] font-black text-[#57BF8E] uppercase mt-1 tracking-widest">Total Stay: ₹{(Number(bookingForm.manualAmount) * Number(bookingForm.numDays)).toLocaleString()}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* 4. Number of Persons */}
                        <div>
                          <label className={labelClass}><Users size={14} className="inline mr-2 text-primary-500" /> Number of Persons (Max 4)</label>
                          <select 
                            name="numPersons" 
                            value={bookingForm.numPersons} 
                            onChange={handleBookingFormChange} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm cursor-pointer"
                            style={{ color: 'black', fontWeight: '900' }}
                          >
                            {[1, 2, 3, 4].map(n => <option key={n} value={n} className="text-black font-black">{n} Guests</option>)}
                          </select>
                        </div>
                        
                        {/* 5. Plan Details Box */}
                        <div className="p-3 bg-[#F3F9F6] rounded-2xl border border-[#E3F2E9]">
                           <p className="text-[10px] font-black text-[#57BF8E] uppercase tracking-widest mb-2 flex items-center gap-2"><Info size={14} /> Plan Details</p>
                           <div className="space-y-3">
                             <div className="flex justify-between items-center"><span className="text-[11px] font-bold text-gray-500">Stay Type</span><span className="text-[11px] font-black text-[#57BF8E] uppercase tracking-wider">{bookingType === 'Referral' ? 'REFERRAL STAY' : bookingType === 'Hour' ? 'HOURLY STAY' : 'STANDARD STAY'}</span></div>
                             <div className="flex justify-between items-center"><span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Rate Calculation</span><span className="text-[10px] font-black text-gray-800 uppercase tracking-tight">{bookingType === 'Hour' ? '₹599/Hr/Person' : bookingType === 'Referral' ? 'MANUAL QUOTATION' : 'AUTOMATIC PERSON-WISE'}</span></div>
                           </div>
                        </div>

                        {/* 6. Purpose & Transport — Global Details (Once per booking) */}
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className={labelClass}><Briefcase size={14} className="inline mr-2 text-primary-500" /> Purpose of Visiting</label>
                              <select name="purpose" value={bookingForm.purpose} onChange={handleBookingFormChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm cursor-pointer" style={{ color: 'black', fontWeight: '900' }}>
                                 {['Personal', 'Business', 'Tourism', 'Event', 'Emergency', 'Other'].map(p => <option key={p} value={p} className="text-black font-black">{p}</option>)}
                              </select>
                           </div>
                            <div>
                               <label className={labelClass}><Car size={14} className="inline mr-2 text-primary-500" /> Transport Type</label>
                               <select name="transport" value={bookingForm.transport} onChange={handleBookingFormChange} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm cursor-pointer" style={{ color: 'black', fontWeight: '900' }}>
                                  {['Public', 'Private', 'Hotel Taxi', 'Walk-in'].map(t => <option key={t} value={t} className="text-black font-black">{t}</option>)}
                               </select>
                            </div>
                            {bookingForm.transport === 'Private' && (
                              <div className="col-span-full mt-2 animate-in slide-in-from-top-1 duration-300">
                                <label className={labelClass}>Vehicle Registration Number</label>
                                <input type="text" name="vehicleNumber" value={bookingForm.vehicleNumber} onChange={handleBookingFormChange} placeholder="e.g. KA-01-AB-1234" className={inputClass} style={{ color: 'black', fontWeight: '900' }} />
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="space-y-3 col-span-full">
                        {Array.from({ length: parseInt(bookingForm.numPersons) || 1 }).map((_, idx) => (
                          <div key={idx} className="bg-white/50 rounded-2xl border border-gray-100 p-3 space-y-2 relative overflow-hidden group hover:border-primary-100 transition-all text-left">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary-100/50 transition-all"></div>
                             <div className="relative z-10 flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-primary-200">
                                   <User size={18} />
                                </div>
                                <div >
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Guest Detail</p>
                                   <h4 className="text-lg font-black text-gray-900">Information for Person {idx + 1}</h4>
                                </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
                               <div>
                                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block"><User size={14} className="inline mr-2 text-primary-500" /> Guest Full Name <span className="text-red-500">*</span></label>
                                  <input type="text" name="name" value={bookingForm.guestsList[idx].name} onChange={(e) => handleGuestInfoChange(idx, e)} placeholder="Enter name" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm" style={{ color: 'black', fontWeight: '900' }} />
                               </div>
                               <div>
                                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block"><Phone size={14} className="inline mr-2 text-primary-500" /> Mobile Number <span className="text-red-500">*</span></label>
                                  <input type="tel" name="mobile" value={bookingForm.guestsList[idx].mobile} onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '');
                                      if (val.length <= 10) handleGuestInfoChange(idx, { target: { name: 'mobile', value: val } });
                                  }} placeholder="10-digit number" maxLength={10} inputMode="numeric" pattern="[0-9]*" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm" style={{ color: 'black', fontWeight: '900' }} />
                               </div>
                               <div>
                                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block"><Calendar size={14} className="inline mr-2 text-primary-500" /> Date of Birth</label>
                                  <input 
                                    type="date" 
                                    name="dob" 
                                    value={bookingForm.guestsList[idx].dob || '2026-04-02'} 
                                    onChange={(e) => handleGuestInfoChange(idx, e)} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black [&::-webkit-calendar-picker-indicator]:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm" 
                                    style={{ color: 'black', fontWeight: '900' }}
                                  />
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                               <div>
                                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block">ID Proof Type</label>
                                  <select 
                                    name="idProof" 
                                    value={bookingForm.guestsList[idx].idProof} 
                                    onChange={(e) => handleGuestInfoChange(idx, e)} 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm cursor-pointer"
                                    style={{ color: 'black', fontWeight: '900' }}
                                  >
                                     {['Aadhar', 'PAN', 'Passport', 'Driving License'].map(id => <option key={id} value={id} className="text-black font-black">{id}</option>)}
                                  </select>
                               </div>
                               <div>
                                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block">ID Document Number <span className="text-red-500">*</span></label>
                                  <input type="text" name="documentNo" value={bookingForm.guestsList[idx].documentNo} onChange={(e) => handleGuestInfoChange(idx, e)} placeholder="Enter doc no" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm" style={{ color: 'black', fontWeight: '900' }} />
                               </div>
                               <div>
                                  <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2 block"><MapPin size={14} className="inline mr-2 text-primary-500" /> Address <span className="text-red-500">*</span></label>
                                  <input type="text" name="address" value={bookingForm.guestsList[idx].address} onChange={(e) => handleGuestInfoChange(idx, e)} placeholder="Full address" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-black text-black focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm" style={{ color: 'black', fontWeight: '900' }} />
                               </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 relative z-10 border-t border-gray-50 pt-4">
                               <div>
                                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Front ID Document</label>
                                  <div className="flex gap-2">
                                     <button type="button" onClick={() => handleCameraScan(idx, 'front')} className="flex-1 h-11 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 overflow-hidden relative group">
                                        {bookingForm.guestsList[idx].frontImage ? (
                                           <div className="absolute inset-0 w-full h-full">
                                              <img src={bookingForm.guestsList[idx].frontImage} alt="front" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                              <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <Camera size={14} className="text-white" />
                                              </div>
                                           </div>
                                        ) : (
                                           <><Camera size={12} /> FRONT PHOTO</>
                                        )}
                                     </button>
                                     <button type="button" title="Upload File" onClick={() => handleFileUpload(idx, 'front')} className="w-11 h-11 flex items-center justify-center bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all border border-blue-200">
                                        <Upload size={14} />
                                     </button>
                                  </div>
                               </div>

                               <div>
                                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Back ID Document</label>
                                  <div className="flex gap-2">
                                     <button type="button" onClick={() => handleCameraScan(idx, 'address')} className="flex-1 h-11 flex items-center justify-center gap-2 bg-orange-50 text-orange-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all border border-orange-100 overflow-hidden relative group">
                                        {bookingForm.guestsList[idx].addressImage ? (
                                           <div className="absolute inset-0 w-full h-full">
                                              <img src={bookingForm.guestsList[idx].addressImage} alt="address" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                              <div className="absolute inset-0 bg-orange-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                 <Camera size={14} className="text-white" />
                                              </div>
                                           </div>
                                        ) : (
                                           <><Camera size={12} /> BACK PHOTO</>
                                        )}
                                     </button>
                                     <button type="button" title="Upload File" onClick={() => handleFileUpload(idx, 'address')} className="w-11 h-11 flex items-center justify-center bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-all border border-orange-200">
                                        <Upload size={14} />
                                     </button>
                                  </div>
                               </div>

                               <div>
                                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Guest Face Photo</label>
                                  <button type="button" onClick={() => handleCameraScan(idx, 'photo')} className="w-full h-11 flex items-center justify-center gap-2 bg-primary-50 text-primary-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all border border-primary-100 overflow-hidden relative group">
                                     {bookingForm.guestsList[idx].guestPhoto ? (
                                        <div className="absolute inset-0 w-full h-full">
                                           <img src={bookingForm.guestsList[idx].guestPhoto} alt="photo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                           <div className="absolute inset-0 bg-primary-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                              <Camera size={14} className="text-white" />
                                           </div>
                                        </div>
                                     ) : (
                                        <><Camera size={12} /> GUEST PHOTO</>
                                     )}
                                  </button>
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="col-span-full border-t border-gray-100 pt-4 mt-2 flex items-center justify-between">
                         {bookingType !== 'Day' ? (
                           <label className="flex items-center gap-2 cursor-pointer group bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100 hover:shadow-md transition-all"><input type="checkbox" name="hasKitchen" checked={bookingForm.hasKitchen} onChange={handleBookingFormChange} className="hidden" /><div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${bookingForm.hasKitchen ? 'bg-orange-500 border-orange-500' : 'border-orange-200 bg-white'}`}>{bookingForm.hasKitchen && <Coffee size={12} className="text-white" />}</div><div><span className="block text-[9px] font-black text-orange-950 uppercase tracking-widest">Kitchen Access</span><span className="text-[8px] font-black text-orange-400 uppercase tracking-widest">+ ₹300.00</span></div></label>
                         ) : <div />}
                         <div className="flex flex-col items-end">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Stay Payable</p>
                           <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">₹{roomTotal.toLocaleString()}</h3>
                           <button onClick={() => setBookingStep('addons')} className="px-8 py-3 bg-green-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-green-100 flex items-center gap-2 hover:bg-green-600 transition-all active:scale-95">Add Breakfast / Tea <ChevronRight size={18} /></button>
                         </div>
                      </div>
                </div>
              )}

              {/* Step 3: Add-ons (Water, Breakfast, etc) */}
              {bookingStep === 'addons' && (
                <div className="space-y-8 py-4 animate-scale-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {[
                         { id: 'water', label: 'Water Bottle', price: 25, icon: GlassWater, color: 'text-blue-500', bg: 'bg-blue-50' },
                         { id: 'breakfast', label: 'Breakfast', price: 100, icon: UtensilsCrossed, color: 'text-orange-500', bg: 'bg-orange-50' },
                         { id: 'lunch', label: 'Lunch', price: 150, icon: UtensilsCrossed, color: 'text-green-500', bg: 'bg-green-50' },
                         { id: 'dinner', label: 'Dinner', price: 150, icon: UtensilsCrossed, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                         { id: 'coffee', label: 'Coffee', price: 25, icon: Coffee, color: 'text-brown-500', bg: 'bg-stone-50' },
                         { id: 'tea', label: 'Tea', price: 20, icon: GlassWater, color: 'text-green-500', bg: 'bg-green-50' },
                       ].map(item => (
                       <div key={item.id} className={`${item.bg} p-6 rounded-[32px] border border-black/5 flex items-center justify-between`}>
                         <div className="flex items-center gap-4">
                            <div className={`p-4 bg-white rounded-2xl shadow-sm ${item.color}`}><item.icon size={24} /></div>
                            <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p><p className="text-xl font-black text-gray-900 tracking-tight">₹{item.price}</p></div>
                         </div>
                         <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl shadow-sm border border-black/5">
                            <button onClick={() => updateAddon(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-gray-50 rounded-lg text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100">-</button>
                            <span className="text-base font-black min-w-[20px] text-center text-gray-900">{bookingForm.addons[item.id]}</span>
                            <button onClick={() => updateAddon(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-gray-50 rounded-lg text-sm font-bold text-gray-500 hover:bg-green-50 hover:text-green-500 transition-all border border-gray-100">+</button>
                         </div>
                       </div>
                     ))}
                  </div>
                  <div className="flex justify-end pt-8 border-t border-gray-50">
                    <button onClick={() => setBookingStep('payment')} className="px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">Proceed to Final Payment <ChevronRight size={18} /></button>
                  </div>
                </div>
              )}

              {/* Step 4: Final Payment & Billing — Letterhead Style */}
              {bookingStep === 'payment' && (
                <div className="animate-scale-in">

                  <div className="px-5 py-4 space-y-3">
                    {/* Guest + Stay row */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Guest Details */}
                      <div className="border border-gray-100 rounded-xl p-3 space-y-1 relative overflow-hidden">
                        <p className="text-[9px] font-black text-[#007A7A] uppercase tracking-widest flex items-center gap-1"><User size={11} /> Guest Details</p>
                        <p className="text-sm font-black text-gray-900">{bookingForm.name || 'Guest'}</p>
                        <p className="text-[10px] text-gray-400">{bookingForm.idProof}: {bookingForm.documentNo}</p>
                        <div className="flex gap-1.5 mt-2 mb-1">
                           {bookingForm.guestsList[0].frontImage && <div className="w-10 h-10 rounded-lg border border-blue-100 overflow-hidden bg-gray-50"><img src={bookingForm.guestsList[0].frontImage} className="w-full h-full object-cover" alt="front"/></div>}
                           {bookingForm.guestsList[0].addressImage && <div className="w-10 h-10 rounded-lg border border-orange-100 overflow-hidden bg-gray-50"><img src={bookingForm.guestsList[0].addressImage} className="w-full h-full object-cover" alt="back"/></div>}
                           {bookingForm.guestsList[0].guestPhoto && <div className="w-10 h-10 rounded-lg border border-primary-100 overflow-hidden bg-gray-50"><img src={bookingForm.guestsList[0].guestPhoto} className="w-full h-full object-cover" alt="photo"/></div>}
                        </div>
                        <p className="text-[10px] text-gray-500 flex items-center gap-2">📞 {bookingForm.mobile}</p>
                        <p className="text-[10px] font-black text-primary-600 flex items-center gap-1">📍 Room {selectedRoom.no} <span className="text-[7px] text-primary-400 uppercase">({selectedRoom.facilities?.ac ? 'AC' : 'NON-AC'})</span></p>
                        {bookingType === 'Referral' && bookingForm.referPerson && <p className="text-[9px] text-[#007A7A] font-bold uppercase">Ref: {bookingForm.referPerson}</p>}
                      </div>

                      {/* Check-in / Check-out */}
                      <div className="border border-gray-100 rounded-xl p-3 space-y-2">
                        <p className="text-[9px] font-black text-[#007A7A] uppercase tracking-widest flex items-center gap-1"><Calendar size={11} /> Stay Period</p>
                        {/* Check-In */}
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1 flex-shrink-0"></div>
                          <div>
                            <p className="text-[8px] text-gray-400 uppercase font-bold">Check-In</p>
                            <p className="text-[11px] font-black text-gray-900">{bookingForm.checkInDate ? new Date(bookingForm.checkInDate).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : '—'}</p>
                            <p className="text-[9px] text-[#007A7A] font-bold">⏰ {bookingForm.checkInTime || '—'}</p>
                          </div>
                        </div>
                        <div className="border-t border-dashed border-gray-100"></div>
                        {/* Check-Out */}
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0"></div>
                          <div>
                            <p className="text-[8px] text-gray-400 uppercase font-bold">Check-Out</p>
                            <p className="text-[11px] font-black text-gray-900">{bookingForm.checkOutDate ? new Date(bookingForm.checkOutDate).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : '—'}</p>
                            <p className="text-[9px] text-red-400 font-bold">⏰ {bookingForm.checkOutTime || '—'}</p>
                          </div>
                        </div>
                        <div className="pt-1 border-t border-gray-100 flex justify-between items-center">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">Duration</span>
                          <span className="text-[9px] font-black text-gray-800 bg-gray-50 px-2 py-0.5 rounded-full">{bookingType === 'Hour' ? `${bookingForm.numHours} Hour(s)` : `${bookingForm.numDays} Night(s)`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Payment Mode</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['Cash', 'QR Code', 'UPI'].map(mode => (
                          <button key={mode} onClick={() => setBookingForm(prev => ({...prev, paymentMode: mode}))} className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${bookingForm.paymentMode === mode ? 'bg-[#007A7A] text-white border-[#007A7A]' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}`}>{mode}</button>
                        ))}
                      </div>
                    </div>

                    {/* GST Toggle */}
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Bill Type</p>
                      <div className="flex bg-gray-100 p-0.5 rounded-lg">
                        <button onClick={() => setBookingForm(prev => ({...prev, useGst: false}))} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${!bookingForm.useGst ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Standard</button>
                        <button onClick={() => setBookingForm(prev => ({...prev, useGst: true}))} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${bookingForm.useGst ? 'bg-[#007A7A] text-white shadow-sm' : 'text-gray-400'}`}>GST +5%</button>
                      </div>
                    </div>

                    {bookingForm.useGst && (
                      <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1 duration-300">
                        <div>
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Company Name</label>
                          <input 
                            type="text" 
                            name="companyName" 
                            value={bookingForm.companyName} 
                            onChange={handleBookingFormChange} 
                            placeholder="e.g. Acme Corp" 
                            className={inputClass} 
                            style={{ color: 'black', fontWeight: '900' }}
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 block">GST Number</label>
                          <input 
                            type="text" 
                            name="gstNumber" 
                            value={bookingForm.gstNumber} 
                            onChange={handleBookingFormChange} 
                            placeholder="29XXXXX..." 
                            className={inputClass} 
                            style={{ color: 'black', fontWeight: '900' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Detailed Bill Structure */}
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Detailed Bill Structure</p>
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        {/* Bill Header */}
                        <div className="bg-gray-50 px-3 py-1.5 grid grid-cols-3 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                          <span>Description</span><span className="text-center">Qty</span><span className="text-right">Amount</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {perPersonCosts.map((cost, idx) => (
                            <div key={idx} className="px-3 py-1.5 grid grid-cols-3 text-[10px]">
                              <span className="text-gray-600 font-bold">Guest {idx + 1} Stay</span>
                              <span className="text-center text-gray-400">1</span>
                              <span className="text-right font-black text-gray-900">₹{cost.toFixed(0)}</span>
                            </div>
                          ))}
                          {bookingForm.hasKitchen && (
                            <div className="px-3 py-1.5 grid grid-cols-3 text-[10px]">
                              <span className="text-orange-600 font-bold">Kitchen Access</span>
                              <span className="text-center text-gray-400">1</span>
                              <span className="text-right font-black text-orange-600">₹300</span>
                            </div>
                          )}
                          {Object.entries(bookingForm.addons || {}).map(([id, count]) => {
                            if (count > 0) {
                              const prices = { water: 25, breakfast: 100, lunch: 150, dinner: 150, coffee: 25, tea: 20 };
                              const labels = { water: 'Water Bottle', breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', coffee: 'Coffee', tea: 'Tea' };
                              return (
                                <div key={id} className="px-3 py-1.5 grid grid-cols-3 text-[10px]">
                                  <span className="text-blue-600 font-bold">{labels[id]}</span>
                                  <span className="text-center text-gray-400">{count}</span>
                                  <span className="text-right font-black text-blue-600">₹{count * prices[id]}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                        {/* Totals */}
                        <div className="border-t border-gray-200 bg-gray-50 px-3 py-2 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-gray-500 font-bold">Subtotal</span>
                            <span className="font-black text-gray-800">₹{subtotal.toFixed(0)}</span>
                          </div>
                          {bookingForm.useGst && (
                            <div className="flex justify-between text-[10px] text-[#007A7A]">
                              <span className="font-bold">GST (5%)</span>
                              <span className="font-black">₹{gst.toFixed(0)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm border-t border-gray-200 pt-1">
                            <span className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Total Payable</span>
                            <span className="font-black text-[#007A7A] text-base">₹{finalTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                          </div>
                        </div>
                    </div>
                   </div>

                   {/* Terms and Conditions - Compressed for 1 page print */}
                   <div className="px-5 pb-4 mt-2 border-t border-gray-100 pt-3">
                     <p className="text-[9px] font-black text-[#007A7A] uppercase tracking-widest mb-1.5 border-b border-gray-100 pb-1">Terms & Conditions</p>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                       {[
                         "All payments are non-refundable under any circumstances.",
                         "Guests are expected to take proper care of hotel property.",
                         "Smoking allowed only in designated areas.",
                         "Pets are not allowed on the premises.",
                         "Any damage to property will be charged to the guest.",
                         "Damage to key/lock: ₹5,000 penalty payable before checkout.",
                         "Room keys must be submitted at reception while going out.",
                         "Loss/failure to return room key: ₹5,000 charge.",
                         "Hotel not responsible for loss of guest valuables.",
                         "Valuables/luggage cannot be deposited at reception.",
                         "Management reserves right to open rooms locked for 24h.",
                         "Assistance available; communicate respectfully.",
                         "Misbehavior/arguments may lead to termination of stay.",
                         "Do not collect personal contact of hotel staff.",
                         "Contact reception directly for assistance/service.",
                         "All bills must be cleared in advance.",
                         "Additional persons must be registered at reception.",
                         "Visitors are not permitted inside guest rooms.",
                         "Delivery services are not accepted at reception.",
                         "Electronics/furniture damage must be compensated.",
                         "Staying beyond 24 hours incurs additional charges.",
                         "Rooms for lodging only; no business or other activities."
                       ].map((term, index) => (
                         <div key={index} className="flex gap-1 items-start">
                           <span className="text-[6.5px] font-black text-[#007A7A] bg-gray-50 flex-shrink-0">{index + 1}.</span>
                           <p className="text-[6.5px] leading-tight text-gray-500 font-medium">{term}</p>
                         </div>
                       ))}
                     </div>
                     
                     <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                        <div className="space-y-4">
                           <div className="w-20 h-px bg-gray-300"></div>
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Guest Signature</p>
                        </div>
                        <div className="text-right space-y-4">
                           <div className="w-20 h-px bg-[#007A7A]/30 ms-auto"></div>
                           <p className="text-[7px] font-black text-[#007A7A] uppercase tracking-widest">Hotel Authorized Seal</p>
                        </div>
                     </div>
                   </div>

                    {/* Bill Actions: Print and Share */}
                    <div className="grid grid-cols-2 gap-3 mb-3 px-1 no-print">
                      <button 
                        onClick={() => window.print()} 
                        className="py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                         <Download size={14} className="text-primary-500" /> Print / Download
                      </button>
                      <button 
                        onClick={() => {
                          const billText = `Hello ${bookingForm.name}, Your bill for Room ${selectedRoom.no} at Hotel Shubha Sai is attached. Total: ₹${finalTotal.toLocaleString()}. Thank you!`;
                          handleShareAsImage(billText);
                        }} 
                        className="py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                         <Share2 size={14} className="text-blue-500" /> Share Bill
                      </button>
                    </div>

                    {/* Teal footer bar + Confirm button */}
                    <button 
                      onClick={handleFinalBooking} 
                      disabled={submitting}
                      className="w-full py-3 bg-[#007A7A] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#006060] transition-all active:scale-[0.98] shadow-lg no-print disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Confirm & Complete Booking'}
                    </button>
                  </div>

                  {/* Bottom teal accent bar (like letterhead footer) */}
                  <div className="flex gap-2 px-5 pb-3 no-print">
                    <div className="h-2 w-12 bg-[#007A7A] rounded-full"></div>
                    <div className="h-2 w-8 bg-[#007A7A]/50 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="p-8 bg-gray-50/50 flex justify-center sticky bottom-0 no-print">
               <button onClick={() => {
                 if (['new_booking','extend','shift','checkout_summary'].includes(bookingStep)) setBookingStep('options');
                 else if (bookingStep === 'addons') setBookingStep('new_booking');
                 else if (bookingStep === 'payment') setBookingStep('addons');
                 else setShowPopup(false);
               }} className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-gray-900 flex items-center gap-2">
                 {bookingStep === 'options' ? 'Dismiss Portal' : '← Go Back'}
               </button>
            </div>
          </div>
        </div>
      )}
      {/* CAMERA SCAN OVERLAY */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/95 z-[500] flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-3xl">
          <div className="absolute top-8 right-8">
            <button onClick={() => setShowCamera(false)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"><X size={24} /></button>
          </div>
          
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-[40px] overflow-hidden border-2 border-white/20 shadow-2xl">
            <video 
              autoPlay 
              playsInline 
              muted 
              ref={(el) => {
                if (el && showCamera) {
                  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                    .then(stream => el.srcObject = stream)
                    .catch(err => {
                      showToast('Camera Permission Denied!', 'error');
                      setShowCamera(false);
                    });
                }
              }}
              className="w-full h-full object-cover"
            />
            
            {/* Scanning Guide Overlay */}
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
               <div className="w-full h-full border-2 border-primary-500 rounded-2xl relative">
                  <div className="absolute inset-0 bg-primary-500/10 animate-pulse"></div>
                  {/* Corners */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl-xl"></div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr-xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl-xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br-xl"></div>
                  
                  {/* Scanning Line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-primary-500 shadow-[0_0_15px_rgba(34,197,94,0.8)] animate-scan-line"></div>
               </div>
            </div>

            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <button 
                onClick={(e) => captureAndProcess(e.target.closest('div.relative').querySelector('video'))}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all group"
              >
                <div className="w-16 h-16 border-4 border-gray-900 rounded-full flex items-center justify-center">
                   <div className="w-12 h-12 bg-gray-900 rounded-full group-hover:bg-primary-500 transition-colors"></div>
                </div>
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center text-white">
            <h3 className="text-xl font-black uppercase tracking-[0.3em] mb-2">Scanning {cameraTarget.type.toUpperCase()}</h3>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Align document within the frame for best accuracy</p>
          </div>
        </div>
      )}

      {/* Global CSS for scanning animation */}
      <style>{`
        @keyframes scan-line {
          0% { top: 10%; }
          100% { top: 90%; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AvailableRooms;
