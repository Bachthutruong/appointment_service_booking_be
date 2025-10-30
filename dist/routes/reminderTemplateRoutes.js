"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const reminderTemplateController_1 = require("../controllers/reminderTemplateController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', reminderTemplateController_1.getTemplates);
router.post('/', auth_1.adminOnly, reminderTemplateController_1.createTemplate);
router.put('/:id', auth_1.adminOnly, reminderTemplateController_1.updateTemplate);
router.delete('/:id', auth_1.adminOnly, reminderTemplateController_1.deleteTemplate);
exports.default = router;
//# sourceMappingURL=reminderTemplateRoutes.js.map