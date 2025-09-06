"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', appointmentController_1.getAppointments);
router.get('/calendar', appointmentController_1.getAppointmentsCalendar);
router.get('/:id', appointmentController_1.getAppointment);
router.post('/', appointmentController_1.createAppointment);
router.put('/:id', appointmentController_1.updateAppointment);
router.delete('/:id', appointmentController_1.deleteAppointment);
exports.default = router;
//# sourceMappingURL=appointmentRoutes.js.map