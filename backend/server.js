require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));
app.use('/api/memberships', require('./routes/membershipRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/diet-plans', require('./routes/dietRoutes'));
app.use('/api/diets', require('./routes/dietRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/bmi', require('./routes/bmiRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Server error'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/gym-management';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
})();