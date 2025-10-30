import { Response } from 'express';
import { Reminder } from '../models/Reminder';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Get reminders
// @route   GET /api/reminders
// @access  Private
export const getReminders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { 
    startDate, 
    endDate, 
    status = 'pending',
    customerId,
    page = 1, 
    limit = 20 
  } = req.query;
  
  let query: any = {};
  
  // Date range filter
  if (startDate || endDate) {
    query.reminderDate = {};
    if (startDate) query.reminderDate.$gte = new Date(startDate as string);
    if (endDate) query.reminderDate.$lte = new Date(endDate as string);
  }
  
  // Status filter (support multi-status comma separated)
  if (status && status !== 'all') {
    const s = String(status)
    if (s.includes(',')) {
      query.status = { $in: s.split(',').map(v => v.trim()).filter(Boolean) };
    } else {
      query.status = s;
    }
  }
  
  // Customer filter
  if (customerId) {
    query.customer = customerId;
  }

  const reminders = await Reminder.find(query)
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt')
    .sort({ reminderDate: 1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Reminder.countDocuments(query);

  res.json({
    success: true,
    reminders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get reminders for today
// @route   GET /api/reminders/today
// @access  Private
export const getTodayReminders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const reminders = await Reminder.find({
    reminderDate: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: 'pending'
  })
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt')
    .sort({ reminderDate: 1 });

  res.json({
    success: true,
    reminders
  });
});

// @desc    Get reminders for this week
// @route   GET /api/reminders/week
// @access  Private
export const getWeekReminders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const reminders = await Reminder.find({
    reminderDate: {
      $gte: startOfWeek,
      $lte: endOfWeek
    },
    status: 'pending'
  })
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt')
    .sort({ reminderDate: 1 });

  // Group by date
  const groupedReminders = reminders.reduce((acc, reminder) => {
    const date = reminder.reminderDate.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(reminder);
    return acc;
  }, {} as Record<string, typeof reminders>);

  res.json({
    success: true,
    reminders: groupedReminders
  });
});

// @desc    Get reminder by ID
// @route   GET /api/reminders/:id
// @access  Private
export const getReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.findById(req.params.id)
    .populate('customer', 'name phone lineId gender dateOfBirth')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt items');
  
  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' });
  }

  res.json({
    success: true,
    reminder
  });
});

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
export const createReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { customer, reminderDate, content, orderId } = req.body;

  const reminder = await Reminder.create({
    customer,
    reminderDate: new Date(reminderDate),
    content,
    orderId,
    createdBy: req.user!._id
  });

  const populatedReminder = await Reminder.findById(reminder._id)
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt');

  res.status(201).json({
    success: true,
    reminder: populatedReminder
  });
});

// @desc    Create reminder from order completion
// @route   POST /api/reminders/from-order/:orderId
// @access  Private
export const createReminderFromOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reminderDate, content } = req.body;
  const orderId = req.params.orderId;

  // Get order to find customer
  const Order = require('../models/Order').Order;
  const order = await Order.findById(orderId).populate('customer');
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const reminder = await Reminder.create({
    customer: order.customer._id,
    reminderDate: new Date(reminderDate),
    content,
    orderId,
    createdBy: req.user!._id
  });

  const populatedReminder = await Reminder.findById(reminder._id)
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt');

  res.status(201).json({
    success: true,
    reminder: populatedReminder
  });
});

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
export const updateReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { customer, reminderDate, content, status } = req.body;

  const updateData: any = {};
  if (customer) updateData.customer = customer;
  if (reminderDate) updateData.reminderDate = new Date(reminderDate);
  if (content) updateData.content = content;
  if (status) {
    updateData.status = status;
    if (status === 'completed' || status === 'skipped') {
      updateData.completedAt = new Date();
    }
  }

  const reminder = await Reminder.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt');

  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' });
  }

  res.json({
    success: true,
    reminder
  });
});

// @desc    Mark reminder as completed
// @route   PUT /api/reminders/:id/complete
// @access  Private
export const completeReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'completed',
      completedAt: new Date()
    },
    { new: true }
  )
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt');

  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' });
  }

  res.json({
    success: true,
    reminder
  });
});

// @desc    Mark reminder as skipped
// @route   PUT /api/reminders/:id/skip
// @access  Private
export const skipReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.findByIdAndUpdate(
    req.params.id,
    { 
      status: 'skipped',
      completedAt: new Date()
    },
    { new: true }
  )
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount createdAt');

  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' });
  }

  res.json({
    success: true,
    reminder
  });
});

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
export const deleteReminder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reminder = await Reminder.findByIdAndDelete(req.params.id);

  if (!reminder) {
    return res.status(404).json({ message: 'Reminder not found' });
  }

  res.json({
    success: true,
    message: 'Reminder deleted successfully'
  });
});
