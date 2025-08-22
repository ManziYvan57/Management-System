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
// GARAGE MODULE INTEGRATION - FORCE REDEPLOY - COMMIT garage-fix

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const garageRoutes = require('./routes/garage');
const inventoryRoutes = require('./routes/inventory');
const assetRoutes = require('./routes/assets');
const vehicleRoutes = require('./routes/vehicles');
const equipmentRoutes = require('./routes/equipment');
const personnelRoutes = require('./routes/personnel');
const transportRoutes = require('./routes/transport');
const dashboardRoutes = require('./routes/dashboard');
const vehicleDocumentRoutes = require('./routes/vehicleDocuments');
const supplierRoutes = require('./routes/suppliers');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const stockMovementRoutes = require('./routes/stockMovements');

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

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com', 'http://localhost:3002'] // Allow both production and development
    : ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

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
      garage: '/api/garage',
      inventory: '/api/inventory',
      assets: '/api/assets',
      vehicles: '/api/vehicles',
      equipment: '/api/equipment',
      personnel: '/api/personnel',
      transport: '/api/transport',
      dashboard: '/api/dashboard',
      vehicleDocuments: '/api/vehicle-documents',
      suppliers: '/api/suppliers',
      purchaseOrders: '/api/purchase-orders',
      stockMovements: '/api/stock-movements',
      garage: '/api/garage'
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

// API routes
const apiPrefix = process.env.API_PREFIX || '/api';
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/garage`, garageRoutes);
app.use(`${apiPrefix}/inventory`, inventoryRoutes);
app.use(`${apiPrefix}/assets`, assetRoutes);
app.use(`${apiPrefix}/vehicles`, vehicleRoutes);
app.use(`${apiPrefix}/equipment`, equipmentRoutes);
app.use(`${apiPrefix}/personnel`, personnelRoutes);
app.use(`${apiPrefix}/transport`, transportRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/vehicle-documents`, vehicleDocumentRoutes);
app.use(`${apiPrefix}/suppliers`, supplierRoutes);
app.use(`${apiPrefix}/purchase-orders`, purchaseOrderRoutes);
app.use(`${apiPrefix}/stock-movements`, stockMovementRoutes);
app.use(`${apiPrefix}/garage`, garageRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('🔌 Attempting to connect to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.error('❌ MongoDB URI is not defined. Please check your environment variables.');
      console.error('Required: MONGODB_URI');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB Atlas...');
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`   📍 Host: ${conn.connection.host}`);
    console.log(`   🗄️  Database: ${conn.connection.name}`);
    console.log(`   🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log('🎉 Database connection established and ready!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('   Error:', error.message);
    console.error('   Please check your MongoDB URI and network connection.');
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🚀 Starting Trinity Management System...');
    console.log('='.repeat(60));
    
    // Connect to database
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🎉 Trinity Management System API Started Successfully!');
      console.log('='.repeat(60));
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log(`📚 API Base: http://localhost:${PORT}${apiPrefix}`);
      console.log(`🔐 Auth Endpoint: http://localhost:${PORT}${apiPrefix}/auth`);
      console.log('='.repeat(60));
      console.log('✅ Server is ready to handle requests!');
      console.log('='.repeat(60));
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
