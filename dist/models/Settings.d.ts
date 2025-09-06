import mongoose, { Document } from 'mongoose';
export interface ISettings extends Document {
    businessName: string;
    businessAddress?: string;
    businessPhone?: string;
    businessEmail?: string;
    timezone: string;
    currency: string;
    language: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    orderNotifications: boolean;
    inventoryAlerts: boolean;
    reminderTime: number;
    theme: 'light' | 'dark' | 'system';
    primaryColor: string;
    sidebarCollapsed: boolean;
    compactMode: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Settings: mongoose.Model<ISettings, {}, {}, {}, mongoose.Document<unknown, {}, ISettings, {}, {}> & ISettings & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Settings.d.ts.map