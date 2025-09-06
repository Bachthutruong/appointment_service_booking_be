import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  sellingPrice: number;
  costPrice: number;
  unit: string;
  currentStock: number;
  minStockAlert: number;
  category?: mongoose.Types.ObjectId;
  isActive: boolean;
  isDiscontinued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  minStockAlert: {
    type: Number,
    default: 10,
    min: 0
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDiscontinued: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for low stock alerts
productSchema.index({ currentStock: 1, minStockAlert: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);

