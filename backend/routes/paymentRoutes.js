const express = require('express');
const router = express.Router();
const { getPayments, createPayment, updatePayment, deletePayment, deleteAllPayments } = require('../controllers/paymentController');

router.get('/', getPayments);
router.post('/', createPayment);
router.delete('/', deleteAllPayments);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment);

module.exports = router;
