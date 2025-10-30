"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceStats = exports.deleteService = exports.updateService = exports.createService = exports.getService = exports.getServices = void 0;
const Service_1 = require("../models/Service");
const mongoose_1 = __importDefault(require("mongoose"));
const Appointment_1 = require("../models/Appointment");
const Order_1 = require("../models/Order");
const errorHandler_1 = require("../middleware/errorHandler");
// @desc    Get all services
// @route   GET /api/services
// @access  Private
exports.getServices = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { isActive } = req.query;
    let query = {};
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }
    const services = await Service_1.Service.find(query).sort({ name: 1 });
    res.json({
        success: true,
        services
    });
});
// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Private
exports.getService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const service = await Service_1.Service.findById(req.params.id);
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
exports.createService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, price, duration } = req.body;
    const service = await Service_1.Service.create({
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
exports.updateService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, price, duration, isActive } = req.body;
    const service = await Service_1.Service.findByIdAndUpdate(req.params.id, { name, description, price, duration, isActive }, { new: true, runValidators: true });
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
exports.deleteService = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const service = await Service_1.Service.findByIdAndDelete(req.params.id);
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
exports.getServiceStats = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { mode = 'this_month', month, year, startDate, endDate } = req.query;
    // Validate service exists
    const exists = await Service_1.Service.exists({ _id: id });
    if (!exists)
        return res.status(404).json({ message: 'Service not found' });
    // Resolve time range
    let rangeStart;
    let rangeEnd;
    if (startDate || endDate) {
        rangeStart = startDate ? new Date(startDate) : undefined;
        rangeEnd = endDate ? new Date(endDate) : undefined;
    }
    else if (mode === 'custom' && month && year) {
        const y = Number(year);
        const m = Number(month) - 1; // JS month 0-11
        rangeStart = new Date(y, m, 1, 0, 0, 0, 0);
        rangeEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
    }
    else {
        // default: this month
        const now = new Date();
        rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }
    const createdAtMatch = {};
    if (rangeStart)
        createdAtMatch.$gte = rangeStart;
    if (rangeEnd)
        createdAtMatch.$lte = rangeEnd;
    // Bookings count from appointments
    const apptMatch = { service: new mongoose_1.default.Types.ObjectId(id) };
    if (rangeStart || rangeEnd)
        apptMatch.startTime = { ...createdAtMatch };
    const totalBookings = await Appointment_1.Appointment.countDocuments({
        ...apptMatch,
        status: { $in: ['booked', 'completed'] }
    });
    // Revenue from orders containing this service
    const revenueAgg = await Order_1.Order.aggregate([
        ...(rangeStart || rangeEnd ? [{ $match: { createdAt: createdAtMatch } }] : []),
        { $unwind: '$items' },
        { $match: { 'items.type': 'service', 'items.item': new mongoose_1.default.Types.ObjectId(id) } },
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
//# sourceMappingURL=serviceController.js.map