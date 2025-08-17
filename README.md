# 🚀 Trinity Management System

A comprehensive **Integrated Transport, Garage, Stock, Asset, and Driver Performance Management System** built with modern web technologies.

## 📋 **System Overview**

Trinity Management System is a full-stack web application designed for managing transport operations, garage maintenance, inventory control, asset tracking, and personnel management. The system provides real-time data persistence, role-based access control, and multi-terminal support.

## 🏗️ **Architecture**

### **Frontend**
- **React.js** - Modern UI framework
- **React Router** - Client-side routing
- **React Icons** - Icon library
- **CSS3** - Styling and animations
- **Local Storage** - Client-side data caching

### **Backend**
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication & authorization
- **bcryptjs** - Password hashing

### **Deployment**
- **Render.com** - Cloud hosting platform
- **MongoDB Atlas** - Cloud database
- **GitHub** - Version control & CI/CD

## 🎯 **Core Modules**

### **1. Dashboard** 📊
- **Overview Statistics** - Cross-module insights
- **Financial Analytics** - Revenue, expenses, profit tracking
- **Operations Monitoring** - Trip performance, vehicle utilization
- **Maintenance Tracking** - Work orders, scheduled maintenance
- **Real-time Updates** - Live data refresh

### **2. Assets Management** 🚗
- **Vehicle Registration** - Complete asset profiles
- **Asset Tracking** - Location, status, maintenance history
- **Financial Management** - Purchase cost, depreciation, current value
- **Document Management** - Registration, insurance, permits
- **Performance Analytics** - Utilization metrics, ROI tracking

### **3. Garage Management** 🔧
- **Work Orders** - Create, track, and manage maintenance tasks
- **Maintenance Scheduling** - Preventive maintenance planning
- **Parts Management** - Integration with inventory system
- **Cost Tracking** - Labor and parts cost analysis
- **Technician Management** - Assignment and performance tracking

### **4. Inventory Management** 📦
- **Stock Control** - Real-time inventory tracking
- **Purchase Orders** - Automated reordering system
- **Supplier Management** - Vendor profiles and performance
- **Stock Movements** - Usage tracking and audit trails
- **Financial Analytics** - Spending analysis and cost optimization

### **5. Personnel Management** 👥
- **Employee Profiles** - Complete staff information
- **Role Management** - Position and responsibility tracking
- **Performance Monitoring** - KPI tracking and evaluations
- **Leave Management** - Time-off tracking and scheduling
- **Training Records** - Certification and skill tracking

### **6. Transport Operations** 🚌
- **Route Management** - Route planning and optimization
- **Trip Scheduling** - Real-time trip management
- **Live Display** - Airport-style departure board
- **Status Tracking** - Real-time vehicle and trip status
- **Performance Analytics** - On-time performance, occupancy rates

### **7. User Management** 👤
- **Role-Based Access Control** - Granular permissions
- **Terminal-Based Access** - Multi-location support
- **Auto-Generated Passwords** - Secure user onboarding
- **Password Change Enforcement** - Security compliance
- **Session Management** - Secure authentication

## 🔐 **Security Features**

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Granular permissions
- **Password Hashing** - bcryptjs encryption
- **Rate Limiting** - API protection
- **CORS Configuration** - Cross-origin security
- **Input Validation** - Data sanitization
- **Error Handling** - Secure error responses

## 🌍 **Multi-Terminal Support**

The system supports multiple terminals across different countries:
- **Kigali Terminal** (Rwanda)
- **Kampala Terminal** (Uganda) 
- **Nairobi Terminal** (Kenya)
- **Juba Terminal** (South Sudan)

Each terminal has:
- **Isolated Data** - Terminal-specific information
- **Local Management** - Terminal-based user roles
- **Cross-Terminal Access** - Super admin capabilities

## 👥 **User Roles & Permissions**

### **Super Admin**
- Full system access
- Cross-terminal management
- User creation and management
- System configuration

### **Terminal Manager**
- Terminal-specific data access
- Personnel management
- Financial oversight
- Operational reporting

### **Route Manager**
- Route and trip management
- Driver assignment
- Performance monitoring
- Schedule optimization

### **Fleet Manager**
- Vehicle and asset management
- Maintenance coordination
- Cost tracking
- Fleet optimization

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### **Backend Setup**
```bash
cd backend
npm install
cp env.example .env
# Configure your .env file with MongoDB URI and other settings
npm start
```

