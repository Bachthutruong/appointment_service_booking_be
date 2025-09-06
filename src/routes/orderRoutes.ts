import { Router } from 'express';
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateOrderStatus,
  uploadOrderImages,
  deleteOrder
} from '../controllers/orderController';
import { authenticate, adminOnly } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.patch('/:id/status', updateOrderStatus);
router.post('/:id/images', upload.array('images', 5), uploadOrderImages);
router.delete('/:id', adminOnly, deleteOrder);

export default router;

