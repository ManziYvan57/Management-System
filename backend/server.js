const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');
require('dotenv').config();

// Trinity Management System Backend - CORS and Rate Limiting Fixed
// VEHICLE DOCUMENTS ROUTES INCLUDED - DEPLOYMENT TEST
// LATEST VERSION - COMMIT f53f07f - AUTH MIDDLEWARE FIXED
// STOCK MOVEMENTS & SUPPLIERS UPDATE - FORCE REDEPLOY - COMMIT c9d0e1f
// GARAGE MODULE INTEGRATION - FORCE REDEPLOY - COMMIT garage-fix - VEHICLE DEBUGGING

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const assetRoutes = require('./routes/assets');
const vehicleRoutes = require('./routes/vehicles');
const dashboardRoutes = require('./routes/dashboard');
const vehicleDocumentRoutes = require('./routes/vehicleDocuments');

// Database connection
const connectDB = require('./config/database');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// Trust proxy for rate limiting (required for Render deployment)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 10000, // Much higher limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return process.env.NODE_ENV === 'development' && 
           (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost'));
  }
});

// CORS configuration - More permissive for development
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 CORS Origin check:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://localhost:3002', 
      'http://localhost:3000',
      'http://localhost:3001',
      'https://trinity-management-system.onrender.com',
      'https://your-frontend-domain.com'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else {
      // For development, allow any localhost origin
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        console.log('✅ Localhost origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('❌ Origin blocked:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'content-type', 'Authorization', 'authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-Terminal', 'x-terminal']
};
app.use(cors(corsOptions));
// Respond to preflight requests explicitly for all routes
app.options('*', cors(corsOptions));
// Apply rate limiting after CORS so preflight gets CORS headers
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 Trinity Management System API is running successfully!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      users: '/api/users',
      assets: '/api/assets',
      vehicles: '/api/vehicles',
      dashboard: '/api/dashboard',
      vehicleDocuments: '/api/vehicle-documents'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Trinity Management System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/assets`, assetRoutes);
app.use(`${apiPrefix}/vehicles`, vehicleRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/vehicle-documents`, vehicleDocumentRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
// Uses shared database configuration which reads MongoDB URI from environment variables.
// Make sure MONGODB_URI (and optionally MONGODB_URI_PROD) are set in your .env or hosting env.

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Starting Trinity Management System...');
    
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log('🎉 Trinity Management System API Started Successfully!');
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed!');
    console.error('   Error:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Unhandled Promise Rejection!');
  console.log(`   Error: ${err.message}`);
  console.log('   Shutting down the server...');
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception!');
  console.log(`   Error: ${err.message}`);
  console.log('   Shutting down the server due to uncaught exception');
  process.exit(1);
});

startServer(); 
