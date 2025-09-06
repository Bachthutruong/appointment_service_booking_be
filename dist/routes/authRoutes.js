"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/login', authController_1.login);
// Protected routes
router.get('/me', auth_1.authenticate, authController_1.getMe);
router.put('/profile', auth_1.authenticate, authController_1.updateProfile);
router.put('/change-password', auth_1.authenticate, authController_1.changePassword);
// Admin only routes
router.post('/users', auth_1.authenticate, auth_1.adminOnly, authController_1.createUser);
router.get('/users', auth_1.authenticate, auth_1.adminOnly, authController_1.getUsers);
router.get('/users/:id', auth_1.authenticate, auth_1.adminOnly, authController_1.getUser);
router.put('/users/:id', auth_1.authenticate, auth_1.adminOnly, authController_1.updateUser);
router.put('/users/:id/password', auth_1.authenticate, auth_1.adminOnly, authController_1.changeUserPassword);
router.delete('/users/:id', auth_1.authenticate, auth_1.adminOnly, authController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map