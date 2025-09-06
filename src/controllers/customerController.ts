import { Response } from 'express';
import { Customer } from '../models/Customer';
import { Order } from '../models/Order';
import { Appointment } from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, gender, page = 1, limit = 10 } = req.query;
  
  let query: any = {};
  
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

  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  // Get order counts for each customer
  const customersWithStats = await Promise.all(
    customers.map(async (customer) => {
      const orderCount = await Order.countDocuments({ customer: customer._id });
      const appointmentCount = await Appointment.countDocuments({ customer: customer._id });
      
      return {
        ...customer.toObject(),
        totalOrders: orderCount,
        totalAppointments: appointmentCount
      };
    })
  );

  const total = await Customer.countDocuments(query);

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
export const getCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await Customer.findById(req.params.id);
  
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
export const getCustomerHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customerId = req.params.id;
  
  // Get appointments history
  const appointments = await Appointment.find({ customer: customerId })
    .populate('service', 'name price duration')
    .sort({ startTime: -1 });

  // Get orders history
  const orders = await Order.find({ customer: customerId })
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
export const createCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, email, lineId, gender, dateOfBirth, notes } = req.body;

  // Check if phone already exists
  const existingCustomer = await Customer.findOne({ phone });
  if (existingCustomer) {
    return res.status(400).json({ message: 'Phone number already exists' });
  }

  // Check if email already exists (if provided)
  if (email) {
    const existingEmailCustomer = await Customer.findOne({ email });
    if (existingEmailCustomer) {
      return res.status(400).json({ message: 'Email already exists' });
    }
  }

  const customer = await Customer.create({
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
export const updateCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, phone, email, lineId, gender, dateOfBirth, notes } = req.body;
  
  // Check if phone already exists for other customers
  if (phone) {
    const existingCustomer = await Customer.findOne({ 
      phone, 
      _id: { $ne: req.params.id } 
    });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Phone number already exists' });
    }
  }

  // Check if email already exists for other customers (if provided)
  if (email) {
    const existingEmailCustomer = await Customer.findOne({ 
      email, 
      _id: { $ne: req.params.id } 
    });
    if (existingEmailCustomer) {
      return res.status(400).json({ message: 'Email already exists' });
    }
  }

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name,
      phone,
      email,
      lineId,
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      notes
    },
    { new: true, runValidators: true }
  );

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
export const deleteCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }

  // Check if customer has orders or appointments
  const hasOrders = await Order.countDocuments({ customer: req.params.id });
  const hasAppointments = await Appointment.countDocuments({ customer: req.params.id });

  if (hasOrders > 0 || hasAppointments > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete customer with existing orders or appointments' 
    });
  }

  await Customer.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Customer deleted successfully'
  });
});

// @desc    Search customers by birthday month
// @route   GET /api/customers/birthday/:month
// @access  Private
export const getCustomersByBirthMonth = asyncHandler(async (req: AuthRequest, res: Response) => {
  const month = parseInt(req.params.month);
  
  if (month < 1 || month > 12) {
    return res.status(400).json({ message: 'Invalid month' });
  }

  const customers = await Customer.find({
    $expr: {
      $eq: [{ $month: '$dateOfBirth' }, month]
    }
  }).sort({ name: 1 });

  res.json({
    success: true,
    customers
  });
});

