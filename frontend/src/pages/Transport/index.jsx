import React, { useState, useEffect, useMemo } from 'react';
import { FaClock, FaRoute, FaBus, FaUserTie, FaUsers } from 'react-icons/fa';
import { vehiclesAPI, personnelAPI, transportAPI } from '../../services/api';
import './Transport.css';

const Transport = () => {
  // Hardcoded routes for testing
  const hardcodedRoutes = [
    {
      _id: '507f1f77bcf86cd799439011',
      routeName: 'Kigali -> Kampala',
      origin: 'Kigali',
      destination: 'Kampala',
      departureTime: '09:00'
    },
    {
      _id: '507f1f77bcf86cd799439012',
      routeName: 'Kigali -> Nairobi',
      origin: 'Kigali',
      destination: 'Nairobi',
      departureTime: '07:00'
    }
  ];

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Daily Schedule Form State
  const [showDailyScheduleForm, setShowDailyScheduleForm] = useState(false);
  const [newDailySchedule, setNewDailySchedule] = useState({
    date: '',
    route: '',
    departureTime: '',
    assignedVehicle: '',
    assignedDriver: '',
    customerCare: '',
    capacity: '',
    notes: ''
  });
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableCustomerCare, setAvailableCustomerCare] = useState([]);

  // Live Display Mode - Keeping this as requested
  const [showLiveDisplay, setShowLiveDisplay] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch routes using test endpoint
        try {
          console.log('🔍 Fetching routes...');
          const response = await fetch('https://trinity-management-system.onrender.com/api/transport/test-routes');
          console.log('📡 Routes response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const routesData = await response.json();
          console.log('📊 Routes data:', routesData);
          setRoutes(routesData.data || []);
        } catch (routeErr) {
          console.error('❌ Error fetching routes:', routeErr);
          setRoutes([]);
        }
      } catch (err) {
        console.error('Error fetching transport data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available resources
  useEffect(() => {
    const fetchAvailableResources = async () => {
      try {
        console.log('🔍 Fetching available resources...');
        
        // Fetch vehicles
        const vehiclesResponse = await vehiclesAPI.getAll();
        console.log('🚗 Vehicles response:', vehiclesResponse);
        setAvailableVehicles(vehiclesResponse.data || []);
        
        // Fetch personnel (drivers and customer care)
        const personnelResponse = await personnelAPI.getAll();
        console.log('👥 Personnel response:', personnelResponse);
        
        if (personnelResponse.data && Array.isArray(personnelResponse.data)) {
          const drivers = personnelResponse.data.filter(p => p.role === 'driver');
          const customerCare = personnelResponse.data.filter(p => p.role === 'customer_care');
          
          setAvailableDrivers(drivers);
          setAvailableCustomerCare(customerCare);
          
          console.log('🚗 Available drivers:', drivers.length);
          console.log('👥 Available customer care:', customerCare.length);
        }
      } catch (err) {
        console.error('Error fetching available resources:', err);
      }
    };

    fetchAvailableResources();
  }, []);

  // Handle daily schedule input changes
  const handleDailyScheduleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'route') {
      // Auto-fill departure time when route is selected
      const selectedRoute = hardcodedRoutes.find(route => route._id === value);
      if (selectedRoute) {
        setNewDailySchedule(prev => ({
          ...prev,
          route: value,
          departureTime: selectedRoute.departureTime // Auto-fill departure time
        }));
      } else {
        setNewDailySchedule(prev => ({
          ...prev,
          route: value
        }));
      }
    } else if (name === 'assignedVehicle') {
      // Auto-fill capacity when vehicle is selected
      const selectedVehicle = availableVehicles.find(vehicle => vehicle._id === value);
      if (selectedVehicle) {
        setNewDailySchedule(prev => ({
          ...prev,
          assignedVehicle: value,
          capacity: selectedVehicle.seatingCapacity || selectedVehicle.capacity || '' // Auto-fill capacity
        }));
      } else {
        setNewDailySchedule(prev => ({
          ...prev,
          assignedVehicle: value
        }));
      }
    } else {
      setNewDailySchedule(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle daily schedule submission
  const handleDailyScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const scheduleData = {
        ...newDailySchedule,
        capacity: parseInt(newDailySchedule.capacity)
      };
      
      console.log('🔍 Submitting daily schedule:', scheduleData);
      console.log('🔍 User info from context:', { 
        role: 'super_admin' // This should come from your auth context
      });
      
      await transportAPI.createDailySchedule(scheduleData);
      
      // Reset form and close modal
      setNewDailySchedule({
        date: '',
        route: '',
        departureTime: '',
        assignedVehicle: '',
        assignedDriver: '',
        customerCare: '',
        capacity: '',
        notes: ''
      });
      setShowDailyScheduleForm(false);
      
      alert('Daily schedule created successfully!');
    } catch (err) {
      console.error('Error creating daily schedule:', err);
      alert('Failed to create daily schedule: ' + err.message);
    }
  };

  // Dashboard Statistics - Made reactive to state changes
  const dashboardStats = useMemo(() => {
    if (!routes || !Array.isArray(routes)) {
      return {
        totalRoutes: 0,
        totalVehicles: 0,
        activeTrips: 0,
        scheduledTrips: 0,
        departedTrips: 0,
        boardingTrips: 0,
        readyTrips: 0,
        totalPersonnel: 0
      };
    }
    
    const totalRoutes = routes.length;
    const totalVehicles = routes.reduce((sum, route) => sum + ((route.vehicles && Array.isArray(route.vehicles)) ? route.vehicles.length : 0), 0);
    
    // Count trips by status
    const tripsByStatus = routes.reduce((acc, route) => {
      if (route.vehicles && Array.isArray(route.vehicles)) {
        route.vehicles.forEach(vehicle => {
          if (vehicle && vehicle.status) {
            acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
          }
        });
      }
      return acc;
    }, {});
    
    const activeTrips = tripsByStatus['active'] || 0;
    const scheduledTrips = tripsByStatus['scheduled'] || 0;
    const departedTrips = tripsByStatus['departed'] || 0;
    const boardingTrips = tripsByStatus['boarding'] || 0;
    const readyTrips = tripsByStatus['ready'] || 0;
    
    // Calculate total personnel more accurately
    const totalPersonnel = routes.reduce((sum, route) => {
      const drivers = (route.vehicles && Array.isArray(route.vehicles)) ? route.vehicles.length : 0;
      const customerCare = (route.vehicles && Array.isArray(route.vehicles)) ? route.vehicles.filter(v => v && v.customerCare && v.customerCare.trim() !== '').length : 0;
      const reserves = ((route.reserveDrivers && Array.isArray(route.reserveDrivers)) ? route.reserveDrivers.length : 0) + 
                      ((route.reserveCCs && Array.isArray(route.reserveCCs)) ? route.reserveCCs.length : 0);
      return sum + drivers + customerCare + reserves;
    }, 0);
    
    return {
      totalRoutes,
      totalVehicles,
      activeTrips,
      scheduledTrips,
      departedTrips,
      boardingTrips,
      readyTrips,
      totalPersonnel
    };
  }, [routes]); // This will recalculate whenever routes change

  // Auto-update status based on time
  useEffect(() => {
    const updateVehicleStatuses = () => {
      if (!routes || !Array.isArray(routes)) return;
      
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;
      
      const updatedRoutes = routes.map(route => {
        if (!route.vehicles || !Array.isArray(route.vehicles)) return route;
        
        const updatedVehicles = route.vehicles.map(vehicle => {
          if (!vehicle || !vehicle.departure) return vehicle;
          
          const [departureHour, departureMinute] = vehicle.departure.split(':').map(Number);
          const departureTime = departureHour * 60 + departureMinute;
          
          let newStatus = vehicle.status;
          
          if (currentTime < departureTime - 30) {
            newStatus = 'scheduled';
          } else if (currentTime >= departureTime - 30 && currentTime < departureTime - 15) {
            newStatus = 'ready';
          } else if (currentTime >= departureTime - 15 && currentTime < departureTime) {
            newStatus = 'boarding';
          } else if (currentTime >= departureTime && currentTime < departureTime + 120) {
            newStatus = 'departed';
          } else {
            newStatus = 'completed';
          }
          
          return { ...vehicle, status: newStatus };
        });
        
        return { ...route, vehicles: updatedVehicles };
      });
      
      setRoutes(updatedRoutes);
    };

    updateVehicleStatuses();
    
    if (autoUpdate) {
      const interval = setInterval(updateVehicleStatuses, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [autoUpdate]); // Removed routes dependency to prevent infinite loop

  // Auto-scroll live display every 5 seconds
  useEffect(() => {
    if (showLiveDisplay && routes && Array.isArray(routes)) {
      const scrollInterval = setInterval(() => {
        setCurrentDisplayIndex(prevIndex => {
          const totalTrips = routes.reduce((sum, route) => sum + (route.vehicles ? route.vehicles.length : 0), 0);
          const nextIndex = prevIndex + 8;
          return nextIndex >= totalTrips ? 0 : nextIndex;
        });
      }, 5000); // Change every 5 seconds
      
      return () => clearInterval(scrollInterval);
    }
  }, [showLiveDisplay, routes]);

  // Update current time every second
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  return (
    <div className="transport-container">
      <div className="page-header">
        <h2>Transport Operations</h2>
        <div className="real-time-clock">
          <FaClock className="clock-icon" />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Mini Dashboard */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{dashboardStats.totalRoutes}</h3>
          <p>Active Routes</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardStats.totalVehicles}</h3>
          <p>Total Vehicles</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardStats.scheduledTrips + dashboardStats.readyTrips + dashboardStats.boardingTrips + dashboardStats.departedTrips}</h3>
          <p>Today's Trips</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardStats.totalPersonnel}</h3>
          <p>Total Personnel</p>
        </div>
      </div>

      {/* Quick Actions - Starting with just Plan Daily Schedule */}
      <div className="quick-actions">
        <button onClick={() => setShowDailyScheduleForm(true)} className="action-btn">
          📅 Plan Daily Schedule
        </button>
        <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
          🚧 More actions coming soon! 🚧
        </p>
      </div>

      {/* Debug Info */}
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
        <h4>Debug Info:</h4>
        <p><strong>Available Vehicles:</strong> {availableVehicles && Array.isArray(availableVehicles) ? availableVehicles.length : 0}</p>
        <p><strong>Available Drivers:</strong> {availableDrivers && Array.isArray(availableDrivers) ? availableDrivers.length : 0}</p>
        <details>
          <summary>Vehicles Data</summary>
          <pre>{JSON.stringify((availableVehicles && Array.isArray(availableVehicles)) ? availableVehicles.slice(0, 3) : [], null, 2)}</pre>
        </details>
        <details>
          <summary>Drivers Data</summary>
          <pre>{JSON.stringify((availableDrivers && Array.isArray(availableDrivers)) ? availableDrivers.slice(0, 3) : [], null, 2)}</pre>
        </details>
      </div>

      {/* Live Display */}
      {showLiveDisplay && (
        <div className="live-display">
          <div className="live-header">
            <h3>Live Departure Board</h3>
            <span className="live-time">{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="live-table">
            <table>
              <thead>
                <tr>
                  <th>BUS PLATE</th>
                  <th>ROUTE</th>
                  <th>DEPARTURE TIME</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {routes && Array.isArray(routes) && routes.slice(currentDisplayIndex, currentDisplayIndex + 8).map((route) => (
                  route.vehicles && Array.isArray(route.vehicles) && route.vehicles.map((vehicle) => (
                    <tr key={vehicle.id || vehicle._id || Math.random()} className={`live-row ${vehicle.status || 'scheduled'}`}>
                      <td>
                        <div className="plate-cell">
                          <FaBus className="vehicle-icon" />
                          <strong>{vehicle.plate || 'N/A'}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="route-cell">
                          <FaRoute className="route-icon" />
                          {route.name || 'Unknown Route'}
                        </div>
                      </td>
                      <td>
                        <div className="time-cell">
                          <FaClock className="time-icon" />
                          <strong>{vehicle.departure || 'N/A'}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <span className={`live-status ${vehicle.status || 'scheduled'}`}>
                            {(vehicle.status || 'scheduled').toUpperCase()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
                {(!routes || !Array.isArray(routes) || routes.length === 0) && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No upcoming departures at this time
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transport List */}
      <div className="transport-list">
        <div className="list-header">
          <h3>Transport Operations</h3>
        </div>
        
        <div className="table-container">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading transport data...</p>
            </div>
          )}
          
          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
            </div>
          )}
          
          {!loading && !error && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Customer Care</th>
                    <th>Departure</th>
                    <th>Team Leader</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const trips = routes && Array.isArray(routes) ? routes.map(route => 
                      route.vehicles && Array.isArray(route.vehicles) ? route.vehicles.map(vehicle => ({
                        ...vehicle,
                        routeName: route.name || 'Unknown Route',
                        teamLeader: route.teamLeader || 'N/A'
                      })) : []
                    ).flat().filter(trip => trip && trip.routeName) : [];
                    
                    return trips.length > 0 ? trips.map((trip) => (
                    <tr key={trip.id}>
                      <td>
                        <div className="route-info">
                          <FaRoute className="route-icon" />
                          {trip.routeName}
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-info">
                          <FaBus className="vehicle-icon" />
                          {trip.plate}
                        </div>
                      </td>
                      <td>
                        <div className="driver-info">
                          <FaUserTie className="driver-icon" />
                          {trip.driver}
                        </div>
                      </td>
                      <td>
                        <div className="customer-care-info">
                          <FaUsers className="cc-icon" />
                          {trip.customerCare || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <div className="departure-info">
                          <FaClock className="time-icon" />
                          {trip.departure}
                        </div>
                      </td>
                      <td>{trip.teamLeader}</td>
                      <td>
                        <span className={`status-badge ${trip.status}`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        No transport data available
                      </td>
                    </tr>
                  );
                  })()}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Daily Schedule Form Modal */}
      {showDailyScheduleForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Plan Daily Schedule</h3>
              <button onClick={() => setShowDailyScheduleForm(false)} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleDailyScheduleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="scheduleDate">Date:</label>
                  <input
                    type="date"
                    id="scheduleDate"
                    name="date"
                    value={newDailySchedule.date}
                    onChange={handleDailyScheduleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="scheduleRoute">Route:</label>
                  <select
                    id="scheduleRoute"
                    name="route"
                    value={newDailySchedule.route}
                    onChange={handleDailyScheduleChange}
                    required
                  >
                    <option value="">Select Route</option>
                    {hardcodedRoutes.map(route => (
                      <option key={route._id} value={route._id}>
                        {route.routeName} (Departure: {route.departureTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departureTime">Departure Time:</label>
                  <input
                    type="time"
                    id="departureTime"
                    name="departureTime"
                    value={newDailySchedule.departureTime}
                    onChange={handleDailyScheduleChange}
                    required
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>
                    Auto-filled based on selected route
                  </small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="capacity">Capacity:</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={newDailySchedule.capacity}
                    onChange={handleDailyScheduleChange}
                    min="1"
                    placeholder="Auto-filled from vehicle"
                    required
                    readOnly
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '12px' }}>
                    Auto-filled based on selected vehicle
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedVehicle">Vehicle:</label>
                  <select
                    id="assignedVehicle"
                    name="assignedVehicle"
                    value={newDailySchedule.assignedVehicle}
                    onChange={handleDailyScheduleChange}
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {availableVehicles && Array.isArray(availableVehicles) && availableVehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.plateNumber || 'Unknown'} - {vehicle.make || 'Unknown'} {vehicle.model || 'Unknown'} ({vehicle.seatingCapacity || vehicle.capacity || 'N/A'} seats)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="assignedDriver">Driver:</label>
                  <select
                    id="assignedDriver"
                    name="assignedDriver"
                    value={newDailySchedule.assignedDriver}
                    onChange={handleDailyScheduleChange}
                    required
                  >
                    <option value="">Select Driver</option>
                    {availableDrivers && Array.isArray(availableDrivers) && availableDrivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.firstName || 'Unknown'} {driver.lastName || 'Unknown'} ({driver.employeeId || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customerCare">Customer Care:</label>
                  <select
                    id="customerCare"
                    name="customerCare"
                    value={newDailySchedule.customerCare}
                    onChange={handleDailyScheduleChange}
                  >
                    <option value="">Select Customer Care</option>
                    {availableCustomerCare && Array.isArray(availableCustomerCare) && availableCustomerCare.map(cc => (
                      <option key={cc._id} value={cc._id}>
                        {cc.firstName || 'Unknown'} {cc.lastName || 'Unknown'} ({cc.employeeId || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes:</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={newDailySchedule.notes}
                    onChange={handleDailyScheduleChange}
                    placeholder="Additional notes or instructions"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowDailyScheduleForm(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;
