import { Router } from 'express';
import {
  getRevenueReport,
  getTopSellingReport,
  getCustomerReport,
  getInventoryReport,
  getDashboardOverview
} from '../controllers/reportController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticate, adminOnly);

router.get('/revenue', getRevenueReport);
router.get('/top-selling', getTopSellingReport);
router.get('/customers', getCustomerReport);
router.get('/inventory', getInventoryReport);
router.get('/dashboard', getDashboardOverview);

export default router;

