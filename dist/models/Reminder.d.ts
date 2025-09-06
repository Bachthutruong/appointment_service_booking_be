import mongoose, { Document } from 'mongoose';
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
export declare const Reminder: mongoose.Model<IReminder, {}, {}, {}, mongoose.Document<unknown, {}, IReminder, {}, {}> & IReminder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Reminder.d.ts.map