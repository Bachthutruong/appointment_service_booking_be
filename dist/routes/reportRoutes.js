"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require admin authentication
router.use(auth_1.authenticate, auth_1.adminOnly);
router.get('/revenue', reportController_1.getRevenueReport);
router.get('/top-selling', reportController_1.getTopSellingReport);
router.get('/customers', reportController_1.getCustomerReport);
router.get('/inventory', reportController_1.getInventoryReport);
router.get('/dashboard', reportController_1.getDashboardOverview);
exports.default = router;
//# sourceMappingURL=reportRoutes.js.map