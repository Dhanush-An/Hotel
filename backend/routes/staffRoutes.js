const express = require('express');
const router = express.Router();
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('admin', 'manager', 'receptionist', 'subadmin'), getStaff);
router.post('/', protect, authorize('admin', 'manager', 'receptionist', 'subadmin'), createStaff);
router.put('/:id', protect, authorize('admin', 'manager', 'receptionist', 'subadmin'), updateStaff);
router.delete('/:id', protect, authorize('admin', 'manager', 'receptionist', 'subadmin'), deleteStaff);

module.exports = router;
