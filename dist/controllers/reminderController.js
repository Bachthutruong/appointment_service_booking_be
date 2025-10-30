"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReminder = exports.skipReminder = exports.completeReminder = exports.updateReminder = exports.createReminderFromOrder = exports.createReminder = exports.getReminder = exports.getWeekReminders = exports.getTodayReminders = exports.getReminders = void 0;
const Reminder_1 = require("../models/Reminder");
const errorHandler_1 = require("../middleware/errorHandler");
// @desc    Get reminders
// @route   GET /api/reminders
// @access  Private
exports.getReminders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate, status = 'pending', customerId, page = 1, limit = 20 } = req.query;
    let query = {};
    // Date range filter
    if (startDate || endDate) {
        query.reminderDate = {};
        if (startDate)
            query.reminderDate.$gte = new Date(startDate);
        if (endDate)
            query.reminderDate.$lte = new Date(endDate);
    }
    // Status filter (support multi-status comma separated)
    if (status && status !== 'all') {
        const s = String(status);
        if (s.includes(',')) {
            query.status = { $in: s.split(',').map(v => v.trim()).filter(Boolean) };
        }
        else {
            query.status = s;
        }
    }
    // Customer filter
    if (customerId) {
        query.customer = customerId;
    }
    const reminders = await Reminder_1.Reminder.find(query)
        .populate('customer', 'name phone')
        .populate('createdBy', 'name')
        .populate('orderId', 'totalAmount createdAt')
        .sort({ reminderDate: 1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    const total = await Reminder_1.Reminder.countDocuments(query);
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
exports.getTodayReminders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const reminders = await Reminder_1.Reminder.find({
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
exports.getWeekReminders = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const reminders = await Reminder_1.Reminder.find({
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
    }, {});
    res.json({
        success: true,
        reminders: groupedReminders
    });
});
// @desc    Get reminder by ID
// @route   GET /api/reminders/:id
// @access  Private
exports.getReminder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const reminder = await Reminder_1.Reminder.findById(req.params.id)
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
exports.createReminder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { customer, reminderDate, content, orderId } = req.body;
    const reminder = await Reminder_1.Reminder.create({
        customer,
        reminderDate: new Date(reminderDate),
        content,
        orderId,
        createdBy: req.user._id
    });
    const populatedReminder = await Reminder_1.Reminder.findById(reminder._id)
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
exports.createReminderFromOrder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { reminderDate, content } = req.body;
    const orderId = req.params.orderId;
    // Get order to find customer
    const Order = require('../models/Order').Order;
    const order = await Order.findById(orderId).populate('customer');
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }
    const reminder = await Reminder_1.Reminder.create({
        customer: order.customer._id,
        reminderDate: new Date(reminderDate),
        content,
        orderId,
        createdBy: req.user._id
    });
    const populatedReminder = await Reminder_1.Reminder.findById(reminder._id)
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
exports.updateReminder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { customer, reminderDate, content, status } = req.body;
    const updateData = {};
    if (customer)
        updateData.customer = customer;
    if (reminderDate)
        updateData.reminderDate = new Date(reminderDate);
    if (content)
        updateData.content = content;
    if (status) {
        updateData.status = status;
        if (status === 'completed' || status === 'skipped') {
            updateData.completedAt = new Date();
        }
    }
    const reminder = await Reminder_1.Reminder.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
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
exports.completeReminder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const reminder = await Reminder_1.Reminder.findByIdAndUpdate(req.params.id, {
        status: 'completed',
        completedAt: new Date()
    }, { new: true })
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
exports.skipReminder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const reminder = await Reminder_1.Reminder.findByIdAndUpdate(req.params.id, {
        status: 'skipped',
        completedAt: new Date()
    }, { new: true })
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
exports.deleteReminder = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const reminder = await Reminder_1.Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
        return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json({
        success: true,
        message: 'Reminder deleted successfully'
    });
});
//# sourceMappingURL=reminderController.js.map