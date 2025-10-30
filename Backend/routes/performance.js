import express from 'express';
// Import ALL controller functions
import {
  getAllStates,       // <-- NEW
  getAllDistricts,
  getLatestByDistrict,
  getHistoryByDistrict
} from '../controllers/performance.js';

const router = express.Router();

// --- STATE LIST ROUTE ---
// GET /api/v1/performance/states
router.route('/states').get(getAllStates);

// --- DISTRICT LIST ROUTE ---
// GET /api/v1/performance/districts?state=STATE_NAME
router.route('/districts').get(getAllDistricts);

// --- HISTORY ROUTE ---
// GET /api/v1/performance/history/:district
router.route('/history/:district').get(getHistoryByDistrict);

// --- LATEST DATA ROUTE ---
// This must come LAST because it's the most general parameter
// GET /api/v1/performance/:district
router.route('/:district').get(getLatestByDistrict);

export default router;