### **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### **Environment Variables**
```env
# Backend (.env)
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

## 📊 **Database Schema**

### **Users Collection**
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: ['super_admin', 'terminal_manager', 'route_manager', 'fleet_manager'],
  terminal: ['kigali', 'kampala', 'nairobi', 'juba'],
  department: String,
  permissions: Object,
  isActive: Boolean,
  lastLogin: Date
}
```

### **Assets Collection**
```javascript
{
  name: String,
  type: String,
  plateNumber: String,
  purchaseCost: Number,
  currentValue: Number,
  status: ['active', 'maintenance', 'retired'],
  terminal: String,
  assignedTo: String,
  maintenanceHistory: Array,
  documents: Array
}
```

### **Work Orders Collection**
```javascript
{
  title: String,
  description: String,
  vehicleId: String,
  assignedTo: String,
  priority: ['low', 'medium', 'high'],
  status: ['pending', 'in-progress', 'completed'],
  estimatedCost: Number,
  actualCost: Number,
  startDate: Date,
  completionDate: Date,
  terminal: String
}
```

## 🔧 **API Endpoints**

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### **Assets**
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/stats` - Asset statistics

### **Garage**
- `GET /api/garage/work-orders` - Get work orders
- `POST /api/garage/work-orders` - Create work order
- `GET /api/garage/stats` - Garage statistics

### **Inventory**
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/stats` - Inventory statistics

### **Personnel**
- `GET /api/personnel` - Get personnel
- `POST /api/personnel` - Create personnel
- `GET /api/personnel/stats` - Personnel statistics

### **Transport**
- `GET /api/transport/routes` - Get routes
- `GET /api/transport/trips` - Get trips
- `POST /api/transport/trips` - Create trip
- `GET /api/transport/stats` - Transport statistics

### **Dashboard**
- `GET /api/dashboard/overview` - Overview statistics
- `GET /api/dashboard/financial` - Financial data
- `GET /api/dashboard/operations` - Operations data
- `GET /api/dashboard/maintenance` - Maintenance data

## 🎨 **UI/UX Features**

### **Design System**
- **Consistent Styling** - Unified color scheme and typography
- **Responsive Design** - Mobile-first approach
- **Modern Interface** - Clean, professional appearance
- **Accessibility** - WCAG compliant design

### **Interactive Elements**
- **Real-time Updates** - Live data refresh
- **Loading States** - User feedback during operations
- **Error Handling** - Graceful error display
- **Success Notifications** - Operation confirmation

### **Data Visualization**
- **Charts & Graphs** - Performance metrics
- **Status Indicators** - Visual status representation
- **Progress Bars** - Task completion tracking
- **Color Coding** - Priority and status indication

## 🔄 **Data Persistence**

### **Real-time Synchronization**
- **API Integration** - All modules connected to backend
- **Automatic Refresh** - Data updates across sessions
- **Cross-module Integration** - Shared data between modules
- **Offline Support** - Local storage caching

### **Data Flow**
1. **User Action** → Frontend validation
2. **API Request** → Backend processing
3. **Database Update** → MongoDB storage
4. **Response** → Frontend update
5. **UI Refresh** → Real-time display

## 🚀 **Deployment**

### **Backend Deployment (Render.com)**
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Deploy

### **Frontend Deployment (Render.com)**
1. Connect GitHub repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Set static publish directory: `dist`
5. Deploy

## 📈 **Performance Optimization**

### **Frontend**
- **Code Splitting** - Lazy loading of components
- **Memoization** - React.memo and useMemo
- **Bundle Optimization** - Tree shaking and minification
- **Caching** - Local storage and service workers

### **Backend**
- **Database Indexing** - Optimized queries
- **Connection Pooling** - Efficient database connections
- **Caching** - Redis integration (future)
- **Compression** - Response compression

## 🔮 **Future Enhancements**

### **Planned Features**
- **Mobile App** - React Native application
- **Real-time Notifications** - WebSocket integration
- **Advanced Analytics** - Machine learning insights
- **API Documentation** - Swagger/OpenAPI
- **Multi-language Support** - Internationalization
- **Advanced Reporting** - Custom report builder

### **Technical Improvements**
- **Microservices Architecture** - Service decomposition
- **Event Sourcing** - Audit trail and history
- **GraphQL API** - Flexible data querying
- **Docker Containerization** - Consistent deployment
- **CI/CD Pipeline** - Automated testing and deployment

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 **Support**

For support and questions:
- **Email**: support@trinity.com
- **Documentation**: [Wiki](https://github.com/trinity/management-system/wiki)
- **Issues**: [GitHub Issues](https://github.com/trinity/management-system/issues)

---

**Built with ❤️ by the Trinity Development Team** 