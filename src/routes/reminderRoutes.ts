import { Router } from 'express';
import {
  getReminders,
  getTodayReminders,
  getWeekReminders,
  getReminder,
  createReminder,
  createReminderFromOrder,
  updateReminder,
  completeReminder,
  skipReminder,
  deleteReminder
} from '../controllers/reminderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getReminders);
router.get('/today', getTodayReminders);
router.get('/week', getWeekReminders);
router.get('/:id', getReminder);
router.post('/', createReminder);
router.post('/from-order/:orderId', createReminderFromOrder);
router.put('/:id', updateReminder);
router.put('/:id/complete', completeReminder);
router.put('/:id/skip', skipReminder);
router.delete('/:id', deleteReminder);

export default router;

