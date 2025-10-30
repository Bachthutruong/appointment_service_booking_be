import { Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { Service } from '../models/Service';
import { Customer } from '../models/Customer';
import { StockMovement } from '../models/StockMovement';
import { Appointment } from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { uploadToCloudinary } from '../config/cloudinary';

// @desc    Get orders
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { 
    startDate, 
    endDate, 
    customerId, 
    search,
    status,
    page = 1, 
    limit = 20 
  } = req.query;
  
  let query: any = {};
  
  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate as string);
    if (endDate) query.createdAt.$lte = new Date(endDate as string);
  }
  
  // Customer filter
  if (customerId) {
    query.customer = customerId;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Search functionality
  if (search) {
    // Search by customer name or order ID
    const customerQuery = await Customer.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }).select('_id');
    
    const customerIds = customerQuery.map(c => c._id);
    
    query.$or = [
      { _id: { $regex: search, $options: 'i' } },
      { customer: { $in: customerIds } }
    ];
  }

  const orders = await Order.find(query)
    .populate('customer', 'name phone')
    .populate('createdBy', 'name')
    .populate('appointmentId', 'startTime status')
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Order.countDocuments(query);

  // Convert to plain objects and manually populate items
  const plainOrders = await Promise.all(orders.map(async (order) => {
    const orderObj = order.toObject();
    
    // Manually populate items
    const populatedItems = [];
    for (const item of order.items) {
      console.log('Processing item:', item); // Debug log
      const itemObj = JSON.parse(JSON.stringify(item)); // Convert to plain object
      
      if (item.type === 'product') {
        const product = await Product.findById(item.item).select('name');
        console.log('Found product:', product); // Debug log
        populatedItems.push({
          type: itemObj.type,
          quantity: itemObj.quantity,
          unitPrice: itemObj.unitPrice,
          totalPrice: itemObj.totalPrice,
          _id: itemObj._id,
          item: {
            name: product?.name || 'Sản phẩm không tìm thấy'
          }
        });
      } else if (item.type === 'service') {
        const service = await Service.findById(item.item).select('name');
        console.log('Found service:', service); // Debug log
        populatedItems.push({
          type: itemObj.type,
          quantity: itemObj.quantity,
          unitPrice: itemObj.unitPrice,
          totalPrice: itemObj.totalPrice,
          _id: itemObj._id,
          item: {
            name: service?.name || 'Dịch vụ không tìm thấy'
          }
        });
      }
    }
    
    console.log('Populated items for order:', order._id, populatedItems); // Debug log
    
    return {
      ...orderObj,
      items: populatedItems
    };
  }));

  console.log('Orders before response:', plainOrders.map(o => ({ 
    _id: o._id, 
    items: o.items 
  }))); // Debug log

  res.json({
    success: true,
    orders: plainOrders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name phone lineId gender dateOfBirth')
    .populate('createdBy', 'name')
    .populate('appointmentId', 'startTime endTime status');
  
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Convert to plain object and manually populate items
  const orderObj = order.toObject();
  
  // Manually populate items
  const populatedItems = [];
  for (const item of order.items) {
    console.log('Processing item in getOrder:', item); // Debug log
    const itemObj = JSON.parse(JSON.stringify(item)); // Convert to plain object
    
    if (item.type === 'product') {
      const product = await Product.findById(item.item).select('name');
      console.log('Found product in getOrder:', product); // Debug log
      populatedItems.push({
        type: itemObj.type,
        quantity: itemObj.quantity,
        unitPrice: itemObj.unitPrice,
        totalPrice: itemObj.totalPrice,
        _id: itemObj._id,
        item: {
          name: product?.name || 'Sản phẩm không tìm thấy'
        }
      });
    } else if (item.type === 'service') {
      const service = await Service.findById(item.item).select('name');
      console.log('Found service in getOrder:', service); // Debug log
      populatedItems.push({
        type: itemObj.type,
        quantity: itemObj.quantity,
        unitPrice: itemObj.unitPrice,
        totalPrice: itemObj.totalPrice,
        _id: itemObj._id,
        item: {
          name: service?.name || 'Dịch vụ không tìm thấy'
        }
      });
    }
  }
  
  console.log('Populated items for order in getOrder:', order._id, populatedItems); // Debug log
  
  const populatedOrder = {
    ...orderObj,
    items: populatedItems
  };

  res.json({
    success: true,
    order: populatedOrder
  });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { 
    customer, 
    items, 
    discountType = 'none', 
    discountValue = 0, 
    shippingFee = 0,
    appointmentId 
  } = req.body;

  // Calculate subtotal
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const { type, item: itemId, quantity, unitPrice } = item;
    const totalPrice = quantity * unitPrice;
    subtotal += totalPrice;

    processedItems.push({
      type,
      item: itemId,
      quantity,
      unitPrice,
      totalPrice
    });
  }

  // Calculate discount
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === 'fixed') {
    discountAmount = discountValue;
  }

  const totalAmount = subtotal - discountAmount + shippingFee;

  const order = await Order.create({
    customer,
    items: processedItems,
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    shippingFee,
    totalAmount,
    appointmentId,
    createdBy: req.user!._id
  });

  // Update product stock and create stock movements
  for (const item of processedItems) {
    if (item.type === 'product') {
      const product = await Product.findById(item.item);
      if (product) {
        product.currentStock = Math.max(0, product.currentStock - item.quantity);
        await product.save();
        if (product.currentStock === 0) {
          if (product.isActive) product.isActive = false;
          if (!product.isDiscontinued) product.isDiscontinued = true;
          await product.save();
        }

        // Create stock movement
        await StockMovement.create({
          product: item.item,
          type: 'out',
          quantity: -item.quantity,
          reason: 'Sale',
          orderId: order._id,
          createdBy: req.user!._id
        });
      }
    }
  }

  // Update appointment if linked
  if (appointmentId) {
    await Appointment.findByIdAndUpdate(appointmentId, {
      orderId: order._id,
      status: 'completed'
    });
  }

  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'name phone')
    .populate('items.item', 'name price')
    .populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    order: populatedOrder
  });
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
export const updateOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { 
    customer, 
    items, 
    discountType, 
    discountValue, 
    shippingFee 
  } = req.body;

  const existingOrder = await Order.findById(req.params.id);
  if (!existingOrder) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Only admin can update orders, employees cannot
  if (req.user!.role === 'employee') {
    return res.status(403).json({ message: 'Employees cannot update orders' });
  }

  // Revert previous stock movements
  for (const item of existingOrder.items) {
    if (item.type === 'product') {
      const product = await Product.findById(item.item);
      if (product) {
        product.currentStock += item.quantity;
        await product.save();
      }
    }
  }

  // Delete previous stock movements
  await StockMovement.deleteMany({ orderId: req.params.id });

  // Calculate new totals
  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const { type, item: itemId, quantity, unitPrice } = item;
    const totalPrice = quantity * unitPrice;
    subtotal += totalPrice;

    processedItems.push({
      type,
      item: itemId,
      quantity,
      unitPrice,
      totalPrice
    });
  }

  // Calculate discount
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === 'fixed') {
    discountAmount = discountValue;
  }

  const totalAmount = subtotal - discountAmount + shippingFee;

  // Update order
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      customer,
      items: processedItems,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      shippingFee,
      totalAmount
    },
    { new: true, runValidators: true }
  );

  // Update product stock and create new stock movements
  for (const item of processedItems) {
    if (item.type === 'product') {
      const product = await Product.findById(item.item);
      if (product) {
        product.currentStock = Math.max(0, product.currentStock - item.quantity);
        await product.save();
        if (product.currentStock === 0) {
          if (product.isActive) product.isActive = false;
          if (!product.isDiscontinued) product.isDiscontinued = true;
          await product.save();
        }

        // Create stock movement
        await StockMovement.create({
          product: item.item,
          type: 'out',
          quantity: -item.quantity,
          reason: 'Sale (Updated)',
          orderId: updatedOrder!._id,
          createdBy: req.user!._id
        });
      }
    }
  }

  const populatedOrder = await Order.findById(updatedOrder!._id)
    .populate('customer', 'name phone')
    .populate('items.item', 'name price')
    .populate('createdBy', 'name');

  res.json({
    success: true,
    order: populatedOrder
  });
});

// @desc    Upload images to order
// @route   POST /api/orders/:id/images
// @access  Private
export const uploadOrderImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ message: 'No images uploaded' });
  }

  const files = req.files as Express.Multer.File[];
  const imageUrls = [];

  for (const file of files) {
    try {
      const imageUrl = await uploadToCloudinary(file);
      imageUrls.push(imageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  // Add new images to existing ones
  order.images = [...(order.images || []), ...imageUrls];
  await order.save();

  res.json({
    success: true,
    images: imageUrls,
    order
  });
});

// @desc    Delete order (admin only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Revert stock movements
  for (const item of order.items) {
    if (item.type === 'product') {
      const product = await Product.findById(item.item);
      if (product) {
        product.currentStock += item.quantity;
        await product.save();
      }
    }
  }

  // Delete stock movements
  await StockMovement.deleteMany({ orderId: req.params.id });

  // Update appointment if linked
  if (order.appointmentId) {
    await Appointment.findByIdAndUpdate(order.appointmentId, {
      $unset: { orderId: 1 },
      status: 'booked'
    });
  }

  await Order.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
export const updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  res.json({
    success: true,
    order
  });
});

