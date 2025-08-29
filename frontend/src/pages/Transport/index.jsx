import React, { useState, useEffect } from 'react';
import { FaRoute, FaBus, FaUserTie, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { transportAPI } from '../../services/api';
import './Transport.css';

const Transport = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddTripForm, setShowAddTripForm] = useState(false);
  const [showEditTripForm, setShowEditTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [newTrip, setNewTrip] = useState({
    route: '',
    vehicle: '',
    driver: '',
    customerCare: '',
    departure: '',
    status: 'scheduled',
    homeRoute: '',
    currentRoute: ''
  });

  // New state for daily schedules
  const [dailySchedules, setDailySchedules] = useState([]);
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

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await transportAPI.getRoutes();
        setRoutes(response.data || []);
        
        // Also fetch daily schedules
        const schedulesResponse = await transportAPI.getDailySchedules();
        setDailySchedules(schedulesResponse.data || []);
      } catch (err) {
        console.error('Error fetching transport data:', err);
        setError(err.message || 'Failed to fetch transport data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch available vehicles and drivers for daily schedules
  useEffect(() => {
    const fetchAvailableResources = async () => {
      try {
        // Get all vehicles and filter for active ones
        const vehiclesResponse = await transportAPI.getAvailableVehicles();
        console.log('Vehicles Response:', vehiclesResponse);
        if (vehiclesResponse.success) {
          setAvailableVehicles(vehiclesResponse.data || []);
          console.log('Available Vehicles:', vehiclesResponse.data);
        }
        
        // Get all personnel and filter for drivers
        const driversResponse = await transportAPI.getAvailablePersonnel({ role: 'driver' });
        console.log('Drivers Response:', driversResponse);
        if (driversResponse.success) {
          setAvailableDrivers(driversResponse.data || []);
          console.log('Available Drivers:', driversResponse.data);
        }
      } catch (err) {
        console.error('Error fetching available resources:', err);
        // Fallback: try to get vehicles and personnel from other endpoints
        try {
          // Try to get vehicles from vehicles API
          const vehiclesResponse = await fetch('/api/vehicles?status=active');
          const vehiclesData = await vehiclesResponse.json();
          if (vehiclesData.success) {
            setAvailableVehicles(vehiclesData.data || []);
          }
          
          // Try to get personnel from personnel API
          const personnelResponse = await fetch('/api/personnel?role=driver');
          const personnelData = await personnelResponse.json();
          if (personnelData.success) {
            setAvailableDrivers(personnelData.data || []);
          }
        } catch (fallbackErr) {
          console.error('Fallback API calls also failed:', fallbackErr);
        }
      }
    };

    fetchAvailableResources();
  }, []);

  // Refresh data after adding/editing
  const refreshData = async () => {
    try {
      const response = await transportAPI.getRoutes();
      setRoutes(response.data || []);
      
      // Also refresh daily schedules
      const schedulesResponse = await transportAPI.getDailySchedules();
      setDailySchedules(schedulesResponse.data || []);
    } catch (err) {
      console.error('Error refreshing transport data:', err);
    }
  };

  // Handle daily schedule input changes
  const handleDailyScheduleChange = (e) => {
    const { name, value } = e.target;
    setNewDailySchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get smart vehicle suggestions
  const getSmartVehicleSuggestions = async (date, routeId, requiredCapacity) => {
    try {
      const response = await transportAPI.getSmartVehicleSuggestions({
        date,
        routeId,
        requiredCapacity
      });
      
      if (response.success) {
        setAvailableVehicles(response.data);
      }
    } catch (err) {
      console.error('Error getting vehicle suggestions:', err);
    }
  };

  // Handle daily schedule submission
  const handleDailyScheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const scheduleData = {
        ...newDailySchedule,
        terminal: 'Main Terminal', // Default terminal
        capacity: parseInt(newDailySchedule.capacity)
      };
      
      await transportAPI.createDailySchedule(scheduleData);
      
      // Reset form and refresh data
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
      refreshData();
      
      alert('Daily schedule created successfully!');
    } catch (err) {
      console.error('Error creating daily schedule:', err);
      alert('Failed to create daily schedule: ' + err.message);
    }
  };

  // Generate trips from daily schedules
  const generateTripsFromSchedules = async (date) => {
    try {
      await transportAPI.generateTrips({ date });
      alert('Trips generated successfully!');
      refreshData();
    } catch (err) {
      console.error('Error generating trips:', err);
      alert('Failed to generate trips: ' + err.message);
    }
  };

  // Live Display Mode
  const [showLiveDisplay, setShowLiveDisplay] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dashboard Statistics - Made reactive to state changes
  const dashboardStats = React.useMemo(() => {
    const totalRoutes = routes.length;
    const totalVehicles = routes.reduce((sum, route) => sum + (route.vehicles?.length || 0), 0);
    
    // Count trips by status
    const tripsByStatus = routes.reduce((acc, route) => {
      (route.vehicles || []).forEach(vehicle => {
        if (vehicle.status) {
          acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
        }
      });
      return acc;
    }, {});
    
    const activeTrips = tripsByStatus['active'] || 0;
    const scheduledTrips = tripsByStatus['scheduled'] || 0;
    const departedTrips = tripsByStatus['departed'] || 0;
    const boardingTrips = tripsByStatus['boarding'] || 0;
    const readyTrips = tripsByStatus['ready'] || 0;
    
    // Calculate total personnel more accurately
    const totalPersonnel = routes.reduce((sum, route) => {
      const drivers = route.vehicles?.length || 0;
      const customerCare = (route.vehicles || []).filter(v => v.customerCare && v.customerCare.trim() !== '').length;
      const reserves = (route.reserveDrivers?.length || 0) + (route.reserveCCs?.length || 0);
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
  const getUpdatedStatus = (departureTime, currentStatus) => {
    if (currentStatus === 'completed' || currentStatus === 'cancelled') return currentStatus;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const departureDateTime = new Date(`${today}T${departureTime}:00`);
    const timeDiff = departureDateTime - now;
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    // For testing purposes, let's make some trips show different statuses
    // In real implementation, this would be based on actual time
    if (minutesDiff < -120) return 'completed'; // 2 hours after departure
    if (minutesDiff < 0) return 'departed';
    if (minutesDiff < 30) return 'boarding';
    if (minutesDiff < 60) return 'ready';
    return 'scheduled';
  };

  // Update vehicle statuses automatically
  const updateVehicleStatuses = () => {
    setRoutes(prevRoutes => {
      return prevRoutes.map(route => ({
        ...route,
        vehicles: route.vehicles.map(vehicle => ({
          ...vehicle,
          status: getUpdatedStatus(vehicle.departure, vehicle.status)
        }))
      }));
    });
  };

  // Filter trips based on search and filters
  const filteredTrips = routes.flatMap(route => 
    (route.vehicles || []).map(vehicle => ({
      ...vehicle,
      routeName: route.name,
      teamLeader: route.teamLeader
    }))
  ).filter(trip => {
    const matchesSearch = (trip.plate && trip.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trip.driver && trip.driver.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (trip.routeName && trip.routeName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRoute = routeFilter === 'all' || trip.routeName === routeFilter;
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    
    return matchesSearch && matchesRoute && matchesStatus;
  });

  // Sort trips by departure time for live display and filter out completed trips
  const sortedTrips = [...filteredTrips]
    .filter(trip => trip.status !== 'completed') // Don't show completed trips in live display
    .sort((a, b) => {
      const timeA = new Date(`2000-01-01T${a.departure}:00`);
      const timeB = new Date(`2000-01-01T${b.departure}:00`);
      return timeA - timeB;
    });

  // Auto-update every minute
  React.useEffect(() => {
    if (autoUpdate) {
      updateVehicleStatuses();
      const interval = setInterval(updateVehicleStatuses, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [autoUpdate]); // Removed routes dependency to prevent infinite loop

  // Auto-scroll live display every 5 seconds
  React.useEffect(() => {
    if (showLiveDisplay && sortedTrips.length > 8) {
      const scrollInterval = setInterval(() => {
        setCurrentDisplayIndex(prevIndex => {
          const nextIndex = prevIndex + 8;
          return nextIndex >= sortedTrips.length ? 0 : nextIndex;
        });
      }, 5000); // Change every 5 seconds
      
      return () => clearInterval(scrollInterval);
    }
  }, [showLiveDisplay, sortedTrips.length]);

  // Update current time every second
  React.useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timeInterval);
  }, []);

  // Form handling functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrip({ ...newTrip, [name]: value });
  };

  const handleSubmitTrip = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTrip) {
        // Update existing trip
        // TODO: Add update API call when backend supports it
        console.log('Update trip:', newTrip);
      } else {
        // Add new trip
        await transportAPI.createTrip(newTrip);
      }
      
      // Refresh the data
      await refreshData();
      
      setNewTrip({
        route: '',
        vehicle: '',
        driver: '',
        customerCare: '',
        departure: '',
        status: 'scheduled'
      });
      setEditingTrip(null);
      setShowAddTripForm(false);
      setShowEditTripForm(false);
    } catch (err) {
      console.error('Error saving trip:', err);
      alert(err.message || 'Failed to save trip');
    }
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setNewTrip({
      route: trip.routeName,
      vehicle: trip.plate,
      driver: trip.driver,
      customerCare: trip.customerCare,
      departure: trip.departure,
      status: trip.status
    });
    setShowEditTripForm(true);
  };

  const handleCancelEdit = () => {
    setEditingTrip(null);
    setNewTrip({
      route: '',
      vehicle: '',
      driver: '',
      customerCare: '',
      departure: '',
      status: 'scheduled'
    });
    setShowAddTripForm(false);
    setShowEditTripForm(false);
  };

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
        <div className="stat-card">
          <h3>{dashboardStats.boardingTrips + dashboardStats.departedTrips}</h3>
          <p>In Transit</p>
        </div>
        <div className="stat-card">
          <h3>{dashboardStats.scheduledTrips}</h3>
          <p>Upcoming</p>
        </div>
        <div className="stat-card">
          <h3>{dailySchedules.filter(s => s.status === 'planned').length}</h3>
          <p>Planned Schedules</p>
        </div>
        <div className="stat-card">
          <h3>{dailySchedules.filter(s => s.status === 'confirmed').length}</h3>
          <p>Confirmed Schedules</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => setShowAddTripForm(true)} className="action-btn">
          Add Trip
        </button>
        <button onClick={() => setShowDailyScheduleForm(true)} className="action-btn">
          Plan Daily Schedule
        </button>
        <button onClick={() => generateTripsFromSchedules(new Date().toISOString().split('T')[0])} className="action-btn">
          Generate Today's Trips
        </button>
        <button 
          onClick={() => setShowLiveDisplay(!showLiveDisplay)} 
          className={`action-btn ${showLiveDisplay ? 'active' : ''}`}
        >
          {showLiveDisplay ? 'Hide Live Display' : 'Show Live Display'}
        </button>
        <button 
          onClick={() => setAutoUpdate(!autoUpdate)} 
          className={`action-btn ${autoUpdate ? 'active' : ''}`}
        >
          {autoUpdate ? 'Auto-Update: ON' : 'Auto-Update: OFF'}
        </button>
      </div>

      {/* Daily Schedules Section */}
      <div className="daily-schedules-section">
        <div className="section-header">
          <h3>Daily Schedules</h3>
          <div className="section-actions">
            <button 
              onClick={() => setShowDailyScheduleForm(true)} 
              className="action-btn small"
            >
              + Add Schedule
            </button>
          </div>
        </div>
        
        {dailySchedules.length > 0 ? (
          <div className="schedules-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Departure</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailySchedules.slice(0, 10).map((schedule) => (
                  <tr key={schedule._id} className={`schedule-row ${schedule.status}`}>
                    <td>{new Date(schedule.date).toLocaleDateString()}</td>
                    <td>
                      {schedule.route?.routeName || 'Loading...'}
                      <br />
                      <small>{schedule.route?.origin} → {schedule.route?.destination}</small>
                    </td>
                    <td>{schedule.departureTime}</td>
                    <td>
                      {schedule.assignedVehicle?.plateNumber || 'Loading...'}
                      <br />
                      <small>{schedule.assignedVehicle?.make} {schedule.assignedVehicle?.model}</small>
                    </td>
                    <td>
                      {schedule.assignedDriver?.firstName} {schedule.assignedDriver?.lastName}
                      <br />
                      <small>{schedule.assignedDriver?.employeeId}</small>
                    </td>
                    <td>
                      <span className={`status-badge ${schedule.status}`}>
                        {schedule.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {schedule.status === 'planned' && (
                          <button 
                            onClick={() => {
                              // Update status to confirmed
                              transportAPI.updateDailySchedule(schedule._id, { status: 'confirmed' })
                                .then(() => refreshData())
                                .catch(err => alert('Failed to confirm schedule: ' + err.message));
                            }}
                            className="action-btn small confirm"
                          >
                            Confirm
                          </button>
                        )}
                        {schedule.status === 'confirmed' && !schedule.tripGenerated && (
                          <button 
                            onClick={() => generateTripsFromSchedules(schedule.date)}
                            className="action-btn small generate"
                          >
                            Generate Trip
                          </button>
                        )}
                        {schedule.status === 'planned' && (
                          <button 
                            onClick={() => {
                              if (window.confirm('Delete this schedule?')) {
                                transportAPI.deleteDailySchedule(schedule._id)
                                  .then(() => refreshData())
                                  .catch(err => alert('Failed to delete schedule: ' + err.message));
                              }
                            }}
                            className="action-btn small delete"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-schedules">
            <p>No daily schedules planned yet. Click "Plan Daily Schedule" to get started!</p>
          </div>
        )}
        
        {/* Debug Info */}
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
          <h4>Debug Info:</h4>
          <p><strong>Available Vehicles:</strong> {availableVehicles.length}</p>
          <p><strong>Available Drivers:</strong> {availableDrivers.length}</p>
          <p><strong>Daily Schedules:</strong> {dailySchedules.length}</p>
          <details>
            <summary>Vehicles Data</summary>
            <pre>{JSON.stringify(availableVehicles.slice(0, 3), null, 2)}</pre>
          </details>
          <details>
            <summary>Drivers Data</summary>
            <pre>{JSON.stringify(availableDrivers.slice(0, 3), null, 2)}</pre>
          </details>
        </div>
      </div>

      {/* Live Display */}
      {showLiveDisplay && (
        <div className="live-display">
          <div className="live-header">
            <h3>TRINITY TRANSPORT - LIVE DEPARTURES</h3>
            <div className="live-time">{new Date().toLocaleTimeString()}</div>
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
                {sortedTrips.slice(currentDisplayIndex, currentDisplayIndex + 8).map((trip) => (
                  <tr key={trip.id} className={`live-row ${trip.status}`}>
                    <td>
                      <div className="plate-cell">
                        <FaBus className="vehicle-icon" />
                        <strong>{trip.plate}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="route-cell">
                        <FaRoute className="route-icon" />
                        {trip.routeName}
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        <FaClock className="time-icon" />
                        <strong>{trip.departure}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`live-status ${trip.status}`}>
                          {trip.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedTrips.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No upcoming departures at this time
                    </td>
                  </tr>
                )}
                {sortedTrips.length > 0 && sortedTrips.slice(currentDisplayIndex, currentDisplayIndex + 8).length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Loading more departures...
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
          <div className="header-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search trips..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-group">
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Routes</option>
                {routes.map(route => (
                  <option key={route.id} value={route.name}>{route.name}</option>
                ))}
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ready">Ready</option>
                <option value="boarding">Boarding</option>
                <option value="departed">Departed</option>
                <option value="delayed">Delayed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
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
              <button onClick={refreshData} className="retry-btn">Retry</button>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrips.map((trip) => (
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
                    {trip.currentRoute !== trip.homeRoute && (
                      <small className="route-note">(Temporary Assignment)</small>
                    )}
                  </td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEditTrip(trip)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </>
          )}
        </div>
      </div>

      {/* Add Trip Form Modal */}
      {showAddTripForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Trip</h3>
              <button onClick={handleCancelEdit} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitTrip} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="route">Route:</label>
                  <select
                    id="route"
                    name="route"
                    value={newTrip.route}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.name}>{route.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="vehicle">Vehicle Plate:</label>
                  <input
                    type="text"
                    id="vehicle"
                    name="vehicle"
                    value={newTrip.vehicle}
                    onChange={handleInputChange}
                    placeholder="e.g., RAG 599 K"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="driver">Driver:</label>
                  <input
                    type="text"
                    id="driver"
                    name="driver"
                    value={newTrip.driver}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="customerCare">Customer Care:</label>
                  <input
                    type="text"
                    id="customerCare"
                    name="customerCare"
                    value={newTrip.customerCare}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="departure">Departure Time:</label>
                  <input
                    type="time"
                    id="departure"
                    name="departure"
                    value={newTrip.departure}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status:</label>
                  <select
                    id="status"
                    name="status"
                    value={newTrip.status}
                    onChange={handleInputChange}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ready">Ready</option>
                    <option value="boarding">Boarding</option>
                    <option value="departed">Departed</option>
                    <option value="delayed">Delayed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trip Form Modal */}
      {showEditTripForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Trip</h3>
              <button onClick={handleCancelEdit} className="close-btn">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitTrip} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editRoute">Route:</label>
                  <select
                    id="editRoute"
                    name="route"
                    value={newTrip.route}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Route</option>
                    {routes.map(route => (
                      <option key={route.id} value={route.name}>{route.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="editVehicle">Vehicle Plate:</label>
                  <input
                    type="text"
                    id="editVehicle"
                    name="vehicle"
                    value={newTrip.vehicle}
                    onChange={handleInputChange}
                    placeholder="e.g., RAG 599 K"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editDriver">Driver:</label>
                  <input
                    type="text"
                    id="editDriver"
                    name="driver"
                    value={newTrip.driver}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="editCustomerCare">Customer Care:</label>
                  <input
                    type="text"
                    id="editCustomerCare"
                    name="customerCare"
                    value={newTrip.customerCare}
                    onChange={handleInputChange}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editDeparture">Departure Time:</label>
                  <input
                    type="time"
                    id="editDeparture"
                    name="departure"
                    value={newTrip.departure}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="editStatus">Status:</label>
                  <select
                    id="editStatus"
                    name="status"
                    value={newTrip.status}
                    onChange={handleInputChange}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ready">Ready</option>
                    <option value="boarding">Boarding</option>
                    <option value="departed">Departed</option>
                    <option value="delayed">Delayed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      <option key={route._id || route.id} value={route._id || route.id}>
                        {route.routeName || route.name} ({route.origin} → {route.destination})
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
                  />
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
                    placeholder="Required capacity"
                    required
                  />
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
                    {availableVehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.plateNumber} - {vehicle.make} {vehicle.model} ({vehicle.seatingCapacity || vehicle.capacity || 'N/A'} seats)
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
                    {availableDrivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.firstName} {driver.lastName} ({driver.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customerCare">Customer Care (Optional):</label>
                  <select
                    id="customerCare"
                    name="customerCare"
                    value={newDailySchedule.customerCare}
                    onChange={handleDailyScheduleChange}
                  >
                    <option value="">Select Customer Care</option>
                    {availableDrivers.filter(d => d.role === 'customer_care').map(cc => (
                      <option key={cc._id} value={cc._id}>
                        {cc.firstName} {cc.lastName} ({cc.employeeId})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes:</label>
                  <input
                    type="text"
                    id="notes"
                    name="notes"
                    value={newDailySchedule.notes}
                    onChange={handleDailyScheduleChange}
                    placeholder="Additional notes"
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
