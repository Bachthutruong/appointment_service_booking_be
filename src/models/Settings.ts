import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  // General Settings
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  timezone: string;
  currency: string;
  language: string;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  orderNotifications: boolean;
  inventoryAlerts: boolean;
  reminderTime: number; // in minutes
  
  // Appearance Settings
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // System Settings
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>({
  // General Settings
  businessName: {
    type: String,
    required: true,
    default: 'BeautyBook'
  },
  businessAddress: {
    type: String,
    default: ''
  },
  businessPhone: {
    type: String,
    default: ''
  },
  businessEmail: {
    type: String,
    default: ''
  },
  timezone: {
    type: String,
    required: true,
    default: 'Asia/Ho_Chi_Minh'
  },
  currency: {
    type: String,
    required: true,
    default: 'VND'
  },
  language: {
    type: String,
    required: true,
    default: 'vi'
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
  appointmentReminders: {
    type: Boolean,
    default: true
  },
  orderNotifications: {
    type: Boolean,
    default: true
  },
  inventoryAlerts: {
    type: Boolean,
    default: true
  },
  reminderTime: {
    type: Number,
    default: 30 // 30 minutes
  },
  
  // Appearance Settings
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  primaryColor: {
    type: String,
    default: 'purple'
  },
  sidebarCollapsed: {
    type: Boolean,
    default: false
  },
  compactMode: {
    type: Boolean,
    default: false
  },
  
  // System Settings
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
