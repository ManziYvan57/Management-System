const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Connected to MongoDB`);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Import routes
const authRoutes = require('./routes/auth');
const busRoutes = require('./routes/buses');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Trinity Management System API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🖥️ API URL: http://localhost:${PORT}`);
    console.log(`🔗 Frontend URL: http://localhost:3002`);
    console.log(`🗂️ Available API Endpoints:`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET /api/auth/profile`);
    console.log(`   GET /api/buses`);
    console.log(`   POST /api/buses`);
    console.log(`   GET /api/buses/:id`);
    console.log(`   PUT /api/buses/:id`);
    console.log(`   DELETE /api/buses/:id`);
    console.log(`   GET /api/buses/stats/overview`);
    console.log(`   GET /api/buses/search`);
  });
};

startServer(); 