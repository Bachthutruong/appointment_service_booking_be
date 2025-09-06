"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const categoryController_1 = require("../controllers/categoryController");
const router = express_1.default.Router();
// All routes are protected
router.use(auth_1.authenticate);
// Category routes
router.route('/')
    .get(categoryController_1.getCategories)
    .post(categoryController_1.createCategory);
router.route('/:id')
    .get(categoryController_1.getCategory)
    .put(categoryController_1.updateCategory)
    .delete(categoryController_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=categoryRoutes.js.map