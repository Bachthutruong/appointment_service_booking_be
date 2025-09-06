import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { Settings } from '../models/Settings';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
export const getSettings = asyncHandler(async (req: Request, res: Response) => {
  let settings = await Settings.findOne({ isActive: true });
  
  // If no settings exist, create default settings
  if (!settings) {
    console.log('📝 Creating default settings...');
    settings = await Settings.create({});
  }
  
  res.json({
    success: true,
    settings
  });
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const {
    // General Settings
    businessName,
    businessAddress,
    businessPhone,
    businessEmail,
    timezone,
    currency,
    language,
    
    // Notification Settings
    emailNotifications,
    smsNotifications,
    appointmentReminders,
    orderNotifications,
    inventoryAlerts,
    reminderTime,
    
    // Appearance Settings
    theme,
    primaryColor,
    sidebarCollapsed,
    compactMode
  } = req.body;

  console.log('📝 Update settings request:', req.body);

  // Find existing settings or create new one
  let settings = await Settings.findOne({ isActive: true });
  
  if (!settings) {
    console.log('📝 Creating new settings...');
    settings = await Settings.create({});
  }

  // Update settings
  const updateData: any = {};
  
  // General Settings
  if (businessName !== undefined) updateData.businessName = businessName;
  if (businessAddress !== undefined) updateData.businessAddress = businessAddress;
  if (businessPhone !== undefined) updateData.businessPhone = businessPhone;
  if (businessEmail !== undefined) updateData.businessEmail = businessEmail;
  if (timezone !== undefined) updateData.timezone = timezone;
  if (currency !== undefined) updateData.currency = currency;
  if (language !== undefined) updateData.language = language;
  
  // Notification Settings
  if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
  if (smsNotifications !== undefined) updateData.smsNotifications = smsNotifications;
  if (appointmentReminders !== undefined) updateData.appointmentReminders = appointmentReminders;
  if (orderNotifications !== undefined) updateData.orderNotifications = orderNotifications;
  if (inventoryAlerts !== undefined) updateData.inventoryAlerts = inventoryAlerts;
  if (reminderTime !== undefined) updateData.reminderTime = reminderTime;
  
  // Appearance Settings
  if (theme !== undefined) updateData.theme = theme;
  if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
  if (sidebarCollapsed !== undefined) updateData.sidebarCollapsed = sidebarCollapsed;
  if (compactMode !== undefined) updateData.compactMode = compactMode;

  console.log('🔄 Updating settings with data:', updateData);

  const updatedSettings = await Settings.findByIdAndUpdate(
    settings._id,
    updateData,
    { new: true, runValidators: true }
  );

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
export const resetSettings = asyncHandler(async (req: Request, res: Response) => {
  console.log('🔄 Resetting settings to default...');
  
  // Delete existing settings
  await Settings.deleteMany({});
  
  // Create new default settings
  const defaultSettings = await Settings.create({});
  
  console.log('✅ Settings reset to default:', defaultSettings._id);

  res.json({
    success: true,
    settings: defaultSettings,
    message: 'Settings reset to default successfully'
  });
});
