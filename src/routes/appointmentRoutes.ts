import { Router } from 'express';
import {
  getAppointments,
  getAppointment,
  getAppointmentsCalendar,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getAppointments);
router.get('/calendar', getAppointmentsCalendar);
router.get('/:id', getAppointment);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;

