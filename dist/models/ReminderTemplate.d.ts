import mongoose, { Document } from 'mongoose';
export interface IReminderTemplate extends Document {
    title: string;
    content: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ReminderTemplate: mongoose.Model<IReminderTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IReminderTemplate, {}, {}> & IReminderTemplate & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=ReminderTemplate.d.ts.map