"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSettings = exports.updateSettings = exports.getSettings = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const Settings_1 = require("../models/Settings");
// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    let settings = await Settings_1.Settings.findOne({ isActive: true });
    // If no settings exist, create default settings
    if (!settings) {
        console.log('📝 Creating default settings...');
        settings = await Settings_1.Settings.create({});
    }
    res.json({
        success: true,
        settings
    });
});
// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { 
    // General Settings
    businessName, businessAddress, businessPhone, businessEmail, timezone, currency, language, 
    // Notification Settings
    emailNotifications, smsNotifications, appointmentReminders, orderNotifications, inventoryAlerts, reminderTime, 
    // Appearance Settings
    theme, primaryColor, sidebarCollapsed, compactMode } = req.body;
    console.log('📝 Update settings request:', req.body);
    // Find existing settings or create new one
    let settings = await Settings_1.Settings.findOne({ isActive: true });
    if (!settings) {
        console.log('📝 Creating new settings...');
        settings = await Settings_1.Settings.create({});
    }
    // Update settings
    const updateData = {};
    // General Settings
    if (businessName !== undefined)
        updateData.businessName = businessName;
    if (businessAddress !== undefined)
        updateData.businessAddress = businessAddress;
    if (businessPhone !== undefined)
        updateData.businessPhone = businessPhone;
    if (businessEmail !== undefined)
        updateData.businessEmail = businessEmail;
    if (timezone !== undefined)
        updateData.timezone = timezone;
    if (currency !== undefined)
        updateData.currency = currency;
    if (language !== undefined)
        updateData.language = language;
    // Notification Settings
    if (emailNotifications !== undefined)
        updateData.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined)
        updateData.smsNotifications = smsNotifications;
    if (appointmentReminders !== undefined)
        updateData.appointmentReminders = appointmentReminders;
    if (orderNotifications !== undefined)
        updateData.orderNotifications = orderNotifications;
    if (inventoryAlerts !== undefined)
        updateData.inventoryAlerts = inventoryAlerts;
    if (reminderTime !== undefined)
        updateData.reminderTime = reminderTime;
    // Appearance Settings
    if (theme !== undefined)
        updateData.theme = theme;
    if (primaryColor !== undefined)
        updateData.primaryColor = primaryColor;
    if (sidebarCollapsed !== undefined)
        updateData.sidebarCollapsed = sidebarCollapsed;
    if (compactMode !== undefined)
        updateData.compactMode = compactMode;
    console.log('🔄 Updating settings with data:', updateData);
    const updatedSettings = await Settings_1.Settings.findByIdAndUpdate(settings._id, updateData, { new: true, runValidators: true });
    console.log('✅ Updated settings:', {
        id: updatedSettings?._id,
        businessName: updatedSettings?.businessName,
        theme: updatedSettings?.theme,
        primaryColor: updatedSettings?.primaryColor
    });
    res.json({
        success: true,
        settings: updatedSettings
    });
});
// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private/Admin
exports.resetSettings = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    console.log('🔄 Resetting settings to default...');
    // Delete existing settings
    await Settings_1.Settings.deleteMany({});
    // Create new default settings
    const defaultSettings = await Settings_1.Settings.create({});
    console.log('✅ Settings reset to default:', defaultSettings._id);
    res.json({
        success: true,
        settings: defaultSettings,
        message: 'Settings reset to default successfully'
    });
});
//# sourceMappingURL=settingsController.js.map