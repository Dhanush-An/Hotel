const express = require('express');
const router = express.Router();
const { getAttendance, createAttendance, updateAttendance } = require('../controllers/attendanceController');

router.get('/', getAttendance);
router.post('/', createAttendance);
router.put('/:id', updateAttendance);

module.exports = router;
