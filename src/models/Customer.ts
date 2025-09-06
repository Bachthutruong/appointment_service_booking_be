import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  lineId?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  lineId: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for search functionality
customerSchema.index({ name: 'text', phone: 'text', email: 'text', notes: 'text' });
customerSchema.index({ phone: 1 });
customerSchema.index({ email: 1 });
customerSchema.index({ dateOfBirth: 1 });

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

