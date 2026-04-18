import React, { useState, useEffect } from 'react';
import { Search, Users, Wifi } from 'lucide-react';
import api from '../../services/api';

const ExploreRoomsTab = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        roomType: 'All',
        priceRange: 'All'
    });

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await api.getRooms();
            // User Story Logic: Show only if Available, Clean, and isVisibleToCustomer
            const filtered = response.filter(r => 
                r.status === 'Available' && 
                r.housekeeping === 'Clean' &&
                (r.isVisibleToCustomer === true || r.isVisibleToCustomer === undefined)
            );
            setRooms(filtered);
        } catch (err) {
            console.error('Error fetching rooms:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = rooms.filter(room => {
        if (filters.roomType !== 'All' && room.type !== filters.roomType) return false;
        if (filters.priceRange !== 'All') {
            const price = room.price;
            if (filters.priceRange === 'under-2000' && price > 2000) return false;
            if (filters.priceRange === '2000-5000' && (price < 2000 || price > 5000)) return false;
            if (filters.priceRange === 'above-5000' && price < 5000) return false;
        }
        return true;
    });

    return (
        <div className="explore-rooms-tab">
            <div className="tab-header">
                <div>
                    <h2>Explore Rooms</h2>
                    <p className="text-slate-500 font-medium">Find your perfect stay from our curated collection</p>
                </div>
            </div>

            <div className="rooms-filter-bar">
                <div className="filter-group">
                    <label>Check-in Date</label>
                    <input type="date" className="bg-transparent" />
                </div>
                <div className="filter-group">
                    <label>Check-out Date</label>
                    <input type="date" className="bg-transparent" />
                </div>
                <div className="filter-group">
                    <label>Room Type</label>
                    <select 
                        className="bg-transparent"
                        value={filters.roomType}
                        onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                    >
                        <option value="All">All Types</option>
                        <option value="Junior Suite">Junior Suite</option>
                        <option value="Executive Suite">Executive Suite</option>
                        <option value="Family Suite">Family Suite</option>
                        <option value="Luxury Suite">Luxury Suite</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Price Range</label>
                    <select 
                        className="bg-transparent"
                        value={filters.priceRange}
                        onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                    >
                        <option value="All">All Prices</option>
                        <option value="under-2000">Under ₹2000</option>
                        <option value="2000-5000">₹2000 - ₹5000</option>
                        <option value="above-5000">Above ₹5000</option>
                    </select>
                </div>
                <button className="bg-blue-600 text-white p-3 rounded-xl flex items-center justify-center">
                    <Search size={20} />
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="room-cards-grid">
                    {filteredRooms.map((room) => (
                        <div key={room._id} className="customer-room-card">
                            <div className="room-img-container">
                                <img src={`https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=800`} alt={room.name} />
                                <span className="room-tag">{room.status}</span>
                            </div>
                            <div className="room-content">
                                <div className="room-header">
                                    <div>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">{room.floor} Floor</p>
                                        <h3>{room.type} - {room.roomNumber}</h3>
                                    </div>
                                    <div className="room-price-info">
                                        <span className="room-price-val">₹{room.price}</span>
                                        <span className="room-price-unit">/ night</span>
                                    </div>
                                </div>
                                <div className="room-meta">
                                    <div className="room-meta-item"><Users size={14} /> <span>{room.maxOccupancy} Guests</span></div>
                                    <div className="room-meta-item"><Wifi size={14} /> <span>Free Wifi</span></div>
                                </div>
                                <button className="room-book-now-btn">Book Now</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {!loading && filteredRooms.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-300">
                    <Search size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No rooms available matching your criteria.</p>
                </div>
            )}
        </div>
    );
};

export default ExploreRoomsTab;
