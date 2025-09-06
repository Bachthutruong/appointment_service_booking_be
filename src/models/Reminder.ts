import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  customer: mongoose.Types.ObjectId;
  reminderDate: Date;
  content: string;
  status: 'pending' | 'completed' | 'skipped';
  orderId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reminderSchema = new Schema<IReminder>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'skipped'],
    default: 'pending'
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for reminder scheduling and filtering
reminderSchema.index({ reminderDate: 1, status: 1 });
reminderSchema.index({ customer: 1, reminderDate: -1 });
reminderSchema.index({ status: 1, reminderDate: 1 });

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);

