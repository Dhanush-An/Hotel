const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

const getNotificationSummary = async (req, res) => {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const [checkoutTasks, cleaningRooms, activeTasks] = await Promise.all([
      Booking.find({
        status: { $in: ['Checked In', 'Confirmed'] },
        checkout: today
      }),
      Room.find({
        $or: [{ status: { $in: ['Cleaning', 'Dirty', 'Maintenance'] } }, { housekeeping: 'Dirty' }]
      }, 'roomNumber no status type housekeeping issue'),
      Task.find({
        $or: [{ status: { $ne: 'Completed' } }, { column: { $ne: 'Completed' } }]
      }, 'title staffName assignee column status dept createdAt')
    ]);

    res.json({
      checkoutTasks,
      cleaningRooms,
      activeTasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerStats = async (req, res) => {
  try {
    const bookedCustomers = await Booking.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $toLower: { $ifNull: ["$phone", "$guest"] } },
          name: { $first: "$guest" },
          phone: { $first: { $ifNull: ["$phone", "N/A"] } },
          address: { $first: "$address" },
          idType: { $first: "$idType" },
          idNum: { $first: "$idNum" },
          joinedAt: { $min: "$createdAt" },
          lastVisit: { $max: "$checkout" },
          totalStays: { $sum: 1 },
          totalSpent: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } }
        }
      },
      { $sort: { joinedAt: -1 } }
    ]);

    const registeredUsers = await User.find({ role: 'customer' });
    const customerMap = new Map();
    bookedCustomers.forEach(c => {
      const key = c.phone !== 'N/A' ? c.phone : c._id;
      customerMap.set(key, c);
    });

    registeredUsers.forEach(user => {
      const mobileKey = user.mobile;
      if (customerMap.has(mobileKey)) {
        const existing = customerMap.get(mobileKey);
        existing.name = user.name || existing.name;
      } else {
        customerMap.set(mobileKey, {
          _id: user._id,
          name: user.name,
          phone: user.mobile,
          address: 'N/A',
          idType: 'N/A',
          idNum: 'N/A',
          joinedAt: user.createdAt,
          lastVisit: null,
          totalStays: 0,
          totalSpent: 0
        });
      }
    });

    const finalCustomers = Array.from(customerMap.values()).sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    res.json(finalCustomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const { limit, summary } = req.query;
    let query = Booking.find().sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    } else if (!req.query.all) {
      query = query.limit(100);
    }
    if (summary === 'true') {
      query = query.select('-guestsList');
    }

    const bookings = await query;
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [bookingCounts, roomCounts, bookings] = await Promise.all([
      Booking.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" }
          }
        }
      ]),
      Room.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),
      Booking.find(
        { createdAt: { $gte: twelveMonthsAgo } },
        'status amount checkin source createdAt'
      ).sort({ createdAt: -1 })
    ]);

    res.json({
      bookingCounts,
      roomCounts,
      bookings 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);
    if (booking.status === 'Confirmed' || booking.status === 'Checked In') {
      const roomNum = String(booking.room).split(' - ')[0];
      await Room.findOneAndUpdate({ roomNumber: roomNum }, { status: 'Booked' }, { returnDocument: 'after' });
    }
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = Booking.findByIdAndUpdate(id, req.body, { returnDocument: "after" });
    } else {
      query = Booking.findOneAndUpdate({ id }, req.body, { returnDocument: "after" });
    }

    const booking = await query;
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.status === 'Confirmed' || booking.status === 'Checked In') {
      const roomNum = String(booking.room).split(' - ')[0];
      await Room.findOneAndUpdate({ roomNumber: roomNum }, { status: 'Booked' }, { returnDocument: 'after' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (booking) {
      const roomNum = String(booking.room).split(' - ')[0];
      await Room.findOneAndUpdate({ roomNumber: roomNum }, { status: 'Available' }, { returnDocument: 'after' });
      await Booking.findByIdAndDelete(req.params.id);
    }
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAllBookings = async (req, res) => {
  try {
    await Room.updateMany({}, { status: 'Available' });
    await Booking.deleteMany({});
    res.json({ message: 'All bookings deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBookings, getDashboardStats, getNotificationSummary, getCustomerStats, createBooking, updateBooking, deleteBooking, deleteAllBookings };
