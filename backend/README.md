# Trinity Management System - Backend API

A comprehensive backend API for the Trinity Integrated Transport, Garage, Stock, Asset, and Driver Performance Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user CRUD operations with permissions
- **Security**: Rate limiting, input validation, XSS protection, MongoDB injection protection
- **Modular Architecture**: Separate routes for each module (Garage, Inventory, Assets, Personnel, Transport)
- **Dashboard API**: Comprehensive statistics and overview endpoints
- **Production Ready**: Optimized for deployment on Render.com

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trinity-management-system-repo/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/trinity_management_system
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=30d
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user (Admin only)
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "garage_staff",
  "department": "garage"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

#### GET `/api/auth/me`
Get current user profile

#### PUT `/api/auth/profile`
Update user profile
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

#### PUT `/api/auth/change-password`
Change password
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### User Management Endpoints

#### GET `/api/users`
Get all users (Admin only)
- Query params: `page`, `limit`, `search`, `role`, `department`, `isActive`

#### GET `/api/users/:id`
Get single user (Admin only)

#### PUT `/api/users/:id`
Update user (Admin only)

#### DELETE `/api/users/:id`
Delete user (Super Admin only)

#### GET `/api/users/stats/overview`
Get user statistics (Admin only)

### Module Endpoints

#### Garage
- `GET /api/garage/work-orders` - Get all work orders
- `POST /api/garage/work-orders` - Create work order
- `GET /api/garage/stats` - Get garage statistics

#### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/stats` - Get inventory statistics

#### Assets
- `GET /api/assets` - Get all assets
- `GET /api/assets/stats` - Get assets statistics

#### Personnel
- `GET /api/personnel` - Get all personnel
- `GET /api/personnel/stats` - Get personnel statistics

#### Transport
- `GET /api/transport/routes` - Get all transport routes
- `GET /api/transport/stats` - Get transport statistics

### Dashboard Endpoints

#### GET `/api/dashboard/overview`
Get dashboard overview with key metrics

#### GET `/api/dashboard/financial`
Get financial overview

#### GET `/api/dashboard/operations`
Get operations overview

#### GET `/api/dashboard/maintenance`
Get maintenance overview

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **super_admin**: Full system access
- **admin**: Administrative access (no user deletion)
- **garage_staff**: Garage operations
- **transport_staff**: Transport operations
- **inventory_staff**: Inventory management
- **driver**: Limited access for drivers
- **customer_care**: Customer service access

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling middleware
│   └── notFound.js          # 404 handler
├── models/
│   └── User.js              # User model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── garage.js            # Garage routes
│   ├── inventory.js         # Inventory routes
│   ├── assets.js            # Assets routes
│   ├── personnel.js         # Personnel routes
│   ├── transport.js         # Transport routes
│   └── dashboard.js         # Dashboard routes
├── uploads/                 # File uploads directory
├── .env                     # Environment variables
├── package.json             # Dependencies
├── server.js                # Main server file
└── README.md               # This file
```

## 🚀 Deployment

### Render.com Deployment

1. **Connect Repository**
   - Connect your GitHub repository to Render.com
   - Select the backend directory as the root

2. **Environment Variables**
   Set the following environment variables in Render:
   - `NODE_ENV`: production
   - `MONGODB_URI_PROD`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `CORS_ORIGIN_PROD`: Your frontend URL

3. **Deploy**
   - Render will automatically deploy on push to main branch
   - Health check endpoint: `/health`

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 🔧 Development

### Adding New Routes

1. Create route file in `routes/` directory
2. Import and use in `server.js`
3. Add authentication middleware as needed

### Adding New Models

1. Create model file in `models/` directory
2. Define schema and methods
3. Export the model

### Error Handling

The API uses centralized error handling:
- Validation errors return 400 status
- Authentication errors return 401 status
- Authorization errors return 403 status
- Not found errors return 404 status
- Server errors return 500 status

## 📊 Health Check

The API includes a health check endpoint:
```
GET /health
```

Returns:
```json
{
  "status": "success",
  "message": "Trinity Management System API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for all inputs
- **XSS Protection**: xss-clean middleware
- **MongoDB Injection Protection**: express-mongo-sanitize
- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **JWT**: Secure token-based authentication

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.

---

**Trinity Transporter and Distributors Co Ltd** - Management System Backend API 