"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("./config/database"));
const errorHandler_1 = require("./middleware/errorHandler");
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const reminderRoutes_1 = __importDefault(require("./routes/reminderRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const reminderTemplateRoutes_1 = __importDefault(require("./routes/reminderTemplateRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Connect to MongoDB
(0, database_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
// Rate limiting removed as requested
// CORS configuration - Allow all domains
app.use((0, cors_1.default)({
    origin: true, // Allow all origins
    credentials: true
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Serve uploaded files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/appointments', appointmentRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/reminders', reminderRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/settings', settingsRoutes_1.default);
app.use('/api/reminder-templates', reminderTemplateRoutes_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err.message);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('Uncaught Exception:', err.message);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map