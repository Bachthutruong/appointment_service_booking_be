import { Response } from 'express';
import { Product } from '../models/Product';
import { StockMovement } from '../models/StockMovement';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import mongoose from 'mongoose';
import { Order } from '../models/Order';

// @desc    Get all products
// @route   GET /api/products
// @access  Private
export const getProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { isActive, lowStock, categoryId } = req.query;
  
  let query: any = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (lowStock === 'true') {
    query.$expr = { $lte: ['$currentStock', '$minStockAlert'] };
  }

  if (categoryId) {
    query.category = categoryId;
  }

  const products = await Product.find(query)
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
export const getProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id)
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
export const getProductStockHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, page = 1, limit = 20 } = req.query;
  
  let query: any = { product: req.params.id };
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const movements = await StockMovement.find(query)
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await StockMovement.countDocuments(query);

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
export const getAllStockMovements = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, productId, type, page = 1, limit = 50 } = req.query;
  
  let query: any = {};
  
  if (productId) {
    query.product = productId;
  }
  
  if (type) {
    query.type = type;
  }
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }

  const movements = await StockMovement.find(query)
    .populate('product', 'name unit')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await StockMovement.countDocuments(query);

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
export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, sellingPrice, costPrice, unit, minStockAlert, category, isActive, isDiscontinued } = req.body;

  const product = await Product.create({
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

  const populatedProduct = await Product.findById(product._id).populate('category', 'name');

  res.status(201).json({
    success: true,
    product: populatedProduct
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, sellingPrice, costPrice, unit, minStockAlert, category, isActive, isDiscontinued } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, description, sellingPrice, costPrice, unit, minStockAlert, category, isActive, isDiscontinued },
    { new: true, runValidators: true }
  ).populate('category', 'name');

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Auto toggle discontinue if out of stock
  if (product.currentStock === 0) {
    if (product.isActive) product.isActive = false;
    if (!product.isDiscontinued) product.isDiscontinued = true;
    await product.save();
  }

  res.json({
    success: true,
    product
  });
});

// @desc    Add stock (stock in)
// @route   POST /api/products/:id/stock/add
// @access  Private/Admin
export const addStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantity, reason, notes } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Update product stock
  product.currentStock += Number(quantity);
  await product.save();

  // Create stock movement record
  await StockMovement.create({
    product: productId,
    type: 'in',
    quantity: Number(quantity),
    reason,
    notes,
    createdBy: req.user!._id
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
export const adjustStock = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { quantity, reason, notes } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Update product stock
  const oldStock = product.currentStock;
  product.currentStock = Math.max(0, oldStock + Number(quantity));
  await product.save();

  // Create stock movement record
  await StockMovement.create({
    product: productId,
    type: 'adjustment',
    quantity: Number(quantity),
    reason,
    notes,
    createdBy: req.user!._id
  });

  // Auto toggle discontinue if out of stock after adjustment
  if (product.currentStock === 0) {
    if (product.isActive) product.isActive = false;
    if (!product.isDiscontinued) product.isDiscontinued = true;
    await product.save();
  }

  res.json({
    success: true,
    message: 'Stock adjusted successfully',
    product
  });
});

// @desc    Get product statistics (sold quantity, revenue) within a period
// @route   GET /api/products/:id/stats?mode=this_month|custom&month=MM&year=YYYY&startDate&endDate
// @access  Private
export const getProductStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { mode = 'this_month', month, year, startDate, endDate } = req.query as Record<string, string>;

  // Ensure product exists
  const exists = await Product.exists({ _id: id });
  if (!exists) return res.status(404).json({ message: 'Product not found' });

  // Resolve time range
  let rangeStart: Date | undefined;
  let rangeEnd: Date | undefined;

  if (startDate || endDate) {
    rangeStart = startDate ? new Date(startDate) : undefined;
    rangeEnd = endDate ? new Date(endDate) : undefined;
  } else if (mode === 'custom' && month && year) {
    const y = Number(year);
    const m = Number(month) - 1;
    rangeStart = new Date(y, m, 1, 0, 0, 0, 0);
    rangeEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
  } else {
    const now = new Date();
    rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  const createdAtMatch: any = {};
  if (rangeStart) createdAtMatch.$gte = rangeStart;
  if (rangeEnd) createdAtMatch.$lte = rangeEnd;

  const agg = await Order.aggregate([
    ...(rangeStart || rangeEnd ? [{ $match: { createdAt: createdAtMatch } }] : []),
    { $unwind: '$items' },
    { $match: { 'items.type': 'product', 'items.item': new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$items.totalPrice' },
        totalSold: { $sum: '$items.quantity' }
      }
    }
  ]);

  res.json({
    success: true,
    stats: {
      totalRevenue: agg[0]?.totalRevenue || 0,
      totalSold: agg[0]?.totalSold || 0
    },
    range: { start: rangeStart, end: rangeEnd }
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

