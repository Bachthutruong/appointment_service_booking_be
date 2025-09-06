import mongoose, { Document } from 'mongoose';
export interface IStockMovement extends Document {
    product: mongoose.Types.ObjectId;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason: string;
    notes?: string;
    orderId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}
export declare const StockMovement: mongoose.Model<IStockMovement, {}, {}, {}, mongoose.Document<unknown, {}, IStockMovement, {}, {}> & IStockMovement & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=StockMovement.d.ts.map