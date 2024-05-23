import express from 'express';
import {
	getDashboard,
	getSalesReports,
	getInventoryReports,
} from '../controllers/reports.js';
const router = express.Router();

router.get('/dashboard', getDashboard);
router.get('/sales-reports', getSalesReports);
router.get('/inventory-reports', getInventoryReports);

export default router;
