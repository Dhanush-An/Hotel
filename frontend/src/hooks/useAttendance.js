import { useState, useCallback } from 'react';
import api from '../services/api';

const HOTEL_LOCATION = { lat: 12.9599, lng: 77.5123 }; // 1301, 2nd Main Rd, Nagarbhavi
const ALLOWED_RADIUS_METERS = 1000; // Radius increased to 1km for better staff access during testing

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
  };

  const checkIn = useCallback(async (role, photo = null) => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        return reject("Not supported");
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const distance = calculateDistance(latitude, longitude, HOTEL_LOCATION.lat, HOTEL_LOCATION.lng);
          const isInside = distance <= ALLOWED_RADIUS_METERS;

          if (!isInside) {
             const distKm = (distance / 1000).toFixed(2);
             setError(`Location mismatch! You are ${distKm}km away from Nagarbhavi Hotel. Attendance restricted to 1km radius.`);
             setLoading(false);
             return resolve({ success: false, message: "Outside Area", distance: distKm });
          }

          const now = new Date();
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const entry = {
            staffId: user.id || user._id || 'Staff',
            staffName: user.name || 'Staff',
            dept: user.role || 'General',
            date: now.toISOString().split('T')[0],
            checkin: now.toLocaleTimeString(),
            status: 'Present',
            location: `Verified (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            photo: photo
          };

          try {
            await api.createAttendance(entry);
            localStorage.setItem('lodgify_isClockedIn', 'true');
            setLoading(false);
            resolve({ success: true, entry, distance: (distance/1000).toFixed(2) });
          } catch (apiError) {
            setError(apiError.message);
            setLoading(false);
            reject(apiError);
          }
        },
        (err) => {
          const msg = err.code === 1 ? "Location permission denied! Please allow access in browser settings." : "GPS Signal weak! Retry in a few seconds.";
          setError(msg);
          setLoading(false);
          reject(err);
        },
        options
      );
    });
  }, []);

  const checkOut = useCallback(async () => {
    setLoading(true);
    const now = new Date();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const date = now.toISOString().split('T')[0];
    
    try {
      const logs = await api.getAttendance();
      const userToday = logs.find(l => (l.staffId === user.id || l.staffId === user._id) && l.date === date && !l.checkout);
      
      if (userToday) {
        await api.updateAttendance(userToday._id, { checkout: now.toLocaleTimeString() });
      }
      
      localStorage.setItem('lodgify_isClockedIn', 'false');
      setLoading(false);
      return { success: true };
    } catch (error) {
      setError(error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  }, []);

  return { checkIn, checkOut, loading, error };
};
