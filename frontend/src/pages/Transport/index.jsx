import React, { useState } from 'react';
import { FaRoute, FaBus, FaUserTie, FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import './Transport.css';

const Transport = () => {
  // Transport Data with Home Routes
  const [routes, setRoutes] = useState([
    {
      id: 1,
      name: 'Kampala-Nairobi',
      teamLeader: 'Lorance',
      vehicles: [
        { id: 1, plate: 'RAG 599 K', driver: 'Sanya Robert', customerCare: 'Victor Otian', departure: '17:00', status: 'scheduled', homeRoute: 'Kampala-Nairobi', currentRoute: 'Kampala-Nairobi' },
        { id: 2, plate: 'RAG 596 K', driver: 'Mugesu Kabeso', customerCare: 'Francis Richard', departure: '20:00', status: 'scheduled', homeRoute: 'Kampala-Nairobi', currentRoute: 'Kampala-Nairobi' },
        { id: 3, plate: 'RAH633B', driver: 'Ojamong Osare', customerCare: 'George Talemwa Wiclif', departure: '17:00', status: 'scheduled', homeRoute: 'Kampala-Nairobi', currentRoute: 'Kampala-Nairobi' },
        { id: 4, plate: 'SSD 507Z', driver: 'Murima Shora', customerCare: 'Owour Nike', departure: '20:00', status: 'scheduled', homeRoute: 'Kampala-Nairobi', currentRoute: 'Kampala-Nairobi' },
        { id: 5, plate: 'RAH 630 B', driver: 'Waweru Wilfred', customerCare: 'Ndikubwayo Venuste', departure: '17:00', status: 'scheduled', homeRoute: 'Kampala-Nairobi', currentRoute: 'Kampala-Nairobi' }
      ],
      reserveDrivers: ['GEOFREY', 'Laurence'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Goma-Cyanika-Kampala',
      teamLeader: 'NIYONKURU Eric',
      vehicles: [
        { id: 6, plate: 'PM RAI 649 B', driver: 'Niyonkuru Eric', customerCare: 'Moses Tumusime', departure: '16:00', status: 'active', homeRoute: 'Goma-Cyanika-Kampala', currentRoute: 'Goma-Cyanika-Kampala' },
        { id: 7, plate: 'RAH 624 B', driver: 'Murengezi Donate', customerCare: 'Tumukunde Pamella', departure: '19:00', status: 'active', homeRoute: 'Goma-Cyanika-Kampala', currentRoute: 'Goma-Cyanika-Kampala' },
        { id: 8, plate: 'RAH 628 B', driver: 'Juma Kafero', customerCare: 'Said Gashumba Mike', departure: '16:00', status: 'active', homeRoute: 'Goma-Cyanika-Kampala', currentRoute: 'Goma-Cyanika-Kampala' }
      ],
      reserveDrivers: ['Jorome'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Nairobi-Kigali',
      teamLeader: 'BIZURU',
      vehicles: [
        { id: 9, plate: 'RA1 836 B', driver: 'Habineza Emmanuel', customerCare: 'Wanjuru Kamusime Robert', departure: '22:30', status: 'scheduled', homeRoute: 'Nairobi-Kigali', currentRoute: 'Nairobi-Kigali' },
        { id: 10, plate: 'RAI 835 B', driver: 'Anselme', customerCare: 'Dan Mugisha Steven', departure: '23:15', status: 'scheduled', homeRoute: 'Nairobi-Kigali', currentRoute: 'Nairobi-Kigali' },
        { id: 11, plate: 'RAI 834 B', driver: 'Bayingana Issa', customerCare: 'Moris Murengezi Alex', departure: '00:30', status: 'scheduled', homeRoute: 'Nairobi-Kigali', currentRoute: 'Nairobi-Kigali' },
        { id: 12, plate: 'RAI 647 B', driver: 'Kwizera Jean', customerCare: 'Cyewupe kwizera ian', departure: '01:45', status: 'scheduled', homeRoute: 'Nairobi-Kigali', currentRoute: 'Nairobi-Kigali' },
        { id: 13, plate: 'RAH 629 B', driver: 'Nzitabakuze Baptiste', customerCare: 'Francis Gitau MANZI ISMAEL', departure: '03:00', status: 'scheduled', homeRoute: 'Nairobi-Kigali', currentRoute: 'Nairobi-Kigali' }
      ],
      reserveDrivers: ['NTAKIRUTIMANA HAMZA'],
      reserveCCs: ['NGARUKIYINTWARI PATRICK'],
      status: 'active'
    },
    {
      id: 4,
      name: 'Kampala-Kigali',
      teamLeader: 'SEMINEGA',
      vehicles: [
        { id: 14, plate: 'RAI 645 B', driver: 'Seminega Issa', customerCare: 'Kalisa Steven', departure: '20:00', status: 'scheduled' },
        { id: 15, plate: 'RAI 644 B', driver: 'Mugiraneza Damascene', customerCare: 'Mugisha Joseph', departure: '20:00', status: 'scheduled' },
        { id: 16, plate: 'RAI 646 B', driver: 'Katabarwa Claude', customerCare: 'Agaba Alex', departure: '09:00', status: 'scheduled' },
        { id: 17, plate: 'RAI 643 B', driver: 'Anaclet Turikumwe', customerCare: 'Nathan Kayonga', departure: '09:00', status: 'scheduled' },
        { id: 18, plate: 'SSD 594Z', driver: 'Sunday Mutaganda', customerCare: 'Robert', departure: '19:00', status: 'scheduled' },
        { id: 19, plate: 'RAG 597K', driver: 'Lutakoome Sam', customerCare: 'Akayezu Vivian', departure: '19:00', status: 'scheduled' },
        { id: 20, plate: 'RAI 645B', driver: 'Seminega Issah', customerCare: 'Kalisa Steven', departure: '20:00', status: 'scheduled' },
        { id: 21, plate: 'RAI 644B', driver: 'Mugiraneza Damascene', customerCare: 'Mugisha Joseph', departure: '20:00', status: 'scheduled' },
        { id: 22, plate: 'RAH 631 B', driver: 'Mpazimpaka Danny', customerCare: 'Rutaganda James', departure: '21:00', status: 'scheduled' },
        { id: 23, plate: 'RAH 632 B', driver: 'Kayinamura Eric', customerCare: 'Tuyishime Yves', departure: '21:00', status: 'scheduled' },
        { id: 24, plate: 'RAH 627 B', driver: 'Mustafa Mujambura', customerCare: 'Rashid', departure: '21:30', status: 'scheduled' },
        { id: 25, plate: 'RAG 585 K', driver: 'Twunvikane Jean Bosco', customerCare: 'Bagabo Manaseh', departure: '21:30', status: 'scheduled' },
        { id: 26, plate: 'RAD 268 R', driver: 'Nambazimana Rene', customerCare: 'Mibukiro Pacifique', departure: '15:30', status: 'scheduled' },
        { id: 27, plate: 'RAG 598 K', driver: 'Munyazikwiye Niyonshuti', customerCare: 'Armel', departure: '15:30', status: 'scheduled' },
        { id: 28, plate: 'RAG 595 K', driver: 'MUGABO JOHN GASHEMA', customerCare: '', departure: '22:00', status: 'scheduled' }
      ],
      reserveDrivers: ['SEMPUNDU YUSUF', 'EVODE RUSHIRABWOBA', 'ANDRE HARERIMANA'],
      reserveCCs: ['Patrick Iradukunda', 'HAKIZIMANA DANIEL', 'PAULINE NZEYIMANA'],
      status: 'active'
    },
    {
      id: 5,
      name: 'Kampala-Juba',
      teamLeader: 'MONDAY',
      vehicles: [
        { id: 29, plate: 'RAH 625 B', driver: 'Monday Kalema', customerCare: 'Batemeyito Emmanuel', departure: '08:00', status: 'active' },
        { id: 30, plate: 'RAH 626 B', driver: 'Simon Peter', customerCare: 'Yassin Karimungoma', departure: '08:00', status: 'active' },
        { id: 31, plate: 'SSD 593 Z', driver: 'Twaha Muhozi', customerCare: 'Robert', departure: '08:00', status: 'active' }
      ],
      reserveDrivers: ['KATENDE EZRA'],
      status: 'active'
    },
    {
      id: 6,
      name: 'Juba-Bor',
      teamLeader: 'MANDELA',
      vehicles: [
        { id: 32, plate: 'SSD 312 Q', driver: 'Mabil', customerCare: '', departure: '08:00', status: 'active' },
        { id: 33, plate: 'SSD 271 AB', driver: 'Sammy', customerCare: '', departure: '08:00', status: 'active' },
        { id: 34, plate: 'SSD 838 P', driver: 'Mandela', customerCare: '', departure: '08:00', status: 'active' }
      ],
      parkedVehicles: [
        'SSD 114 AB', 'SSD 115 AB', 'SSD 839 P', 'RAC 580 C', 'SSD 836 B',
        'RAE 516 I', 'RAD 246 R', 'RAD 247 R', 'RAE 569 J', 'RAE 344 J',
        'RAD 266 R', 'RAE 226 I', 'RAD 267 R', 'RAD 265R', 'SSD 171Q',
        'SSD 172Q', 'RAD 642G'
      ],
      status: 'active'
    }
  ]);

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

  // Live Display Mode
  const [showLiveDisplay, setShowLiveDisplay] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Dashboard Statistics - Made reactive to state changes
  const dashboardStats = React.useMemo(() => {
    const totalRoutes = routes.length;
    const totalVehicles = routes.reduce((sum, route) => sum + route.vehicles.length, 0);
    
    // Count trips by status
    const tripsByStatus = routes.reduce((acc, route) => {
      route.vehicles.forEach(vehicle => {
        acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
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
      const drivers = route.vehicles.length;
      const customerCare = route.vehicles.filter(v => v.customerCare && v.customerCare.trim() !== '').length;
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
    route.vehicles.map(vehicle => ({
      ...vehicle,
      routeName: route.name,
      teamLeader: route.teamLeader
    }))
  ).filter(trip => {
    const matchesSearch = trip.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.routeName.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const handleSubmitTrip = (e) => {
    e.preventDefault();
    
    if (editingTrip) {
      // Update existing trip
      const updatedRoutes = routes.map(route => ({
        ...route,
        vehicles: route.vehicles.map(vehicle => 
          vehicle.id === editingTrip.id ? { ...vehicle, ...newTrip } : vehicle
        )
      }));
      setRoutes(updatedRoutes);
      setEditingTrip(null);
    } else {
      // Add new trip
      const newTripItem = {
        id: Date.now(),
        ...newTrip
      };
      
      const updatedRoutes = routes.map(route => 
        route.name === newTrip.route 
          ? { ...route, vehicles: [...route.vehicles, newTripItem] }
          : route
      );
      setRoutes(updatedRoutes);
    }
    
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
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => setShowAddTripForm(true)} className="action-btn">
          Add Trip
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
    </div>
  );
};

export default Transport;
