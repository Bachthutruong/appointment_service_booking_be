import mongoose, { Document } from 'mongoose';
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
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Product.d.ts.map