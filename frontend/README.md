# Trinity Management System - Frontend

This is the frontend application for the Trinity Integrated Transport, Garage, Stock, Asset, and Driver Performance Management System.

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

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Development

- **Port**: 3002
- **Backend Proxy**: `/api` routes are proxied to `http://localhost:5001`
- **Framework**: React 18 with Vite
- **Styling**: CSS with modern features

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API services
├── styles/        # CSS files
└── utils/         # Utility functions
``` 