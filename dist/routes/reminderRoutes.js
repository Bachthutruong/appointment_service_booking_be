"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reminderController_1 = require("../controllers/reminderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', reminderController_1.getReminders);
router.get('/today', reminderController_1.getTodayReminders);
router.get('/week', reminderController_1.getWeekReminders);
router.get('/:id', reminderController_1.getReminder);
router.post('/', reminderController_1.createReminder);
router.post('/from-order/:orderId', reminderController_1.createReminderFromOrder);
router.put('/:id', reminderController_1.updateReminder);
router.put('/:id/complete', reminderController_1.completeReminder);
router.put('/:id/skip', reminderController_1.skipReminder);
router.delete('/:id', reminderController_1.deleteReminder);
exports.default = router;
//# sourceMappingURL=reminderRoutes.js.map