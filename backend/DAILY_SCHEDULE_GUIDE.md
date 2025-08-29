# Daily Schedule System Guide

## Overview

The Daily Schedule System bridges the gap between your ticketing system (which has routes and schedules) and your transport operations (which needs to track specific buses and drivers for daily operations).

## Key Features

### 1. **Daily Planning**
- Plan routes for specific dates in advance
- Assign specific buses and drivers to routes
- Set departure times for each route
- Avoid conflicts (same bus/driver on multiple routes same day)

### 2. **Smart Bus Assignment**
- System suggests buses based on:
  - Bus status (active only)
  - Vehicle document validity
  - Capacity requirements
  - Availability (not already assigned)
- Automatic conflict detection

### 3. **Trip Generation**
- Convert daily schedules into actual trips
- Automatic trip number generation
- Link schedules to generated trips

## API Endpoints

### Daily Schedules

#### GET `/api/transport/daily-schedules`
Get all daily schedules with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `date` - Filter by specific date (YYYY-MM-DD)
- `route` - Filter by route ID
- `status` - Filter by status
- `terminal` - Filter by terminal
- `search` - Search in notes

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "data": [
    {
      "_id": "...",
      "date": "2024-01-15T00:00:00.000Z",
      "route": {
        "_id": "...",
        "routeName": "Kampala to Kigali",
        "origin": "Kampala",
        "destination": "Kigali"
      },
      "departureTime": "09:00",
      "assignedVehicle": {
        "_id": "...",
        "plateNumber": "UAB123X",
        "make": "Toyota",
        "model": "Coaster",
        "seatingCapacity": 50
      },
      "assignedDriver": {
        "_id": "...",
        "firstName": "John",
        "lastName": "Driver",
        "employeeId": "DRV001"
      },
      "capacity": 50,
      "status": "planned",
      "terminal": "Main Terminal"
    }
  ]
}
```

#### POST `/api/transport/daily-schedules`
Create a new daily schedule.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "route": "route_id_here",
  "departureTime": "09:00",
  "assignedVehicle": "vehicle_id_here",
  "assignedDriver": "driver_id_here",
  "capacity": 50,
  "terminal": "Main Terminal",
  "notes": "Morning route to Kigali"
}
```

**Validation:**
- Date must be valid ISO date
- Route must be valid MongoDB ID
- Departure time must be HH:MM format
- Vehicle and driver must be valid MongoDB IDs
- Capacity must be at least 1
- Terminal is required

#### PUT `/api/transport/daily-schedules/:id`
Update an existing daily schedule.

**Note:** Cannot modify completed or in-progress schedules.

#### DELETE `/api/transport/daily-schedules/:id`
Delete a daily schedule.

**Note:** Cannot delete completed or in-progress schedules.

### Smart Vehicle Suggestions

#### GET `/api/transport/smart-vehicle-suggestions`
Get smart vehicle suggestions for a specific route and date.

**Query Parameters:**
- `date` - Date for the schedule (required)
- `routeId` - Route ID (required)
- `requiredCapacity` - Minimum capacity needed (required)
- `terminal` - Terminal filter (optional)

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "vehicle_id",
      "plateNumber": "UAB123X",
      "make": "Toyota",
      "model": "Coaster",
      "seatingCapacity": 50,
      "terminal": "Main Terminal",
      "assignedDriver": {
        "_id": "driver_id",
        "firstName": "John",
        "lastName": "Driver",
        "employeeId": "DRV001"
      },
      "score": 0
    }
  ]
}
```

**Scoring System:**
- Lower score = better match
- Score is based on capacity difference from required capacity
- Only active vehicles with valid documents are included
- Already assigned vehicles are excluded

### Trip Generation

#### POST `/api/transport/generate-trips`
Generate trips from confirmed daily schedules for a specific date.

**Request Body:**
```json
{
  "date": "2024-01-15"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated 5 trips",
  "count": 5,
  "data": [
    {
      "_id": "trip_id",
      "tripNumber": "TRP-20240115-001",
      "route": "route_id",
      "vehicle": "vehicle_id",
      "driver": "driver_id",
      "departureTime": "2024-01-15T09:00:00.000Z",
      "arrivalTime": "2024-01-15T18:00:00.000Z",
      "status": "scheduled"
    }
  ]
}
```

## Workflow Example

### 1. **Daily Planning (Day Before)**
```javascript
// Create daily schedule for Kampala to Kigali route
const schedule = await fetch('/api/transport/daily-schedules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-01-15',
    route: 'kampala_kigali_route_id',
    departureTime: '09:00',
    assignedVehicle: 'bus_123_id',
    assignedDriver: 'driver_john_id',
    capacity: 50,
    terminal: 'Main Terminal',
    notes: 'Morning route to Kigali'
  })
});
```

### 2. **Get Smart Vehicle Suggestions**
```javascript
// Get available vehicles for a route
const suggestions = await fetch('/api/transport/smart-vehicle-suggestions?date=2024-01-15&routeId=kampala_kigali_route_id&requiredCapacity=50');
```

### 3. **Confirm Schedule**
```javascript
// Update schedule status to confirmed
await fetch(`/api/transport/daily-schedules/${scheduleId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'confirmed' })
});
```

### 4. **Generate Trips (Day Of)**
```javascript
// Generate actual trips from confirmed schedules
const trips = await fetch('/api/transport/generate-trips', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ date: '2024-01-15' })
});
```

## Data Models

### DailySchedule Schema
```javascript
{
  date: Date,                    // Date for the schedule
  route: ObjectId,               // Reference to Route
  departureTime: String,         // HH:MM format
  assignedVehicle: ObjectId,     // Reference to Vehicle
  assignedDriver: ObjectId,      // Reference to Personnel
  customerCare: ObjectId,        // Reference to Personnel (optional)
  capacity: Number,              // Required capacity
  status: String,                // planned, confirmed, in_progress, completed, cancelled
  tripGenerated: Boolean,        // Whether trip has been generated
  generatedTrip: ObjectId,       // Reference to generated Trip
  notes: String,                 // Additional notes
  terminal: String,              // Terminal name
  createdBy: ObjectId,           // Reference to User
  timestamps: true
}
```

## Conflict Prevention

The system automatically prevents:
- **Vehicle Conflicts**: Same bus assigned to multiple routes on the same date
- **Driver Conflicts**: Same driver assigned to multiple routes on the same date
- **Document Validation**: Only vehicles with valid documents are suggested

## Testing

Run the test file to verify the system works:

```bash
node test-daily-schedules.js
```

This will:
1. Create a test daily schedule
2. Test smart vehicle suggestions
3. Test trip generation
4. Test conflict detection
5. Clean up test data

## Integration Points

- **Routes**: Base route information (origin, destination, duration, fare)
- **Vehicles**: Bus details and capacity
- **Personnel**: Drivers and customer care staff
- **Vehicle Documents**: Document validation for bus selection
- **Trips**: Generated from daily schedules

## Benefits

1. **Better Planning**: Plan routes in advance with specific bus assignments
2. **Conflict Avoidance**: Automatic detection of scheduling conflicts
3. **Smart Assignment**: System suggests optimal buses based on multiple criteria
4. **Document Compliance**: Only suggest vehicles with valid documents
5. **Workflow Integration**: Seamless transition from planning to execution
6. **Audit Trail**: Track who planned what and when
