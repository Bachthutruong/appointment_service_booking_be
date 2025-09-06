"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getService = exports.getServices = void 0;
const Service_1 = require("../models/Service");
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
//# sourceMappingURL=serviceController.js.map