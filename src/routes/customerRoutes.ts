import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  getCustomerHistory,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersByBirthMonth
} from '../controllers/customerController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getCustomers);
router.get('/birthday/:month', getCustomersByBirthMonth);
router.get('/:id', getCustomer);
router.get('/:id/history', getCustomerHistory);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', adminOnly, deleteCustomer);

export default router;

