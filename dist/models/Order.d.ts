import mongoose, { Document } from 'mongoose';
export interface IOrderItem {
    type: 'product' | 'service';
    item: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface IOrder extends Document {
    customer: mongoose.Types.ObjectId;
    items: IOrderItem[];
    subtotal: number;
    discountType: 'percentage' | 'fixed' | 'none';
    discountValue: number;
    discountAmount: number;
    shippingFee: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    images?: string[];
    appointmentId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map