"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.changeUserPassword = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.createUser = exports.getMe = exports.login = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    // Check for user
    const user = await User_1.User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate token
    const token = generateToken(String(user._id));
    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
});
// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user._id).select('-password');
    res.json({
        success: true,
        user
    });
});
// @desc    Create user (admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
exports.createUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, name, role } = req.body;
    // Check if user exists
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }
    // Create user
    const user = await User_1.User.create({
        email,
        password,
        name,
        role: role || 'employee'
    });
    res.status(201).json({
        success: true,
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        }
    });
});
// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const users = await User_1.User.find({}).select('-password');
    res.json({
        success: true,
        users
    });
});
// @desc    Get single user
// @route   GET /api/auth/users/:id
// @access  Private/Admin
exports.getUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.params.id).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({
        success: true,
        user
    });
});
// @desc    Update user
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
exports.updateUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, role, isActive, phone, address } = req.body;
    console.log('📝 Update user request:', {
        id: req.params.id,
        body: req.body
    });
    // Check if email is being updated and if it already exists
    if (email) {
        const existingUser = await User_1.User.findOne({
            email,
            _id: { $ne: req.params.id }
        });
        if (existingUser) {
            console.log('❌ Email already exists:', email);
            return res.status(400).json({ message: 'Email already exists' });
        }
    }
    const updateData = { name, email, role, isActive, phone, address };
    console.log('🔄 Updating with data:', updateData);
    const user = await User_1.User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
    if (!user) {
        console.log('❌ User not found:', req.params.id);
        return res.status(404).json({ message: 'User not found' });
    }
    console.log('✅ Updated user:', {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
    });
    res.json({
        success: true,
        user
    });
});
// @desc    Delete user (deactivate)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
exports.deleteUser = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({
        success: true,
        message: 'User deactivated successfully'
    });
});
// @desc    Change user password (admin only)
// @route   PUT /api/auth/users/:id/password
// @access  Private/Admin
exports.changeUserPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User_1.User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();
    res.json({
        success: true,
        message: 'Password updated successfully'
    });
});
// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, phone, address } = req.body;
    const user = await User_1.User.findByIdAndUpdate(req.user._id, { name, phone, address }, { new: true, runValidators: true }).select('-password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({
        success: true,
        user
    });
});
// @desc    Change current user's password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User_1.User.findById(req.user._id).select('+password');
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({
        success: true,
        message: 'Password updated successfully'
    });
});
//# sourceMappingURL=authController.js.map