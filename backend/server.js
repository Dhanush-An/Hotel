const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');

dotenv.config();

const connectDB = require('./config/db');


// Connect to database
connectDB();

const app = express();

app.use(compression());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
 app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "HOTEL SHUBHA SAI API is running"
  });
});

// Basic API check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is fully separated and running!' });
});

// Import and use routes
// API Routes (Now Public)
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/queries', require('./routes/queryRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
