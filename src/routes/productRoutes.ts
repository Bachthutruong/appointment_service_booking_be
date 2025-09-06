import { Router } from 'express';
import {
  getProducts,
  getProduct,
  getProductStockHistory,
  getAllStockMovements,
  createProduct,
  updateProduct,
  addStock,
  adjustStock,
  deleteProduct
} from '../controllers/productController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getProducts);
router.get('/stock-movements', getAllStockMovements);
router.get('/:id', getProduct);
router.get('/:id/stock-history', getProductStockHistory);
router.post('/', adminOnly, createProduct);
router.put('/:id', adminOnly, updateProduct);
router.post('/:id/stock/add', adminOnly, addStock);
router.post('/:id/stock/adjust', adminOnly, adjustStock);
router.delete('/:id', adminOnly, deleteProduct);

export default router;

