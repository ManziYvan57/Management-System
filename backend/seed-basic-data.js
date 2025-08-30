const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { Route, Trip, DailySchedule } = require('./models/Transport');
const Vehicle = require('./models/Vehicle');
const Personnel = require('./models/Personnel');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trinity_management_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    console.log('\n🌱 Seeding basic data...');
    
    // 1. Create test routes
    console.log('\n1. Creating test routes...');
    const routes = [
      {
        routeName: 'Kampala to Kigali',
        origin: 'Kampala',
        destination: 'Kigali',
        distance: 450,
        estimatedDuration: 8,
        fare: 25000,
        terminal: 'Main Terminal',
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        routeName: 'Kigali to Kampala',
        origin: 'Kigali',
        destination: 'Kampala',
        distance: 450,
        estimatedDuration: 8,
        fare: 25000,
        terminal: 'Main Terminal',
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        routeName: 'Kampala to Nairobi',
        origin: 'Kampala',
        destination: 'Nairobi',
        distance: 600,
        estimatedDuration: 12,
        fare: 35000,
        terminal: 'Main Terminal',
        status: 'active',
        createdBy: new mongoose.Types.ObjectId()
      }
    ];
    
    for (const routeData of routes) {
      const existingRoute = await Route.findOne({ 
        routeName: routeData.routeName,
        origin: routeData.origin,
        destination: routeData.destination
      });
      
      if (!existingRoute) {
        const route = new Route(routeData);
        await route.save();
        console.log(`✅ Created route: ${route.routeName}`);
      } else {
        console.log(`⚠️  Route already exists: ${routeData.routeName}`);
      }
    }
    
    // 2. Create test personnel (drivers)
    console.log('\n2. Creating test personnel...');
    const personnel = [
      {
        firstName: 'John',
        lastName: 'Driver',
        role: 'driver',
        employmentStatus: 'active',
        phoneNumber: '+256700000001',
        email: 'john.driver@trinity.com',
        dateOfBirth: new Date('1985-01-15'),
        gender: 'male',
        department: 'operations',
        terminal: 'Kampala',
        hireDate: new Date('2020-01-01'),
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        firstName: 'Jane',
        lastName: 'Driver',
        role: 'driver',
        employmentStatus: 'active',
        phoneNumber: '+256700000002',
        email: 'jane.driver@trinity.com',
        dateOfBirth: new Date('1988-03-20'),
        gender: 'female',
        department: 'operations',
        terminal: 'Kampala',
        hireDate: new Date('2020-02-01'),
        createdBy: new mongoose.Types.ObjectId()
      },
      {
        firstName: 'Mike',
        lastName: 'Care',
        role: 'customer_care',
        employmentStatus: 'active',
        phoneNumber: '+256700000003',
        email: 'mike.care@trinity.com',
        dateOfBirth: new Date('1990-07-10'),
        gender: 'male',
        department: 'customer_service',
        terminal: 'Kampala',
        hireDate: new Date('2020-03-01'),
        createdBy: new mongoose.Types.ObjectId()
      }
    ];
    
    for (const personData of personnel) {
      const existingPerson = await Personnel.findOne({ 
        firstName: personData.firstName,
        lastName: personData.lastName,
        role: personData.role
      });
      
      if (!existingPerson) {
        const person = new Personnel(personData);
        await person.save();
        console.log(`✅ Created personnel: ${person.firstName} ${person.lastName} (${person.role})`);
      } else {
        console.log(`⚠️  Personnel already exists: ${personData.firstName} ${personData.lastName} (${personData.role})`);
      }
    }
    
    // 3. Update existing vehicles with terminal info
    console.log('\n3. Updating existing vehicles...');
    const vehicles = await Vehicle.find();
    for (const vehicle of vehicles) {
      if (!vehicle.terminal) {
        vehicle.terminal = 'Main Terminal';
        await vehicle.save();
        console.log(`✅ Updated vehicle ${vehicle.plateNumber} with terminal`);
      }
    }
    
    // 4. Create a test daily schedule
    console.log('\n4. Creating test daily schedule...');
    const testRoute = await Route.findOne({ routeName: 'Kampala to Kigali' });
    const testVehicle = await Vehicle.findOne({ status: 'active' });
    const testDriver = await Personnel.findOne({ role: 'driver', employmentStatus: 'active' });
    
    if (testRoute && testVehicle && testDriver) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const existingSchedule = await DailySchedule.findOne({
        date: tomorrow,
        route: testRoute._id,
        assignedVehicle: testVehicle._id
      });
      
      if (!existingSchedule) {
        const schedule = new DailySchedule({
          date: tomorrow,
          route: testRoute._id,
          departureTime: '09:00',
          assignedVehicle: testVehicle._id,
          assignedDriver: testDriver._id,
          capacity: testVehicle.seatingCapacity || 50,
          terminal: 'Main Terminal',
          notes: 'Test schedule for demonstration',
          createdBy: new mongoose.Types.ObjectId()
        });
        
        await schedule.save();
        console.log(`✅ Created test daily schedule for ${tomorrow.toDateString()}`);
      } else {
        console.log(`⚠️  Test schedule already exists for ${tomorrow.toDateString()}`);
      }
    } else {
      console.log('⚠️  Missing required data for test schedule');
      console.log(`   Route: ${testRoute ? 'Found' : 'Missing'}`);
      console.log(`   Vehicle: ${testVehicle ? 'Found' : 'Missing'}`);
      console.log(`   Driver: ${testDriver ? 'Found' : 'Missing'}`);
    }
    
    console.log('\n✅ Basic data seeding completed!');
    
    // Show summary
    const routeCount = await Route.countDocuments();
    const personnelCount = await Personnel.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();
    const scheduleCount = await DailySchedule.countDocuments();
    
    console.log('\n📊 Data Summary:');
    console.log(`   Routes: ${routeCount}`);
    console.log(`   Personnel: ${personnelCount}`);
    console.log(`   Vehicles: ${vehicleCount}`);
    console.log(`   Daily Schedules: ${scheduleCount}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
});
