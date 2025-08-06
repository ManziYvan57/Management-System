# Trinity Management System

**Integrated Transport, Garage, Stock, Asset, and Driver Performance Management System**

## Overview

This is a comprehensive management system for Trinity Transporter and Distributors Co Ltd, designed to digitize and integrate all operational processes including transport operations, garage management, inventory control, asset tracking, and driver performance monitoring.

## System Modules

### 1. Asset Register
- Bus fleet management
- Tools and equipment tracking
- Asset condition monitoring
- Maintenance history

### 2. Inventory Management
- Spare parts tracking
- Consumables management
- Real-time stock levels
- Reorder alerts

### 3. Garage Operations
- Job cards and work orders
- Parts issuance tracking
- Maintenance scheduling
- Cost tracking

### 4. Driver Performance
- Point-based monitoring system (100 points base)
- Infraction tracking
- Performance analytics
- Safety metrics

### 5. Transport Operations
- Route planning
- Trip sheets
- Bus utilization reports
- Schedule management

### 6. Package Management
- Package tracking
- Status updates
- Customer notifications
- Delivery management

## Project Structure

```
Trinity_Management_System/
├── backend/           # Express.js API server
│   ├── config/       # Configuration files
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── middleware/   # Custom middleware
└── frontend/         # React application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── services/    # API services
    │   ├── styles/      # CSS files
    │   └── utils/       # Utility functions
    └── public/          # Static assets
```

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Express Validator** for input validation

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **React Icons** for UI icons
- **Recharts** for data visualization

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Git

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Database

- **Database Name**: `trinity_management_db`
- **Separate from**: Website database (`trinity_website_db`)
- **Connection**: MongoDB Atlas or local MongoDB

## Ports

- **Backend**: 5001
- **Frontend**: 3002
- **Production**: Set via environment variables

## Deployment

The system is designed to be deployed on Render.com alongside the existing website, with separate services for backend and frontend.

## Development Phases

1. **Phase 1**: Foundation and authentication ✅
2. **Phase 2**: Asset Register
3. **Phase 3**: Driver Performance
4. **Phase 4**: Transport Operations
5. **Phase 5**: Inventory Management
6. **Phase 6**: Garage Operations
7. **Phase 7**: Package Management
8. **Phase 8**: Analytics & Reporting

## License

ISC License - Trinity Transporter and Distributors Co Ltd 