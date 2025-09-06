import { Router } from 'express';
import {
  login,
  getMe,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  changeUserPassword
} from '../controllers/authController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Admin only routes
router.post('/users', authenticate, adminOnly, createUser);
router.get('/users', authenticate, adminOnly, getUsers);
router.get('/users/:id', authenticate, adminOnly, getUser);
router.put('/users/:id', authenticate, adminOnly, updateUser);
router.put('/users/:id/password', authenticate, adminOnly, changeUserPassword);
router.delete('/users/:id', authenticate, adminOnly, deleteUser);

export default router;
