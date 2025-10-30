import { Response } from 'express';
import { Service } from '../models/Service';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment';
import { Order } from '../models/Order';
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

// @desc    Get service statistics (bookings, revenue, rating) within a period
// @route   GET /api/services/:id/stats?mode=this_month|custom&month=MM&year=YYYY&startDate&endDate
// @access  Private
export const getServiceStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { mode = 'this_month', month, year, startDate, endDate } = req.query as Record<string, string>;

  // Validate service exists
  const exists = await Service.exists({ _id: id });
  if (!exists) return res.status(404).json({ message: 'Service not found' });

  // Resolve time range
  let rangeStart: Date | undefined;
  let rangeEnd: Date | undefined;

  if (startDate || endDate) {
    rangeStart = startDate ? new Date(startDate) : undefined;
    rangeEnd = endDate ? new Date(endDate) : undefined;
  } else if (mode === 'custom' && month && year) {
    const y = Number(year);
    const m = Number(month) - 1; // JS month 0-11
    rangeStart = new Date(y, m, 1, 0, 0, 0, 0);
    rangeEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
  } else {
    // default: this month
    const now = new Date();
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const createdAtMatch: any = {};
  if (rangeStart) createdAtMatch.$gte = rangeStart;
  if (rangeEnd) createdAtMatch.$lte = rangeEnd;

  // Bookings count from appointments
  const apptMatch: any = { service: new mongoose.Types.ObjectId(id) };
  if (rangeStart || rangeEnd) apptMatch.startTime = { ...createdAtMatch };
  const totalBookings = await Appointment.countDocuments({
    ...apptMatch,
    status: { $in: ['booked', 'completed'] }
  });

  // Revenue from orders containing this service
  const revenueAgg = await Order.aggregate([
    ...(rangeStart || rangeEnd ? [{ $match: { createdAt: createdAtMatch } }] : []),
    { $unwind: '$items' },
    { $match: { 'items.type': 'service', 'items.item': new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$items.totalPrice' },
        itemCount: { $sum: '$items.quantity' }
      }
    }
  ]);

  // Placeholder rating (not implemented)
  const averageRating = 0;

  res.json({
    success: true,
    stats: {
      totalBookings,
      totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      averageRating
    },
    range: { start: rangeStart, end: rangeEnd }
  });
});

