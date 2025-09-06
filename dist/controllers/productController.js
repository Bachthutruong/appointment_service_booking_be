"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.adjustStock = exports.addStock = exports.updateProduct = exports.createProduct = exports.getAllStockMovements = exports.getProductStockHistory = exports.getProduct = exports.getProducts = void 0;
const Product_1 = require("../models/Product");
const StockMovement_1 = require("../models/StockMovement");
const errorHandler_1 = require("../middleware/errorHandler");
// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { isActive, lowStock } = req.query;
    let query = {};
    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }
    if (lowStock === 'true') {
        query.$expr = { $lte: ['$currentStock', '$minStockAlert'] };
    }
    const products = await Product_1.Product.find(query)
        .populate('category', 'name')
        .sort({ name: 1 });
    res.json({
        success: true,
        products
    });
});
// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const product = await Product_1.Product.findById(req.params.id)
        .populate('category', 'name description');
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
        success: true,
        product
    });
});
// @desc    Get product stock history
// @route   GET /api/products/:id/stock-history
// @access  Private
exports.getProductStockHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    let query = { product: req.params.id };
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate)
            query.createdAt.$gte = new Date(startDate);
        if (endDate)
            query.createdAt.$lte = new Date(endDate);
    }
    const movements = await StockMovement_1.StockMovement.find(query)
        .populate('createdBy', 'name')
        .populate('orderId', 'totalAmount')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    const total = await StockMovement_1.StockMovement.countDocuments(query);
    res.json({
        success: true,
        movements,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    });
});
// @desc    Get all stock movements (for inventory report)
// @route   GET /api/products/stock-movements
// @access  Private
exports.getAllStockMovements = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate, productId, type, page = 1, limit = 50 } = req.query;
    let query = {};
    if (productId) {
        query.product = productId;
    }
    if (type) {
        query.type = type;
    }
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate)
            query.createdAt.$gte = new Date(startDate);
        if (endDate)
            query.createdAt.$lte = new Date(endDate);
    }
    const movements = await StockMovement_1.StockMovement.find(query)
        .populate('product', 'name unit')
        .populate('createdBy', 'name')
        .populate('orderId', 'totalAmount')
        .sort({ createdAt: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));
    const total = await StockMovement_1.StockMovement.countDocuments(query);
    res.json({
        success: true,
        movements,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
        }
    });
});
// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, sellingPrice, costPrice, unit, minStockAlert, category, isActive, isDiscontinued } = req.body;
    const product = await Product_1.Product.create({
        name,
        description,
        sellingPrice,
        costPrice,
        unit,
        minStockAlert: minStockAlert || 10,
        category,
        isActive: isActive !== undefined ? isActive : true,
        isDiscontinued: isDiscontinued || false
    });
    const populatedProduct = await Product_1.Product.findById(product._id).populate('category', 'name');
    res.status(201).json({
        success: true,
        product: populatedProduct
    });
});
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, description, sellingPrice, costPrice, unit, minStockAlert, category, isActive, isDiscontinued } = req.body;
    const product = await Product_1.Product.findByIdAndUpdate(req.params.id, { name, description, sellingPrice, costPrice, unit, minStockAlert, category, isActive, isDiscontinued }, { new: true, runValidators: true }).populate('category', 'name');
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
        success: true,
        product
    });
});
// @desc    Add stock (stock in)
// @route   POST /api/products/:id/stock/add
// @access  Private/Admin
exports.addStock = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { quantity, reason, notes } = req.body;
    const productId = req.params.id;
    const product = await Product_1.Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    // Update product stock
    product.currentStock += Number(quantity);
    await product.save();
    // Create stock movement record
    await StockMovement_1.StockMovement.create({
        product: productId,
        type: 'in',
        quantity: Number(quantity),
        reason,
        notes,
        createdBy: req.user._id
    });
    res.json({
        success: true,
        message: 'Stock added successfully',
        product
    });
});
// @desc    Adjust stock (manual adjustment)
// @route   POST /api/products/:id/stock/adjust
// @access  Private/Admin
exports.adjustStock = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { quantity, reason, notes } = req.body;
    const productId = req.params.id;
    const product = await Product_1.Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    // Update product stock
    const oldStock = product.currentStock;
    product.currentStock = Math.max(0, oldStock + Number(quantity));
    await product.save();
    // Create stock movement record
    await StockMovement_1.StockMovement.create({
        product: productId,
        type: 'adjustment',
        quantity: Number(quantity),
        reason,
        notes,
        createdBy: req.user._id
    });
    res.json({
        success: true,
        message: 'Stock adjusted successfully',
        product
    });
});
// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const product = await Product_1.Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});
//# sourceMappingURL=productController.js.map