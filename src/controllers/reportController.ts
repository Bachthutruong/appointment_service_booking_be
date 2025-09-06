import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Service } from '../models/Service';
import { Customer } from '../models/Customer';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Get revenue report
// @route   GET /api/reports/revenue
// @access  Private/Admin
export const getRevenueReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, period = 'day' } = req.query;
  
  let matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
  }

  // Group by period
  let groupId: any;
  switch (period) {
    case 'day':
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      break;
    case 'week':
      groupId = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      break;
    case 'month':
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      break;
    case 'year':
      groupId = {
        year: { $year: '$createdAt' }
      };
      break;
    default:
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
  }

  const revenueData = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: groupId,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
  ]);

  // Get total revenue for the period
  const totalRevenue = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    revenueData,
    summary: totalRevenue[0] || { total: 0, count: 0 }
  });
});

// @desc    Get top selling products/services
// @route   GET /api/reports/top-selling
// @access  Private/Admin
export const getTopSellingReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate, type = 'all', limit = 10 } = req.query;
  
  let matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
  }

  // Filter by type if specified
  let itemsFilter: any = {};
  if (type !== 'all') {
    itemsFilter = { 'items.type': type };
  }

  const topSelling = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    ...(type !== 'all' ? [{ $match: itemsFilter }] : []),
    {
      $group: {
        _id: {
          item: '$items.item',
          type: '$items.type'
        },
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.totalPrice' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id.item',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $lookup: {
        from: 'services',
        localField: '_id.item',
        foreignField: '_id',
        as: 'serviceInfo'
      }
    },
    {
      $addFields: {
        itemInfo: {
          $cond: {
            if: { $eq: ['$_id.type', 'product'] },
            then: { $arrayElemAt: ['$productInfo', 0] },
            else: { $arrayElemAt: ['$serviceInfo', 0] }
          }
        }
      }
    },
    {
      $project: {
        type: '$_id.type',
        name: '$itemInfo.name',
        totalQuantity: 1,
        totalRevenue: 1,
        orderCount: 1,
        averagePrice: { $divide: ['$totalRevenue', '$totalQuantity'] }
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: Number(limit) }
  ]);

  res.json({
    success: true,
    topSelling
  });
});

// @desc    Get customer statistics
// @route   GET /api/reports/customers
// @access  Private/Admin
export const getCustomerReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  
  let matchStage: any = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate as string);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate as string);
  }

  // Total customers
  const totalCustomers = await Customer.countDocuments();
  
  // New customers in period
  const newCustomers = await Customer.countDocuments(matchStage);
  
  // Top spending customers
  const topCustomers = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$customer',
        totalSpent: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customerInfo'
      }
    },
    {
      $project: {
        customer: { $arrayElemAt: ['$customerInfo', 0] },
        totalSpent: 1,
        orderCount: 1,
        averageOrderValue: 1
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]);

  // Customer retention (customers with more than 1 order)
  const retentionData = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$customer',
        orderCount: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        returningCustomers: {
          $sum: {
            $cond: [{ $gt: ['$orderCount', 1] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        totalCustomers: 1,
        returningCustomers: 1,
        retentionRate: {
          $multiply: [
            { $divide: ['$returningCustomers', '$totalCustomers'] },
            100
          ]
        }
      }
    }
  ]);

  res.json({
    success: true,
    totalCustomers,
    newCustomers,
    topCustomers,
    retention: retentionData[0] || { totalCustomers: 0, returningCustomers: 0, retentionRate: 0 }
  });
});

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private/Admin
export const getInventoryReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Low stock products
  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$currentStock', '$minStockAlert'] },
    isActive: true
  }).sort({ currentStock: 1 });

  // Out of stock products
  const outOfStockProducts = await Product.find({
    currentStock: 0,
    isActive: true
  });

  // Total inventory value
  const inventoryValue = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalCostValue: {
          $sum: { $multiply: ['$currentStock', '$costPrice'] }
        },
        totalSellingValue: {
          $sum: { $multiply: ['$currentStock', '$sellingPrice'] }
        },
        totalProducts: { $sum: 1 },
        totalUnits: { $sum: '$currentStock' }
      }
    }
  ]);

  res.json({
    success: true,
    lowStockProducts,
    outOfStockProducts,
    inventoryValue: inventoryValue[0] || {
      totalCostValue: 0,
      totalSellingValue: 0,
      totalProducts: 0,
      totalUnits: 0
    }
  });
});

// @desc    Get dashboard overview
// @route   GET /api/reports/dashboard
// @access  Private/Admin
export const getDashboardOverview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  // Today's stats
  const todayStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    }
  ]);

  // This month's stats
  const monthStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    }
  ]);

  // Total customers
  const totalCustomers = await Customer.countDocuments();
  
  // Low stock alerts
  const lowStockCount = await Product.countDocuments({
    $expr: { $lte: ['$currentStock', '$minStockAlert'] },
    isActive: true
  });

  // Recent orders
  const recentOrders = await Order.find()
    .populate('customer', 'name phone')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('customer totalAmount createdAt');

  res.json({
    success: true,
    today: todayStats[0] || { revenue: 0, orders: 0 },
    thisMonth: monthStats[0] || { revenue: 0, orders: 0 },
    totalCustomers,
    lowStockAlerts: lowStockCount,
    recentOrders
  });
});

