import { Router } from 'express';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServiceStats
} from '../controllers/serviceController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getServices);
// Stats must be defined before the generic :id route
router.get('/:id/stats', getServiceStats);
router.get('/:id', getService);
router.post('/', adminOnly, createService);
router.put('/:id', adminOnly, updateService);
router.delete('/:id', adminOnly, deleteService);

export default router;

