"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customerController_1 = require("../controllers/customerController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', customerController_1.getCustomers);
router.get('/birthday/:month', customerController_1.getCustomersByBirthMonth);
router.get('/:id', customerController_1.getCustomer);
router.get('/:id/history', customerController_1.getCustomerHistory);
router.post('/', customerController_1.createCustomer);
router.put('/:id', customerController_1.updateCustomer);
router.delete('/:id', auth_1.adminOnly, customerController_1.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map