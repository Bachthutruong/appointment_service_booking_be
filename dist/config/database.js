"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/appointment_booking';
        const conn = await mongoose_1.default.connect(mongoURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};
// Handle connection events
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    process.exit(0);
});
exports.default = connectDB;
//# sourceMappingURL=database.js.map