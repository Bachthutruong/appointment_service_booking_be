"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomersByBirthMonth = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerHistory = exports.getCustomer = exports.getCustomers = void 0;
const Customer_1 = require("../models/Customer");
const Order_1 = require("../models/Order");
const Appointment_1 = require("../models/Appointment");
const errorHandler_1 = require("../middleware/errorHandler");
// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { search, gender, page = 1, limit = 10 } = req.query;
    let query = {};
    // Search functionality
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { notes: { $regex: search, $options: 'i' } }
        ];
    }
    if (gender) {
        query.gender = gender;
    }
    const customers = await Customer_1.Customer.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    // Get order counts for each customer
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
        const orderCount = await Order_1.Order.countDocuments({ customer: customer._id });
        const appointmentCount = await Appointment_1.Appointment.countDocuments({ customer: customer._id });
        return {
            ...customer.toObject(),
            totalOrders: orderCount,
            totalAppointments: appointmentCount
        };
    }));
    const total = await Customer_1.Customer.countDocuments(query);
    res.json({
        success: true,
        customers: customersWithStats,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    });
});
// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customer = await Customer_1.Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({
        success: true,
        customer
    });
});
// @desc    Get customer history
// @route   GET /api/customers/:id/history
// @access  Private
exports.getCustomerHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customerId = req.params.id;
    // Get appointments history
    const appointments = await Appointment_1.Appointment.find({ customer: customerId })
        .populate('service', 'name price duration')
        .sort({ startTime: -1 });
    // Get orders history
    const orders = await Order_1.Order.find({ customer: customerId })
        .populate('items.item', 'name price')
        .sort({ createdAt: -1 });
    // Calculate total spent
    const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    res.json({
        success: true,
        history: {
            appointments,
            orders,
            totalSpent
        }
    });
});
// @desc    Create customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, phone, email, lineId, gender, dateOfBirth, notes } = req.body;
    // Check if phone already exists
    const existingCustomer = await Customer_1.Customer.findOne({ phone });
    if (existingCustomer) {
        return res.status(400).json({ message: 'Phone number already exists' });
    }
    // Check if email already exists (if provided)
    if (email) {
        const existingEmailCustomer = await Customer_1.Customer.findOne({ email });
        if (existingEmailCustomer) {
            return res.status(400).json({ message: 'Email already exists' });
        }
    }
    const customer = await Customer_1.Customer.create({
        name,
        phone,
        email,
        lineId,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        notes
    });
    res.status(201).json({
        success: true,
        customer
    });
});
// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, phone, email, lineId, gender, dateOfBirth, notes } = req.body;
    // Check if phone already exists for other customers
    if (phone) {
        const existingCustomer = await Customer_1.Customer.findOne({
            phone,
            _id: { $ne: req.params.id }
        });
        if (existingCustomer) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }
    }
    // Check if email already exists for other customers (if provided)
    if (email) {
        const existingEmailCustomer = await Customer_1.Customer.findOne({
            email,
            _id: { $ne: req.params.id }
        });
        if (existingEmailCustomer) {
            return res.status(400).json({ message: 'Email already exists' });
        }
    }
    const customer = await Customer_1.Customer.findByIdAndUpdate(req.params.id, {
        name,
        phone,
        email,
        lineId,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        notes
    }, { new: true, runValidators: true });
    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({
        success: true,
        customer
    });
});
// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
exports.deleteCustomer = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const customer = await Customer_1.Customer.findById(req.params.id);
    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }
    // Check if customer has orders or appointments
    const hasOrders = await Order_1.Order.countDocuments({ customer: req.params.id });
    const hasAppointments = await Appointment_1.Appointment.countDocuments({ customer: req.params.id });
    if (hasOrders > 0 || hasAppointments > 0) {
        return res.status(400).json({
            message: 'Cannot delete customer with existing orders or appointments'
        });
    }
    await Customer_1.Customer.findByIdAndDelete(req.params.id);
    res.json({
        success: true,
        message: 'Customer deleted successfully'
    });
});
// @desc    Search customers by birthday month
// @route   GET /api/customers/birthday/:month
// @access  Private
exports.getCustomersByBirthMonth = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const month = parseInt(req.params.month);
    if (month < 1 || month > 12) {
        return res.status(400).json({ message: 'Invalid month' });
    }
    const customers = await Customer_1.Customer.find({
        $expr: {
            $eq: [{ $month: '$dateOfBirth' }, month]
        }
    }).sort({ name: 1 });
    res.json({
        success: true,
        customers
    });
});
//# sourceMappingURL=customerController.js.map