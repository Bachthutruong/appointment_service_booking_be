"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const settingsSchema = new mongoose_1.Schema({
    // General Settings
    businessName: {
        type: String,
        required: true,
        default: 'BeautyBook'
    },
    businessAddress: {
        type: String,
        default: ''
    },
    businessPhone: {
        type: String,
        default: ''
    },
    businessEmail: {
        type: String,
        default: ''
    },
    timezone: {
        type: String,
        required: true,
        default: 'Asia/Ho_Chi_Minh'
    },
    currency: {
        type: String,
        required: true,
        default: 'VND'
    },
    language: {
        type: String,
        required: true,
        default: 'vi'
    },
    // Notification Settings
    emailNotifications: {
        type: Boolean,
        default: true
    },
    smsNotifications: {
        type: Boolean,
        default: false
    },
    appointmentReminders: {
        type: Boolean,
        default: true
    },
    orderNotifications: {
        type: Boolean,
        default: true
    },
    inventoryAlerts: {
        type: Boolean,
        default: true
    },
    reminderTime: {
        type: Number,
        default: 30 // 30 minutes
    },
    // Appearance Settings
    theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
    },
    primaryColor: {
        type: String,
        default: 'purple'
    },
    sidebarCollapsed: {
        type: Boolean,
        default: false
    },
    compactMode: {
        type: Boolean,
        default: false
    },
    // System Settings
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
// Ensure only one settings document exists
settingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });
exports.Settings = mongoose_1.default.model('Settings', settingsSchema);
//# sourceMappingURL=Settings.js.map