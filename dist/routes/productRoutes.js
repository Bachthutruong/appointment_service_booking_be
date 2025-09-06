"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
router.get('/', productController_1.getProducts);
router.get('/stock-movements', productController_1.getAllStockMovements);
router.get('/:id', productController_1.getProduct);
router.get('/:id/stock-history', productController_1.getProductStockHistory);
router.post('/', auth_1.adminOnly, productController_1.createProduct);
router.put('/:id', auth_1.adminOnly, productController_1.updateProduct);
router.post('/:id/stock/add', auth_1.adminOnly, productController_1.addStock);
router.post('/:id/stock/adjust', auth_1.adminOnly, productController_1.adjustStock);
router.delete('/:id', auth_1.adminOnly, productController_1.deleteProduct);
exports.default = router;
//# sourceMappingURL=productRoutes.js.map