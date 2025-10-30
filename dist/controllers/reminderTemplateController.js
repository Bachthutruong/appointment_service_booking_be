"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplates = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const ReminderTemplate_1 = require("../models/ReminderTemplate");
// GET /api/reminder-templates
exports.getTemplates = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
    const templates = await ReminderTemplate_1.ReminderTemplate.find().sort({ createdAt: -1 });
    res.json({ success: true, templates });
});
// POST /api/reminder-templates
exports.createTemplate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, content, isActive } = req.body;
    const template = await ReminderTemplate_1.ReminderTemplate.create({ title, content, isActive });
    res.status(201).json({ success: true, template });
});
// PUT /api/reminder-templates/:id
exports.updateTemplate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, content, isActive } = req.body;
    const template = await ReminderTemplate_1.ReminderTemplate.findByIdAndUpdate(req.params.id, { title, content, isActive }, { new: true, runValidators: true });
    if (!template)
        return res.status(404).json({ message: 'Template not found' });
    res.json({ success: true, template });
});
// DELETE /api/reminder-templates/:id
exports.deleteTemplate = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const template = await ReminderTemplate_1.ReminderTemplate.findByIdAndDelete(req.params.id);
    if (!template)
        return res.status(404).json({ message: 'Template not found' });
    res.json({ success: true, message: 'Template deleted' });
});
//# sourceMappingURL=reminderTemplateController.js.map