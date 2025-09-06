import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  type: 'product' | 'service';
  item: mongoose.Types.ObjectId; // Reference to Product or Service
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed' | 'none';
  discountValue: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  images?: string[]; // Cloudinary URLs
  appointmentId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  type: {
    type: String,
    enum: ['product', 'service'],
    required: true
  },
  item: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: function() {
      return this.type === 'product' ? 'Product' : 'Service';
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new Schema<IOrder>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  images: [{
    type: String
  }],
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for reporting and customer history
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ appointmentId: 1 });

export const Order = mongoose.model<IOrder>('Order', orderSchema);

