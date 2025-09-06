import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  customer: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'booked' | 'cancelled' | 'completed';
  notes?: string;
  orderId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed'],
    default: 'booked'
  },
  notes: {
    type: String,
    trim: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for calendar views and scheduling
appointmentSchema.index({ startTime: 1, endTime: 1 });
appointmentSchema.index({ customer: 1, startTime: -1 });
appointmentSchema.index({ status: 1, startTime: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

