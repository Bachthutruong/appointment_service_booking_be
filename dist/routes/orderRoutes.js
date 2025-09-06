"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', orderController_1.getOrders);
router.get('/:id', orderController_1.getOrder);
router.post('/', orderController_1.createOrder);
router.put('/:id', orderController_1.updateOrder);
router.patch('/:id/status', orderController_1.updateOrderStatus);
router.post('/:id/images', upload_1.upload.array('images', 5), orderController_1.uploadOrderImages);
router.delete('/:id', auth_1.adminOnly, orderController_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map