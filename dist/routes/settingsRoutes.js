"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingsController_1 = require("../controllers/settingsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes (if needed)
// router.get('/public', getPublicSettings);
// Protected routes
router.get('/', auth_1.authenticate, settingsController_1.getSettings);
router.put('/', auth_1.authenticate, auth_1.adminOnly, settingsController_1.updateSettings);
router.post('/reset', auth_1.authenticate, auth_1.adminOnly, settingsController_1.resetSettings);
exports.default = router;
//# sourceMappingURL=settingsRoutes.js.map