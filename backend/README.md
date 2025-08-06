# Trinity Management System - Backend

This is the backend API for the Trinity Integrated Transport, Garage, Stock, Asset, and Driver Performance Management System.

## Features

- **Asset Register**: Buses, tools, and equipment tracking
- **Inventory Management**: Spare parts and consumables with real-time stock levels
- **Garage Operations**: Job cards, work orders, and parts issuance
- **Driver Performance**: Point-based monitoring system
- **Transport Operations**: Route planning, trip sheets, and bus utilization
- **Package Management**: Tracking and management system

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup:**
   - Ensure MongoDB is running
   - Update MONGODB_URI in .env file

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /` - API status
- More endpoints will be added as we develop

## Database

- **Database Name**: `trinity_management_db`
- **Separate from**: Website database (`trinity_website_db`)

## Port

- **Development**: 5001
- **Production**: Set via PORT environment variable 