import React, { useState, useEffect, useMemo } from 'react';
import { FaClock, FaRoute, FaBus, FaUserTie, FaUsers } from 'react-icons/fa';
import { vehiclesAPI, personnelAPI, transportAPI } from '../../services/api';
import './Transport.css';

const Transport = () => {
  // Routes will be fetched dynamically from database
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
  
  // Daily Schedules Display State
  const [dailySchedules, setDailySchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  
  // Button Loading States
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);
  const [isRefreshingSchedules, setIsRefreshingSchedules] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(5);

  // Live Display Mode - Keeping this as requested
  const [showLiveDisplay, setShowLiveDisplay] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Routes Management State
  const [showAddRouteForm, setShowAddRouteForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [newRoute, setNewRoute] = useState({
    routeName: '',
    origin: '',
    destination: '',
    departureTime: '',
    distance: '',
    estimatedDuration: '',
    fare: '',
    description: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch routes from the main routes endpoint
        try {
          console.log('🔍 Fetching routes from database...');
          const routesResponse = await transportAPI.getRoutes();
          console.log('📡 Routes response:', routesResponse);
          
          if (routesResponse.success && routesResponse.data) {
            setRoutes(routesResponse.data);
            console.log('✅ Routes loaded:', routesResponse.data.length);
          } else {
            console.warn('⚠️ No routes data received');
            setRoutes([]);
          }
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

  // Fetch daily schedules
  useEffect(() => {
    const fetchDailySchedules = async () => {
      try {
        setSchedulesLoading(true);
        console.log('🔍 Fetching daily schedules...');
        
        const response = await transportAPI.getDailySchedules();
        console.log('📅 Daily schedules response:', response);
        
        if (response.data && Array.isArray(response.data)) {
          // One-time debug log to see the actual data structure
          if (response.data.length > 0) {
            console.log('🔍 Schedule data structure:', response.data[0]);
            console.log('🔍 Route field:', response.data[0].route);
            console.log('🔍 Available route IDs:', routes.map(r => r._id));
          }
          setDailySchedules(response.data);
        } else {
          setDailySchedules([]);
        }
      } catch (err) {
        console.error('Error fetching daily schedules:', err);
        setDailySchedules([]);
      } finally {
        setSchedulesLoading(false);
      }
    };

    fetchDailySchedules();
  }, []);

  // Handle daily schedule input changes
  const handleDailyScheduleChange = (e) => {
    const { name, value } = e.target;
    
          if (name === 'route') {
        // Auto-fill departure time when route is selected
        const selectedRoute = routes.find(route => route._id === value);
        if (selectedRoute && selectedRoute.departureTime) {
          setNewDailySchedule(prev => ({
            ...prev,
            route: value,
            departureTime: selectedRoute.departureTime // Auto-fill departure time
          }));
        } else {
          setNewDailySchedule(prev => ({
            ...prev,
            route: value,
            departureTime: '' // Keep as empty string, not undefined
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

  // Refresh daily schedules manually
  const refreshDailySchedules = async () => {
    try {
      setIsRefreshingSchedules(true);
      setSchedulesLoading(true);
      const response = await transportAPI.getDailySchedules();
      if (response.data && Array.isArray(response.data)) {
        setDailySchedules(response.data);
        setCurrentPage(1); // Reset to first page when refreshing
      }
    } catch (err) {
      console.error('Error refreshing daily schedules:', err);
    } finally {
      setIsRefreshingSchedules(false);
      setSchedulesLoading(false);
    }
  };

  // Routes Management Functions
  const refreshRoutes = async () => {
    try {
      setLoading(true);
      const routesResponse = await transportAPI.getRoutes();
      if (routesResponse.success && routesResponse.data) {
        setRoutes(routesResponse.data);
      }
    } catch (err) {
      console.error('Error refreshing routes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      const routeData = {
        ...newRoute,
        distance: parseInt(newRoute.distance),
        estimatedDuration: parseInt(newRoute.estimatedDuration),
        fare: parseInt(newRoute.fare)
      };
      
      const response = await transportAPI.createRoute(routeData);
      if (response.success) {
        setShowAddRouteForm(false);
        setNewRoute({
          routeName: '',
          origin: '',
          destination: '',
          departureTime: '',
          distance: '',
          estimatedDuration: '',
          fare: '',
          description: ''
        });
        refreshRoutes();
      }
    } catch (err) {
      console.error('Error adding route:', err);
    }
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setNewRoute({
      routeName: route.routeName,
      origin: route.origin,
      destination: route.destination,
      departureTime: route.departureTime,
      distance: route.distance.toString(),
      estimatedDuration: route.estimatedDuration.toString(),
      fare: route.fare.toString(),
      description: route.description || ''
    });
    setShowAddRouteForm(true);
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await transportAPI.deleteRoute(routeId);
        refreshRoutes();
      } catch (err) {
        console.error('Error deleting route:', err);
      }
    }
  };
  
  // Pagination logic
  const indexOfLastSchedule = currentPage * schedulesPerPage;
  const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
  const currentSchedules = dailySchedules.slice(indexOfFirstSchedule, indexOfLastSchedule);
  const totalPages = Math.ceil(dailySchedules.length / schedulesPerPage);
  
  // Change page
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle daily schedule submission
  const handleDailyScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsCreatingSchedule(true);
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
      
      // Refresh daily schedules
      const refreshResponse = await transportAPI.getDailySchedules();
      if (refreshResponse.data && Array.isArray(refreshResponse.data)) {
        setDailySchedules(refreshResponse.data);
      }
      
      alert('Daily schedule created successfully!');
    } catch (err) {
      console.error('Error creating daily schedule:', err);
      alert('Failed to create daily schedule: ' + err.message);
    } finally {
      setIsCreatingSchedule(false);
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

      {/* Routes Management Section */}
      <div className="routes-management-section">
        <div className="section-header">
          <h3>🚌 Routes Management</h3>
          <div className="header-actions">
            <button 
              onClick={() => setShowAddRouteForm(true)} 
              className="add-route-btn"
            >
              ➕ Add New Route
            </button>
            <button 
              onClick={refreshRoutes} 
              className="refresh-btn"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-state">Loading routes...</div>
        ) : routes.length > 0 ? (
          <div className="routes-table-container">
            <table className="routes-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Departure Time</th>
                  <th>Distance</th>
                  <th>Fare</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(route => (
                  <tr key={route._id}>
                    <td className="route-cell">
                      <FaRoute className="route-icon" />
                      <span className="route-name">
                        {route.origin} → {route.destination}
                      </span>
                    </td>
                    <td className="time-cell">
                      <FaClock className="time-icon" />
                      {route.departureTime}
                    </td>
                    <td>{route.distance} km</td>
                    <td>${route.fare?.toLocaleString() || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${route.status}`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        onClick={() => handleEditRoute(route)} 
                        className="edit-btn"
                        title="Edit Route"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteRoute(route._id)} 
                        className="delete-btn"
                        title="Delete Route"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-routes">
            <p>No routes found. Add your first route to get started!</p>
          </div>
        )}
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
                    {routes.map(route => (
                                              <option key={route._id} value={route._id}>
                          {route.origin} → {route.destination} (Departure: {route.departureTime})
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
                <button type="submit" className="submit-btn" disabled={isCreatingSchedule}>
                  {isCreatingSchedule ? 'Creating...' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Route Form Modal */}
      {showAddRouteForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingRoute ? 'Edit Route' : 'Add New Route'}</h3>
              <button onClick={() => {
                setShowAddRouteForm(false);
                setEditingRoute(null);
                setNewRoute({
                  routeName: '',
                  origin: '',
                  destination: '',
                  departureTime: '',
                  distance: '',
                  estimatedDuration: '',
                  fare: '',
                  description: ''
                });
              }} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleAddRoute} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="routeName">Route Name:</label>
                  <input
                    type="text"
                    id="routeName"
                    name="routeName"
                    value={newRoute.routeName}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, routeName: e.target.value }))}
                    placeholder="e.g., Kigali to Kampala"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="origin">Origin:</label>
                  <input
                    type="text"
                    id="origin"
                    name="origin"
                    value={newRoute.origin}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder="e.g., Kigali"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="destination">Destination:</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={newRoute.destination}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder="e.g., Kampala"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="departureTime">Departure Time:</label>
                  <input
                    type="time"
                    id="departureTime"
                    name="departureTime"
                    value={newRoute.departureTime}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, departureTime: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="distance">Distance (km):</label>
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    value={newRoute.distance}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, distance: e.target.value }))}
                    min="1"
                    placeholder="450"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="estimatedDuration">Duration (hours):</label>
                  <input
                    type="number"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={newRoute.estimatedDuration}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    min="1"
                    placeholder="8"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fare">Fare ($):</label>
                  <input
                    type="number"
                    id="fare"
                    name="fare"
                    value={newRoute.fare}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, fare: e.target.value }))}
                    min="0"
                    placeholder="25000"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description:</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newRoute.description}
                    onChange={(e) => setNewRoute(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional route description..."
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => {
                  setShowAddRouteForm(false);
                  setEditingRoute(null);
                  setNewRoute({
                    routeName: '',
                    origin: '',
                    destination: '',
                    departureTime: '',
                    distance: '',
                    estimatedDuration: '',
                    fare: '',
                    description: ''
                  });
                }} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingRoute ? 'Update Route' : 'Add Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Schedules Display */}
      <div className="daily-schedules-section">
        <div className="section-header">
          <h3>Daily Schedules</h3>
          <div className="header-actions">
            <button 
              onClick={refreshDailySchedules} 
              className="refresh-btn"
              disabled={isRefreshingSchedules}
            >
              {isRefreshingSchedules ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>
        
        <div className="table-container">
          {schedulesLoading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading daily schedules...</p>
            </div>
          )}
          
          {!schedulesLoading && dailySchedules.length === 0 && (
            <div className="empty-state">
              <p>No daily schedules found. Create one using the "Plan Daily Schedule" button above.</p>
            </div>
          )}
          
          {!schedulesLoading && dailySchedules.length > 0 && (
            <>
              <table className="schedules-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Route</th>
                    <th>Departure Time</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Customer Care</th>
                    <th>Capacity</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSchedules.map((schedule) => {
                    // Find route details - handle null route field
                    const routeId = schedule.route || schedule.routeId;
                    const route = routeId ? routes.find(r => r._id === routeId) : null;
                    const routeName = route ? `${route.origin} → ${route.destination} (${route.departureTime})` : (routeId ? `Route ID: ${routeId}` : 'No Route Assigned');
                    
                    // Find vehicle details - handle both ID string and object
                    const vehicleId = typeof schedule.assignedVehicle === 'string' ? schedule.assignedVehicle : 
                                     (schedule.assignedVehicle && schedule.assignedVehicle._id) ? schedule.assignedVehicle._id : 
                                     schedule.vehicleId;
                    const vehicle = vehicleId ? availableVehicles.find(v => v._id === vehicleId) : null;
                    const vehicleInfo = vehicle ? `${vehicle.plateNumber || 'N/A'} - ${vehicle.make || 'Unknown'} ${vehicle.model || 'Unknown'}` : 
                                      (vehicleId ? `Vehicle ID: ${vehicleId}` : 'No Vehicle Assigned');
                    
                    // Find driver details - handle both ID string and object
                    const driverId = typeof schedule.assignedDriver === 'string' ? schedule.assignedDriver : 
                                   (schedule.assignedDriver && schedule.assignedDriver._id) ? schedule.assignedDriver._id : 
                                   schedule.driverId;
                    const driver = driverId ? availableDrivers.find(d => d._id === driverId) : null;
                    const driverName = driver ? `${driver.firstName || 'Unknown'} ${driver.lastName || 'Unknown'}` : 
                                     (driverId ? `Driver ID: ${driverId}` : 'No Driver Assigned');
                    
                    // Find customer care details - handle both ID string and object
                    const customerCareId = typeof schedule.customerCare === 'string' ? schedule.customerCare : 
                                         (schedule.customerCare && schedule.customerCare._id) ? schedule.customerCare._id : 
                                         schedule.customerCareId;
                    const customerCare = customerCareId ? availableCustomerCare.find(cc => cc._id === customerCareId) : null;
                    const customerCareName = customerCare ? `${customerCare.firstName || 'Unknown'} ${customerCare.lastName || 'Unknown'}` : 
                                           (customerCareId ? `CC ID: ${customerCareId}` : 'Not Assigned');
                    
                    return (
                      <tr key={schedule._id}>
                        <td>
                          <div className="date-cell">
                            <FaClock className="date-icon" />
                            {schedule.date ? new Date(schedule.date).toLocaleDateString() : 'No Date'}
                          </div>
                        </td>
                        <td>
                          <div className="route-cell">
                            <FaRoute className="route-icon" />
                            {routeName}
                          </div>
                        </td>
                        <td>
                          <div className="time-cell">
                            <FaClock className="time-icon" />
                            {schedule.departureTime || 'No Time'}
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-cell">
                            <FaBus className="vehicle-icon" />
                            {vehicleInfo}
                          </div>
                        </td>
                        <td>
                          <div className="driver-cell">
                            <FaUserTie className="driver-icon" />
                            {driverName}
                          </div>
                        </td>
                        <td>
                          <div className="customer-care-cell">
                            <FaUsers className="customer-care-icon" />
                            {customerCareName}
                          </div>
                        </td>
                        <td>
                          <span className="capacity-badge">{schedule.capacity || 'N/A'}</span>
                        </td>
                        <td>
                          <span className="notes-text">
                            {schedule.notes || 'No notes'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-btn"
                              onClick={() => alert('Edit functionality coming soon!')}
                              title="Edit Schedule"
                            >
                              ✏️
                            </button>
                            <button 
                              className="delete-btn"
                              onClick={() => alert('Delete functionality coming soon!')}
                              title="Delete Schedule"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <div className="pagination-info">
                    Showing {indexOfFirstSchedule + 1} to {Math.min(indexOfLastSchedule, dailySchedules.length)} of {dailySchedules.length} schedules
                  </div>
                  <div className="pagination-buttons">
                    <button 
                      onClick={goToPrevPage} 
                      disabled={currentPage === 1}
                      className="pagination-btn prev-btn"
                    >
                      ← Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(pageNumber => (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`pagination-btn page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                    
                    <button 
                      onClick={goToNextPage} 
                      disabled={currentPage === totalPages}
                      className="pagination-btn next-btn"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transport;
