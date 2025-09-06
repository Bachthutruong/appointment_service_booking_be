import { Response } from 'express';
import { Service } from '../models/Service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Get all services
// @route   GET /api/services
// @access  Private
export const getServices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive } = req.query;
  
  let query: any = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const services = await Service.find(query).sort({ name: 1 });

  res.json({
    success: true,
    services
  });
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Private
export const getService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  res.json({
    success: true,
    service
  });
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
export const createService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, price, duration } = req.body;

  const service = await Service.create({
    name,
    description,
    price,
    duration
  });

  res.status(201).json({
    success: true,
    service
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, price, duration, isActive } = req.body;

  const service = await Service.findByIdAndUpdate(
    req.params.id,
    { name, description, price, duration, isActive },
    { new: true, runValidators: true }
  );

  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  res.json({
    success: true,
    service
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }

  res.json({
    success: true,
    message: 'Service deleted successfully'
  });
});

