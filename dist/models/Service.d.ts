import mongoose, { Document } from 'mongoose';
export interface IService extends Document {
    name: string;
    description?: string;
    price: number;
    duration: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Service: mongoose.Model<IService, {}, {}, {}, mongoose.Document<unknown, {}, IService, {}, {}> & IService & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Service.d.ts.map