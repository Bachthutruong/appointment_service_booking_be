import mongoose, { Document, Schema } from 'mongoose';

export interface IReminderTemplate extends Document {
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reminderTemplateSchema = new Schema<IReminderTemplate>({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const ReminderTemplate = mongoose.model<IReminderTemplate>('ReminderTemplate', reminderTemplateSchema);


