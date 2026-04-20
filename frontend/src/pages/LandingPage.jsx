import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

import { 
  Menu, X, MapPin, Calendar, Users, 
  Utensils, Wifi, Sparkles, Dumbbell, 
  ChevronRight, Phone, Mail, Instagram,   Facebook, Twitter, Youtube, MessageSquare,
   ArrowLeft, ArrowRight, CheckCircle2, 
   Coffee, Wind, Sparkles as SparklesIcon,
   Accessibility, Heart, Crown, Car, Map, Camera, 
   ArrowUpCircle, ParkingCircle, Award
 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import './LandingPage.css';

import roomImg1 from '../assets/Shubha sai.jpg';
import roomImg2 from '../assets/Hotel.jpg';
import roomImg3 from '../assets/Hotel 5.jpg';
import roomImg4 from '../assets/Hotel 4.jpg';
import roomImg5 from '../assets/Hotel 3.jpg';
import roomImg6 from '../assets/Hotel 2.jpg';
import roomImg7 from '../assets/room2.jpeg';
import roomImg8 from '../assets/room4.jpeg';

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(false);

    const storyItems = [
        { id: 1, title: 'Hotel Shubha Sai', img: '/images/story/story-1.png', text: 'Nestled in the heart of Bommasandra’s vibrant yet serene surroundings, Hotel Shubha Sai stands as a quiet sanctuary where simplicity meets soulful hospitality. Strategically located near major industrial hubs and key landmarks, our hotel offers a convenient retreat for both business travelers and leisure seekers, blending accessibility with comfort in perfect harmony. Beyond just a place to stay, it is a space where weary journeys find rest and busy minds discover calm—an address that feels less like a hotel and more like a gentle pause in life’s fast-moving rhythm.' },
        { id: 2, quote: '“At Hotel Shubha Sai, we believe that true luxury is not in extravagance, but in the warmth of a welcoming space and the peace it brings to your soul.”', img: '/images/story/story-2.png' },
        { id: 3, title: 'Quiet Refinement', img: '/images/story/story-3.png', text: 'Every room at Hotel Shubha Sai is thoughtfully curated to reflect a sense of quiet refinement. Whether you choose an air-conditioned or non-AC space, you will find yourself embraced by interiors that speak of understated elegance—clean lines, soft lighting, and a soothing ambiance designed for true relaxation. Equipped with essential modern comforts such as Wi-Fi, private bathrooms, and well-appointed furnishings, each room becomes your personal haven, where comfort is effortless and rest comes naturally.' },
        { id: 4, title: 'Timeless Charm', img: '/images/story/story-4.png', text: 'Yet, what truly defines us is not just our rooms, but the feeling that lingers within them. There is a timeless charm woven into every corner of our hotel—a subtle echo of traditional hospitality where guests are not just visitors, but valued individuals. Here, every greeting carries sincerity, every service is offered with care, and every detail is attended to with quiet dedication.' },
        { id: 5, title: 'Old-World Grace', img: '/images/story/story-5.png', text: 'Step inside, and you are welcomed into an atmosphere reminiscent of old-world grace—where time slows down, and every moment feels intentional. The gentle calm of our surroundings offers a refreshing escape from the city’s chaos, allowing you to unwind in peace. With 24-hour assistance and a team devoted to making your stay seamless, we ensure that your experience is not only comfortable but also deeply reassuring.' },
        { id: 6, quote: '“Travel not just to reach a destination, but to find a place that feels like it was waiting for you — a place like Shubha Sai.”', img: '/images/story/story-6.png' },
        { id: 7, title: 'A Warm Spirit', img: '/images/story/story-7.png', text: 'Whether you arrive with the purpose of business in the nearby industrial and tech corridors or seek a restful stop along your journey, Hotel Shubha Sai welcomes you with open doors and a warm spirit. It is a place where mornings begin with calm, evenings end with comfort, and every stay becomes a memory worth revisiting.' },
        { id: 8, title: 'Rediscover Joy', img: '/images/story/story-8.png', text: 'Come, allow yourself to slow down, to breathe a little deeper, and to rediscover the quiet joy of genuine hospitality—only at Hotel Shubha Sai.' }
    ];

    // Double items for seamless marquee
    const marqueeItems = [...storyItems, ...storyItems];
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        guest: '',
        phone: '',
        altPhone: '',
        adults: 1,
        checkin: new Date().toISOString().split('T')[0],
        checkout: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
    });

    const [queryData, setQueryData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    useEffect(() => {
        if (isBookingModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isBookingModalOpen]);

    const handleQuerySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.createQuery({
                guestName: queryData.name,
                guestEmail: queryData.email,
                subject: queryData.subject || 'General Inquiry',
                message: queryData.message,
                status: 'Pending'
            });
            showToast('Your message has been sent successfully!', 'success');
            setQueryData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            showToast('Failed to send message. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' || name === 'altPhone') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const submitBookingForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        
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
                room: `Pending - ${selectedRoom.name}`,
                type: selectedRoom.name,
                checkin: formData.checkin,
                checkout: formData.checkout,
                nights: calculatedNights,
                amount: calculatedNights * (selectedRoom.price || 0), 
                status: 'Pending', 
                payment: 'Pending',
                method: 'N/A',
                source: 'Website'
            };

            await api.createBooking(bookingData);
            setIsBookingModalOpen(false);
            setIsConfirmationOpen(true);
        } catch (err) {
            showToast('Failed to submit booking request.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openBooking = (room) => {
        setSelectedRoom(room);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setFormData(prev => ({
                ...prev,
                guest: user.name || '',
                phone: user.mobile || user.phone || ''
            }));
        }
        setIsBookingModalOpen(true);
    };

    const slugify = (text) => text.toLowerCase().replace(/ /g, '-');

    return (
        <div className="landing-container">
            {/* Header / Navbar */}
            <header className="header">
                <div className="nav-container">
                    <div className="logo">
                        <span className="logo-text font-outfit uppercase">HOTEL <span className="logo-accent">SHUBHA SAI</span></span>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                    
                    <nav className={`navbar ${isMenuOpen ? 'open' : ''}`}>
                        <ul className="nav-links">
                            <li><a href="#about">HOME</a></li>
                            <li><a href="#rooms">ROOMS</a></li>
                            <li><a href="#features">FEATURES</a></li>
                            <li><a href="#gallery">GALLERY</a></li>
                            <li className="nav-divider">|</li>
                            <li><Link to="/login" className="login-btn text-xs tracking-[0.2em] font-black">STAFF LOGIN</Link></li>
                        </ul>
                    </nav>

                    <nav className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
                         <ul className="mobile-links">
                            <li><a href="#about" onClick={() => setIsMenuOpen(false)}>HOME</a></li>
                            <li><a href="#rooms" onClick={() => setIsMenuOpen(false)}>ROOMS</a></li>
                            <li><a href="#features" onClick={() => setIsMenuOpen(false)}>FEATURES</a></li>
                            <li><a href="#gallery" onClick={() => setIsMenuOpen(false)}>GALLERY</a></li>
                            <li className="mobile-divider" />
                            <li><Link to="/login" className="login-btn-mobile" onClick={() => setIsMenuOpen(false)}>STAFF LOGIN</Link></li>
                         </ul>
                    </nav>

                </div>
            </header>

            {/* Accommodations Section */}
            <section id="rooms" className="rooms-section">
                <div className="section-header-centered">
                  <h2 className="section-title font-outfit text-center uppercase">Featured <span className="italic">Accommodations</span></h2>
                </div>

                <div className="rooms-grid">
                    {[
                      { name: "Junior Suite", img: roomImg1, price: 1500, description: "Compact luxury with essential premium amenities." },
                      { name: "Executive Suite", img: roomImg2, price: 1900, description: "Designed for business travelers seeking comfort and style." },
                      { name: "Luxury Suite", img: roomImg3, price: 2300, description: "Our finest décor and premium climate control." },
                      { name: "Family Suite", img: roomImg4, price: 2600, description: "Spacious multi-bed arrangement for family stays." },
                      { name: "Presidential Suite", img: roomImg5, price: 3000, description: "The ultimate peak of luxury and privacy." },
                      { name: "Honeymoon Suite", img: roomImg6, price: 2500, description: "Romantic ambiance with elegant furnishings." },
                      { name: "Studio Suite", img: roomImg7, price: 1800, description: "Modern open-plan living with artistic touches." },
                      { name: "Accessible Suite (for differently-abled guests)", img: roomImg8, price: 1600, description: "Wider spaces and thoughtful accessibility features." }
                    ].map((room, idx) => (
                      <div className="room-card" key={idx} onClick={() => openBooking(room)}>
                          <img src={room.img} alt={room.name} />
                          <div className="room-details">
                              <h3 className="room-name font-outfit uppercase flex flex-col">
                                  {room.name.includes('(') ? (
                                      <>
                                          <span>{room.name.split('(')[0]}</span>
                                          <span className="text-[10px] opacity-80 normal-case tracking-normal mt-1 leading-tight font-medium lowercase">({room.name.split('(')[1]}</span>
                                      </>
                                  ) : room.name}
                              </h3>
                              <div className="room-overlay-btn" onClick={(e) => { e.stopPropagation(); openBooking(room); }}>BOOK NOW</div>
                          </div>
                      </div>
                    ))}
                </div>
            </section>

            {/* Automatic Marquee Story Section */}
            <section id="about" className="story-marquee-section">
                <div className="story-marquee-title">
                    <h2>Our <span className="italic">Story</span></h2>
                </div>

                <div className="story-marquee-wrapper">
                    <motion.div 
                        className="story-marquee-container"
                        animate={{ x: ["0%", "-50%"] }}
                        transition={{ 
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: 120,
                                ease: "linear"
                            }
                        }}
                    >
                        {marqueeItems.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="story-card">
                                <div className="story-card-img-col">
                                    <img src={item.img} alt="Hotel Experience" />
                                </div>
                                <div className="story-card-info-col">
                                    <span className="story-card-number">0{(index % 8) + 1}</span>
                                    {item.title ? (
                                        <>
                                            <div className="story-card-accent-line"></div>
                                            <h3>{item.title}</h3>
                                            <p>{item.text}</p>
                                        </>
                                    ) : (
                                        <blockquote className="story-card-quote">
                                            {item.quote}
                                        </blockquote>
                                    )}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>


            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-header-centered">
                  <h2 className="section-title font-outfit text-center">Elevating Your <span className="italic">Experience</span></h2>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Wifi /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">HI-SPEED WIFI</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Utensils /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">KITCHEN</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Users /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">MEETING ROOM</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Sparkles /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">LAUNDRY SERVICE</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Phone /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">24/7 RECEPTION</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><SparklesIcon /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">24/7 HOUSEKEEPING</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Dumbbell /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">CO-WORKING</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><MapPin /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">PRIME LOCATION</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Heart /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">SANITARY KIT</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Heart /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">COUPLE FRIENDLY</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1534951474654-87823058c4a9?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Accessibility /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">WHEELCHAIR ACCESS</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Award /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">PREMIUM HOSPITALITY</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Car /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">AIRPORT TAXI</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Map /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">TOURISM SERVICES</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Coffee /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">HOTEL & CAFE</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Camera /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">24/7 SURVEILLANCE</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1613977257363-b073f3242095?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><ArrowUpCircle /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">LIFT SERVICE</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><ParkingCircle /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">FREE PARKING</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><Sparkles /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">RELAXING SPA</h3>
                        </div>
                    </div>
                    <div className="feature-card">
                        <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400" className="feature-bg-img" alt="" />
                        <div className="feature-content">
                            <div className="feature-icon"><CheckCircle2 /></div>
                            <h3 className="text-xs font-bold tracking-[0.2em]">24/7 POWER BACKUP</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Gallery Section */}
            <section id="gallery" className="gallery-section">
                <div className="section-header">
                  <h2 className="section-title font-outfit uppercase">Our <span className="italic">Gallery</span></h2>
                </div>

                <div className="gallery-grid">
                    <div className="gallery-item">
                        <img src="/images/gallery/gallery-1.jpg" alt="Gallery 1" />
                    </div>
                    <div className="gallery-item">
                        <img src="/images/gallery/gallery-2.jpg" alt="Gallery 2" />
                    </div>
                    <div className="gallery-item">
                        <img src="/images/gallery/gallery-3.jpg" alt="Gallery 3" />
                    </div>
                    <div className="gallery-item">
                        <img src="/images/gallery/gallery-4.jpg" alt="Gallery 4" />
                    </div>
                </div>
            </section>


            {/* Queries Section */}
            <section id="queries" className="queries-section">
                <div className="queries-grid">
                    <div className="queries-info">
                        <h2 className="section-title font-outfit uppercase">QUERIES</h2>
                        <p className="section-desc">Got a question? Send us a message and we'll get back to you as soon as possible.</p>
                        <ul className="contact-list">
                            <li><Phone size={20} /> +91 9901303998</li>
                            <li><Mail size={20} /> contactus@hotelshubhasai.in</li>
                            <li>
                                <a 
                                    href="https://www.google.com/maps/search/?api=1&query=Plot+No.145/B4,+3rd+Cross,+Behind+Priyadarshini+Petrol+Bunk,+Bommasandra+Industrial+Area,+Hosur+Main+Road,+Anekal+Taluk,+Bangalore-560099" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-[#DCEB8C] transition-colors flex items-start gap-3"
                                >
                                    <MapPin size={20} className="mt-1 shrink-0" /> 
                                    <span>Plot No.145/B4, 3rd Cross, Behind Priyadarshini Petrol Bunk, Bommasandra Industrial Area, Hosur Main Road, Anekal Taluk, Bangalore-560099</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div className="queries-form-wrapper">
                        <form className="queries-form" onSubmit={handleQuerySubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>FULL NAME</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe" 
                                        required 
                                        value={queryData.name} 
                                        onChange={(e) => setQueryData({...queryData, name: e.target.value})} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>EMAIL ADDRESS</label>
                                    <input 
                                        type="email" 
                                        placeholder="john@example.com" 
                                        required 
                                        value={queryData.email} 
                                        onChange={(e) => setQueryData({...queryData, email: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>SUBJECT</label>
                                <input 
                                    type="text" 
                                    placeholder="Reservation Inquiry" 
                                    required 
                                    value={queryData.subject} 
                                    onChange={(e) => setQueryData({...queryData, subject: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>MESSAGE</label>
                                <textarea 
                                    placeholder="How can we help you?" 
                                    required 
                                    value={queryData.message} 
                                    onChange={(e) => setQueryData({...queryData, message: e.target.value})}
                                ></textarea>
                            </div>
                            <button type="submit" className="hero-book-btn w-full" disabled={loading}>
                                {loading ? 'SENDING...' : 'SUBMIT MESSAGE'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-top">
                    <span className="logo-text font-outfit uppercase">HOTEL <span className="logo-accent">SHUBHA SAI</span></span>
                    <p className="footer-tagline">© 2026 HOTEL SHUBHA SAI. ALL RIGHTS RESERVED.</p>
                    <div className="social-links">
                        <a href="#"><Facebook size={20} /></a>
                        <a href="#"><Instagram size={20} /></a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div className="footer-links font-bold">
                        <Link to="/terms" className="hover:text-primary-400">Terms & Conditions</Link>
                        <a href="#" className="hover:text-primary-400">Privacy Policy</a>
                        <a href="#" className="hover:text-primary-400">Cookies</a>
                    </div>
                    <div className="footer-powered font-bold uppercase tracking-[0.2em] text-[10px] text-gray-500">
                        POWERED BY <span className="text-white">FORGE INDIA CONNECT PVT LTD</span>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            <a 
                href="https://wa.me/919901303998?text=Hi%20Hotel%20Shubha%20Sai!%20I%20have%20an%20inquiry%20regarding%20a%20stay.%20(Expected%20response%20within%2030%20mins)." 
                target="_blank" 
                rel="noopener noreferrer"
                className="whatsapp-float group"
                aria-label="Contact us on WhatsApp"
            >
                <div className="whatsapp-tooltip group-hover:opacity-100 group-hover:translate-x-0">
                    <span className="text-[10px] font-black tracking-widest uppercase">Typically responds in 30 mins</span>
                </div>
                <div className="whatsapp-icon-wrapper">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                </div>
                <div className="whatsapp-pulse"></div>
            </a>

            {/* Integrated Booking Modal */}
            {isBookingModalOpen && selectedRoom && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[5000] flex items-center justify-center p-2 md:p-4 overflow-hidden">
                    <div className="bg-[#111] w-full max-w-4xl md:h-[520px] max-h-[95vh] rounded-[1.2rem] md:rounded-[1.5rem] border border-white/10 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row my-auto">
                        {/* Room Preview Side */}
                        <div className="w-full md:w-5/12 relative h-40 md:h-auto flex-shrink-0">
                            <img src={selectedRoom.img} alt={selectedRoom.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-5 right-5 md:bottom-6 md:left-6 md:right-6">
                                <h2 className="text-xl md:text-2xl font-outfit font-black uppercase italic tracking-tighter">{selectedRoom.name}</h2>
                                <p className="text-[#DCEB8C] font-bold text-[9px] md:text-[10px] mt-1 tracking-[0.2em] opacity-80 uppercase">Reservation Request</p>
                            </div>
                            <button 
                                onClick={() => setIsBookingModalOpen(false)}
                                className="absolute top-6 left-6 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all md:hidden"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Booking Form Side */}
                        <div className="w-full md:w-7/12 p-4 md:p-7 relative">
                            <button 
                                onClick={() => setIsBookingModalOpen(false)}
                                className="absolute top-4 right-4 md:top-8 md:right-8 p-1.5 md:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all hidden md:block"
                            >
                                <X size={20} md:size={24} />
                            </button>

                            <div className="mb-3 md:mb-4">
                                <h3 className="text-base md:text-lg font-outfit font-bold uppercase tracking-widest mb-1 text-white">Booking Details</h3>
                                <p className="text-gray-500 text-[10px] md:text-[11px] leading-tight">Fill in your info to request this room.</p>
                            </div>

                            <form onSubmit={submitBookingForm} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Full Name</label>
                                        <input 
                                            name="guest" value={formData.guest} onChange={handleFormChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-[#DCEB8C]/50 transition-all font-medium" 
                                            placeholder="John Doe" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Mobile Number</label>
                                        <input 
                                            name="phone" value={formData.phone} onChange={handleFormChange} required
                                            maxLength="10"
                                            pattern="\d{10}"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-[#DCEB8C]/50 transition-all font-medium" 
                                            placeholder="10-digit number" 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Alternative Mobile</label>
                                        <input 
                                            name="altPhone" value={formData.altPhone} onChange={handleFormChange}
                                            maxLength="10"
                                            pattern="\d{10}"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-[#DCEB8C]/50 transition-all font-medium" 
                                            placeholder="Optional 10-digit" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">No. of Persons</label>
                                        <input 
                                            type="number" name="adults" value={formData.adults} onChange={handleFormChange} min="1" required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:outline-none focus:border-[#DCEB8C]/50 transition-all font-medium" 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Check-in</label>
                                        <input 
                                            type="date" name="checkin" value={formData.checkin} onChange={handleFormChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#DCEB8C]/50 transition-all [color-scheme:dark] font-medium" 
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Check-out</label>
                                        <input 
                                            type="date" name="checkout" value={formData.checkout} onChange={handleFormChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#DCEB8C]/50 transition-all [color-scheme:dark] font-medium" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="hero-book-btn w-full py-4 rounded-xl text-center text-xs font-black tracking-widest disabled:opacity-50"
                                    >
                                        {loading ? 'PROCESSING...' : 'CONFIRM REQUEST'}
                                    </button>
                                    <p className="text-[8px] text-center text-gray-600 mt-2 uppercase tracking-[0.2em]">* Secure reception payment</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {isConfirmationOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[6000] flex items-center justify-center p-6">
                    <div className="bg-[#111] w-full max-w-md rounded-[3rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-[#DCEB8C] to-purple-500"></div>
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px]"></div>
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
                        
                        <div className="p-10 text-center relative z-10">
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 className="text-green-500 w-10 h-10" />
                            </div>
                            
                            <h2 className="text-3xl font-outfit font-black uppercase italic tracking-tighter mb-6">
                                Reservation <span className="text-green-500">Confirmed</span>
                            </h2>
                            
                            <div className="space-y-6 text-gray-300 leading-relaxed text-sm">
                                <p className="font-medium text-white not-italic tracking-tight text-lg">
                                    Your reservation at <span className="font-bold text-green-500">Hotel Shubha Sai</span> has been received.
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

                            <button 
                                onClick={() => setIsConfirmationOpen(false)} 
                                className="hero-book-btn mt-8 w-full py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-xs"
                            >
                                BACK TO SITE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;

