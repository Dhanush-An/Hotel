import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Wifi, Utensils, Users, 
  Sparkles, Phone, Mail, MapPin,
  CheckCircle2, Coffee, Tv, Wind, X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './LandingPage.css'; // Reusing some base styles

// Re-import images (simplified for now, ideally passed via state or fetched)
import roomImg1 from '../assets/room1.jpeg';
import roomImg2 from '../assets/room2.jpeg';
import roomImg3 from '../assets/room3.jpeg';
import roomImg4 from '../assets/room4.jpeg';
import roomImg5 from '../assets/room5.jpeg';

const roomsData = {
  // AC Rooms
  "ac-1-sharing": {
    name: "AC 1 Sharing",
    img: roomImg1,
    price: 1500,
    description: "Experience premium comfort with our fully air-conditioned 1 Sharing Room. Featuring elegant decor, top-tier cooling, and modern amenities designed to offer the ultimate relaxing environment.",
    amenities: ["High-speed WiFi", "Air Conditioning", "Flat-screen TV", "Mini Fridge", "Coffee Maker", "Premium Linens"],
    features: ["City View", "Soundproof Walls", "Dedicated Workspace"]
  },
  "ac-2-sharing": {
    name: "AC 2 Sharing",
    img: roomImg2,
    price: 1900,
    description: "Designed for those who seek extra luxury, this air-conditioned 2 Sharing room provides a sophisticated environment. Enjoy premium finishings and enhanced privacy in a stylishly curated and cooled space.",
    amenities: ["High-speed WiFi", "Central Air Conditioning", "Executive Desk", "Espresso Machine", "Lounge Access", "Premium Toiletries"],
    features: ["Panoramic Views", "Luxury Bath", "Personal Safe"]
  },
  "ac-3-sharing": {
    name: "AC 3 Sharing",
    img: roomImg3,
    price: 2300,
    description: "Spacious and welcoming, our AC 3 Sharing Suite is designed to keep your entire group comfortable and cool. With multiple bedding options and ample climate-controlled common space, it's the perfect home away from home.",
    amenities: ["High-speed WiFi", "Dual-Zone AC", "Connected Rooms", "Large Dining Area", "Kitchenette", "Extra Bedding"],
    features: ["Mountain View", "Private Balcony", "Child-friendly Amenities"]
  },
  "ac-4-sharing": {
    name: "AC 4 Sharing",
    img: roomImg4,
    price: 2600,
    description: "Indulge in the ultimate luxury experience. Our AC 4 Sharing Suite features top-of-the-line amenities, bespoke furniture, and an attention to detail with whisper-quiet air conditioning for an unforgettable stay.",
    amenities: ["High-speed WiFi", "Whisper Quiet AC", "Jacuzzi", "Bose Sound System", "Mini Bar", "Designer Decor"],
    features: ["Highest Floor", "Floor-to-ceiling Windows", "Exclusive Decor"]
  },

  // Non-AC Rooms
  "non-ac-1-sharing": {
    name: "Non-AC 1 Sharing",
    img: roomImg5,
    price: 1000,
    description: "A cozy and comfortable 1 sharing budget room utilizing natural ventilation. Perfect for guests who prefer fresh air and a simpler, eco-friendly accommodation option.",
    amenities: ["High-speed WiFi", "Ceiling Fan", "Large Windows", "TV", "Coffee Maker", "Fresh Linens"],
    features: ["Natural Ventilation", "Eco-friendly", "Quiet Zone"]
  },
  "non-ac-2-sharing": {
    name: "Non-AC 2 Sharing",
    img: roomImg1,
    price: 1500,
    description: "Upgrade to extra space with our Non-AC 2 Sharing Room. Enjoy elegant wooden furnishings, broad windows for maximum cross-ventilation, and a spacious layout.",
    amenities: ["High-speed WiFi", "Multiple Fans", "Rain Shower", "Room Service", "Premium Spa access", "Lounge Chair"],
    features: ["Cross Ventilation", "Private Balcony", "Spacious Design"]
  },
  "non-ac-3-sharing": {
    name: "Non-AC 3 Sharing",
    img: roomImg2,
    price: 1900,
    description: "Our 3 sharing non-AC deluxe room offers a premium environment with superior ventilation and high-quality furnishings. Perfect for those who want comfort without the artificial cooling.",
    amenities: ["High-speed WiFi", "High-Speed Fans", "Kitchenette", "Convertible Workspace", "Smart TV", "Eco-friendly Toiletries"],
    features: ["Family Layout", "Open Design", "City Center View"]
  },
  "non-ac-4-sharing": {
    name: "Non-AC 4 Sharing",
    img: roomImg3,
    price: 2300,
    description: "The ultimate non-AC luxury experience. A massive 4 sharing suite designed for families or groups, featuring cross-ventilation, multiple seating areas, and a private balcony.",
    amenities: ["High-speed WiFi", "Ceiling Fan", "Basic Toiletries", "Comfortable Bed", "Regular Cleaning", "Locker"],
    features: ["Grand Design", "Max Space", "Best Views"]
  }
};

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const room = roomsData[id];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [formData, setFormData] = useState({
        guest: '',
        phone: '',
        altPhone: '',
        adults: 1,
        checkin: new Date().toISOString().split('T')[0],
        checkout: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setFormData(prev => ({
                ...prev,
                guest: user.name || '',
                phone: user.mobile || user.phone || ''
            }));
        }
    }, [id]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitBookingForm = async (e) => {
        e.preventDefault();
        
        if (!formData.guest || !formData.phone || !formData.checkin || !formData.checkout) {
             showToast('Please fill out all fields.', 'warning');
             return;
        }

        try {
            const d1 = new Date(formData.checkin);
            const d2 = new Date(formData.checkout);
            const calculatedNights = Math.max(1, Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) || 1);

            const bookingData = {
                id: `BKG-${Math.floor(1000 + Math.random() * 9000)}`,
                guest: formData.guest,
                phone: formData.phone,
                altPhone: formData.altPhone,
                adults: parseInt(formData.adults),
                room: `Pending - ${room.name}`,
                type: room.name,
                checkin: formData.checkin,
                checkout: formData.checkout,
                nights: calculatedNights,
                amount: calculatedNights * (room.price || 0), 
                status: 'Pending', 
                payment: 'Pending',
                method: 'N/A',
                source: 'Website'
            };

            await api.createBooking(bookingData);
            setIsModalOpen(false);
            setIsConfirmationOpen(true);
        } catch (err) {
            showToast('Failed to submit booking request.', 'error');
        }
    };

    if (!room) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
                <h1 className="text-4xl font-bold mb-4">Room Not Found</h1>
                <button onClick={() => navigate('/')} className="hero-book-btn">Back to Home</button>
            </div>
        );
    }

    return (
        <div className="landing-container bg-black min-h-screen text-white">
            {/* Simple Navbar for Details Page */}
            <header className="header" style={{position: 'relative'}}>
                <div className="nav-container">
                    <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                        <img src="/logo.png" alt="Hotel Shubha Sai" style={{height:'40px'}} />
                        <span className="logo-text font-outfit uppercase">HOTEL <span className="logo-accent">SHUBHA SAI</span></span>
                    </div>
                    <Link to="/" className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                        <ArrowLeft size={18} /> BACK TO HOME
                    </Link>
                </div>
            </header>

            {/* Room Hero */}
            <section className="relative h-[60vh] overflow-hidden">
                <img src={room.img} alt={room.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-12 left-0 right-0 max-w-7xl mx-auto px-6">
                    <h1 className="text-6xl font-outfit font-black italic uppercase italic tracking-tighter">{room.name}</h1>
                    <div className="flex items-center gap-4 mt-4">
                        <p className="px-3 py-1.5 bg-white text-black font-bold text-sm tracking-widest uppercase inline-block">EXPERIENCE PURE LUXURY</p>
                        <p className="text-2xl font-bold">₹{room.price} <span className="text-sm font-normal opacity-80">/ 24 hour</span></p>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div>
                    <h2 className="text-3xl font-outfit font-bold mb-8 uppercase tracking-widest">Description</h2>
                    <p className="text-lg text-muted leading-relaxed mb-12">
                        {room.description}
                    </p>

                    <h2 className="text-3xl font-outfit font-bold mb-8 uppercase tracking-widest">Amenities</h2>
                    <div className="grid grid-cols-2 gap-y-4">
                        {room.amenities.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-muted">
                                <CheckCircle2 size={16} className="text-primary-accent" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 h-fit">
                    <h3 className="text-2xl font-outfit font-bold mb-8 uppercase text-center">In-Room Features</h3>
                    <div className="space-y-6 mb-12">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <Wifi className="text-primary-accent" />
                            <div>
                                <p className="font-bold">Complimentary WiFi</p>
                                <p className="text-xs text-muted">Stay connected throughout your stay</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <Coffee className="text-primary-accent" />
                            <div>
                                <p className="font-bold">Breakfast Service</p>
                                <p className="text-xs text-muted">In-room dining options available</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <Wind className="text-primary-accent" />
                            <div>
                                <p className="font-bold">Air Conditioning</p>
                                <p className="text-xs text-muted">Individually controlled climate</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="hero-book-btn w-full text-center block" style={{borderRadius: '16px'}}
                    >
                        BOOK THIS ROOM
                    </button>
                    <p className="text-xs text-center mt-4 text-muted">Call us at +91 9901303998 for immediate assistance</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer mt-20">
                <div className="footer-top">
                    <span className="logo-text font-outfit uppercase">HOTEL <span className="logo-accent">SHUBHA SAI</span></span>
                    <p className="footer-tagline">© 2026 FORGE INDIA CONNECT PVT LTD.ALL RIGHTS RESERVED.</p>
                </div>
            </footer>

            {/* Booking Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
                    <div className="bg-[#111] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
                            <h2 className="text-xl font-bold font-outfit uppercase tracking-wider text-white">Booking Details</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={submitBookingForm} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                <input 
                                    name="guest" value={formData.guest} onChange={handleFormChange} required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" 
                                    placeholder="Enter your name" 
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Mobile Number</label>
                                    <input 
                                        name="phone" value={formData.phone} onChange={handleFormChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" 
                                        placeholder="Primary number" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Alternative Mobile</label>
                                    <input 
                                        name="altPhone" value={formData.altPhone} onChange={handleFormChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" 
                                        placeholder="Optional" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">No. of Persons</label>
                                <input 
                                    type="number" name="adults" value={formData.adults} onChange={handleFormChange} min="1" required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Check-in</label>
                                    <input 
                                        type="date" name="checkin" value={formData.checkin} onChange={handleFormChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Check-out</label>
                                    <input 
                                        type="date" name="checkout" value={formData.checkout} onChange={handleFormChange} required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 [color-scheme:dark]" 
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 mt-6">
                                <button type="submit" className="hero-book-btn w-full text-center block outline-none" style={{borderRadius: '16px'}}>
                                    CONFIRM REQUEST
                                </button>
                                <p className="text-center text-[10px] text-gray-400 mt-3">*Payment will be collected at reception</p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Confirmation Modal */}
            {isConfirmationOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[6000] flex items-center justify-center p-6">
                    <div className="bg-[#111] w-full max-w-md rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary-accent to-purple-500"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-accent/10 rounded-full blur-[80px]"></div>
                        {/* Decorative background elements */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-accent/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-accent/5 rounded-full blur-3xl"></div>
                        
                        <div className="p-10 text-center relative z-10">
                            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Sparkles className="text-primary-accent w-10 h-10 animate-pulse" />
                            </div>
                            
                            <h2 className="text-3xl font-outfit font-black uppercase italic tracking-tighter mb-6">
                                Reservation <span className="text-primary-accent">Confirmation</span>
                            </h2>
                                                      <div className="space-y-6 text-gray-300 leading-relaxed text-sm">
                                <p className="font-medium text-white not-italic tracking-tight text-lg">
                                    Your reservation at <span className="font-bold text-primary-accent">Hotel Shubha Sai</span> has been received.
                                </p>
                                
                                <p className="opacity-70 italic font-light">
                                    We are delighted to prepare a space where comfort awaits you...
                                </p>
                                
                                <div className="py-6 px-4 border-y border-white/5 my-6">
                                    <p className="text-[#DCEB8C] font-serif text-lg leading-relaxed italic">
                                        “Some journeys begin with a booking, but the most memorable ones begin with a feeling.”
                                    </p>
                                </div>
                            </div>             
                                <p className="text-white font-medium">
                                    We look forward to welcoming you soon.
                                </p>
                            </div>

                            <button 
                                onClick={() => {
                                    setIsConfirmationOpen(false);
                                    if (localStorage.getItem('user')) {
                                        navigate('/customer/dashboard');
                                    } else {
                                        navigate('/');
                                    }
                                }} 
                                className="hero-book-btn mt-8 w-full py-4 rounded-3xl flex items-center justify-center gap-2 group text-xs font-black tracking-widest uppercase"
                            >
                                {localStorage.getItem('user') ? 'GO TO DASHBOARD' : 'BACK TO HOME'} 
                                <ArrowLeft size={14} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                            </button>
                            
                            <button 
                                onClick={() => setIsConfirmationOpen(false)}
                                className="mt-6 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                            >
                                Close & Stay here
                            </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomDetails;
