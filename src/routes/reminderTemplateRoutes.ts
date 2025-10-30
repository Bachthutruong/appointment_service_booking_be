import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { createTemplate, deleteTemplate, getTemplates, updateTemplate } from '../controllers/reminderTemplateController';

const router = Router();

router.use(authenticate);

router.get('/', getTemplates);
router.post('/', adminOnly, createTemplate);
router.put('/:id', adminOnly, updateTemplate);
router.delete('/:id', adminOnly, deleteTemplate);

export default router;


