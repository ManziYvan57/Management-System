# Trinity Management System - Deployment Guide

## Database Setup

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (free tier is fine)
3. Create a new database called `trinity_management_db`
4. Create a database user with read/write permissions
5. Get your connection string

### 2. Update Environment Variables
In your `.env` file, update:
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/trinity_management_db?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_here
```

## Render.com Setup

### 1. Backend Deployment
1. Go to [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the following:
   - **Name**: `trinity-management-system-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `Trinity_Management_System/backend`

### 2. Environment Variables (Render Dashboard)
Set these in your Render service:
- `NODE_ENV`: `production`
- `PORT`: `5001`
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your secure JWT secret
- `JWT_EXPIRE`: `7d`

### 3. Frontend Deployment (Later)
1. Create another Web Service for the frontend
2. Set the following:
   - **Name**: `trinity-management-system-frontend`
   - **Environment**: Static Site
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `Trinity_Management_System/frontend`

## Local Development

### Backend
```bash
cd Trinity_Management_System/backend
npm install
cp env.example .env
# Edit .env with your values
npm run dev
```

### Frontend
```bash
cd Trinity_Management_System/frontend
npm install
npm run dev
```

## URLs
- **Local Backend**: http://localhost:5001
- **Local Frontend**: http://localhost:3002
- **Production Backend**: https://trinity-management-system-backend.onrender.com
- **Production Frontend**: https://trinity-management-system-frontend.onrender.com

## Important Notes
1. The management system uses a separate database from the website
2. Both systems can run simultaneously on different ports
3. Make sure to set up proper environment variables in Render
4. The frontend will proxy API calls to the backend in development 