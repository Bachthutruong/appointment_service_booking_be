import { Router } from 'express';
import { getSettings, updateSettings, resetSettings } from '../controllers/settingsController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes (if needed)
// router.get('/public', getPublicSettings);

// Protected routes
router.get('/', authenticate, getSettings);
router.put('/', authenticate, adminOnly, updateSettings);
router.post('/reset', authenticate, adminOnly, resetSettings);

export default router;
