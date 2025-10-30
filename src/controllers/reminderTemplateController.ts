import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ReminderTemplate } from '../models/ReminderTemplate';

// GET /api/reminder-templates
export const getTemplates = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const templates = await ReminderTemplate.find().sort({ createdAt: -1 });
  res.json({ success: true, templates });
});

// POST /api/reminder-templates
export const createTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, isActive } = req.body;
  const template = await ReminderTemplate.create({ title, content, isActive });
  res.status(201).json({ success: true, template });
});

// PUT /api/reminder-templates/:id
export const updateTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { title, content, isActive } = req.body;
  const template = await ReminderTemplate.findByIdAndUpdate(
    req.params.id,
    { title, content, isActive },
    { new: true, runValidators: true }
  );
  if (!template) return res.status(404).json({ message: 'Template not found' });
  res.json({ success: true, template });
});

// DELETE /api/reminder-templates/:id
export const deleteTemplate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const template = await ReminderTemplate.findByIdAndDelete(req.params.id);
  if (!template) return res.status(404).json({ message: 'Template not found' });
  res.json({ success: true, message: 'Template deleted' });
});


