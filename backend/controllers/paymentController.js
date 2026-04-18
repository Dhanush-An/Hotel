const Payment = require('../models/Payment');

const getPayments = async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Payment.find().sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit));
    } else if (!req.query.all) {
      // Default limit to 100 for safety
      query = query.limit(100);
    }

    const payments = await query;
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAllPayments = async (req, res) => {
  try {
    await Payment.deleteMany({});
    res.json({ message: 'All payments deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPayments, createPayment, updatePayment, deletePayment, deleteAllPayments };
