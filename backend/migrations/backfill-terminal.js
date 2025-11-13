/*
  Backfill terminal and createdBy fields for WorkOrder and MaintenanceSchedule.

  Usage examples:
    node migrations/backfill-terminal.js --terminal Kigali
    node migrations/backfill-terminal.js --infer-single-terminal

  Logic:
    - If --infer-single-terminal is set and the related vehicle has exactly one terminal,
      use that terminal.
    - Otherwise, if --terminal <Name> is provided, use that as a fallback default.
    - createdBy cannot be reliably inferred for historical data; it will be left unchanged
      unless already present.

  Note: Run with a backup/restore point created (tag already created).
*/

const mongoose = require('mongoose');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
require('dotenv').config();

const WorkOrder = require('../models/WorkOrder');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const Vehicle = require('../models/Vehicle');

async function main() {
  const argv = yargs(hideBin(process.argv))
    .option('terminal', { type: 'string', describe: 'Fallback terminal to assign' })
    .option('infer-single-terminal', { type: 'boolean', default: true, describe: 'Infer terminal from vehicle if it has exactly one terminal' })
    .strict()
    .help()
    .argv;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI not set in environment');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  try {
    console.log('Connected to MongoDB');

    // Cache vehicles to avoid repeated lookups
    const vehicleCache = new Map();
    async function getVehicleTerminals(vehicleId) {
      if (!vehicleId) return [];
      const idStr = vehicleId.toString();
      if (vehicleCache.has(idStr)) return vehicleCache.get(idStr);
      const v = await Vehicle.findById(vehicleId).select('terminals');
      const terms = v?.terminals || [];
      vehicleCache.set(idStr, terms);
      return terms;
    }

    // WorkOrders
    const woFilter = { $or: [{ terminal: { $exists: false } }, { terminal: null }, { terminal: '' }] };
    const workOrders = await WorkOrder.find(woFilter).select('_id vehicle terminal');
    let woUpdated = 0;
    for (const wo of workOrders) {
      let terminal = null;
      if (argv["infer-single-terminal"] && wo.vehicle) {
        const terms = await getVehicleTerminals(wo.vehicle);
        if (terms.length === 1) terminal = terms[0];
      }
      if (!terminal && argv.terminal) terminal = argv.terminal;
      if (terminal) {
        await WorkOrder.updateOne({ _id: wo._id }, { $set: { terminal } });
        woUpdated += 1;
      }
    }

    // MaintenanceSchedules
    const msFilter = { $or: [{ terminal: { $exists: false } }, { terminal: null }, { terminal: '' }] };
    const schedules = await MaintenanceSchedule.find(msFilter).select('_id vehicle terminal');
    let msUpdated = 0;
    for (const ms of schedules) {
      let terminal = null;
      if (argv["infer-single-terminal"] && ms.vehicle) {
        const terms = await getVehicleTerminals(ms.vehicle);
        if (terms.length === 1) terminal = terms[0];
      }
      if (!terminal && argv.terminal) terminal = argv.terminal;
      if (terminal) {
        await MaintenanceSchedule.updateOne({ _id: ms._id }, { $set: { terminal } });
        msUpdated += 1;
      }
    }

    console.log(`Backfill complete: WorkOrders updated=${woUpdated}, MaintenanceSchedules updated=${msUpdated}`);
  } catch (err) {
    console.error('Backfill error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();
