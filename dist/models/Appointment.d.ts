import mongoose, { Document } from 'mongoose';
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
export declare const Appointment: mongoose.Model<IAppointment, {}, {}, {}, mongoose.Document<unknown, {}, IAppointment, {}, {}> & IAppointment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Appointment.d.ts.map