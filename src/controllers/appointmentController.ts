import { Response } from 'express';
import { Appointment } from '../models/Appointment';
import { Service } from '../models/Service';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Get appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { 
    startDate, 
    endDate, 
    status, 
    customerId, 
    view = 'month',
    page = 1, 
    limit = 50 
  } = req.query;
  
  let query: any = {};
  
  // Date range filter
  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) query.startTime.$gte = new Date(startDate as string);
    if (endDate) query.startTime.$lte = new Date(endDate as string);
  }
  
  // Status filter
  if (status) {
    query.status = status;
  }
  
  // Customer filter
  if (customerId) {
    query.customer = customerId;
  }

  const appointments = await Appointment.find(query)
    .populate('customer', 'name phone')
    .populate('service', 'name price duration')
    .populate('createdBy', 'name')
    .populate('orderId', 'totalAmount')
    .sort({ startTime: 1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Appointment.countDocuments(query);

  res.json({
    success: true,
    appointments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('customer', 'name phone lineId gender dateOfBirth notes')
    .populate('service', 'name price duration description')
    .populate('createdBy', 'name')
    .populate('orderId');
  
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  res.json({
    success: true,
    appointment
  });
});

// @desc    Get appointments by date range for calendar view
// @route   GET /api/appointments/calendar
// @access  Private
export const getAppointmentsCalendar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }

  const appointments = await Appointment.find({
    startTime: {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string)
    },
    status: { $ne: 'cancelled' }
  })
    .populate('customer', 'name phone')
    .populate('service', 'name price duration')
    .sort({ startTime: 1 });

  // Group appointments by date
  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const date = appointment.startTime.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, typeof appointments>);

  res.json({
    success: true,
    appointments: groupedAppointments
  });
});

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { customer, service, startTime, endTime, notes } = req.body;

  // Get service details to calculate end time if not provided
  const serviceDoc = await Service.findById(service);
  if (!serviceDoc) {
    return res.status(404).json({ message: 'Service not found' });
  }

  let calculatedEndTime = endTime;
  if (!endTime) {
    const start = new Date(startTime);
    calculatedEndTime = new Date(start.getTime() + serviceDoc.duration * 60000);
  }

  // Check for conflicting appointments
  const conflictingAppointment = await Appointment.findOne({
    $and: [
      { status: { $ne: 'cancelled' } },
      {
        $or: [
          {
            startTime: { $lt: new Date(calculatedEndTime) },
            endTime: { $gt: new Date(startTime) }
          }
        ]
      }
    ]
  });

  if (conflictingAppointment) {
    return res.status(400).json({ message: 'Time slot is already booked' });
  }

  const appointment = await Appointment.create({
    customer,
    service,
    startTime: new Date(startTime),
    endTime: new Date(calculatedEndTime),
    notes,
    createdBy: req.user!._id
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('customer', 'name phone')
    .populate('service', 'name price duration')
    .populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    appointment: populatedAppointment
  });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { customer, service, startTime, endTime, status, notes } = req.body;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // If updating time, check for conflicts
  if (startTime || endTime) {
    const newStartTime = startTime ? new Date(startTime) : appointment.startTime;
    const newEndTime = endTime ? new Date(endTime) : appointment.endTime;

    const conflictingAppointment = await Appointment.findOne({
      _id: { $ne: req.params.id },
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: newEndTime },
          endTime: { $gt: newStartTime }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'Time slot is already booked' });
    }
  }

  // If status is being changed to cancelled, delete associated order
  if (status === 'cancelled' && appointment.orderId) {
    await Order.findByIdAndDelete(appointment.orderId);
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    {
      customer: customer || appointment.customer,
      service: service || appointment.service,
      startTime: startTime ? new Date(startTime) : appointment.startTime,
      endTime: endTime ? new Date(endTime) : appointment.endTime,
      status: status || appointment.status,
      notes: notes !== undefined ? notes : appointment.notes
    },
    { new: true, runValidators: true }
  )
    .populate('customer', 'name phone')
    .populate('service', 'name price duration')
    .populate('createdBy', 'name')
    .populate('orderId');

  res.json({
    success: true,
    appointment: updatedAppointment
  });
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  // Delete associated order if exists
  if (appointment.orderId) {
    await Order.findByIdAndDelete(appointment.orderId);
  }

  await Appointment.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Appointment deleted successfully'
  });
});

