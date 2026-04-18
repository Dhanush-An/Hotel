const express = require('express');
const router = express.Router();
const { getBookings, getDashboardStats, getNotificationSummary, getCustomerStats, createBooking, updateBooking, deleteBooking, deleteAllBookings } = require('../controllers/bookingController');

router.get('/', getBookings);
router.get('/stats', getDashboardStats);
router.get('/customers', getCustomerStats);
router.get('/notifications', getNotificationSummary);
router.post('/', createBooking);
router.delete('/', deleteAllBookings);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

module.exports = router;
