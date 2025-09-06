import mongoose, { Document } from 'mongoose';
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
export declare const Customer: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}, {}> & ICustomer & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Customer.d.ts.map