import { Response } from 'express';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { search, isActive, page = 1, limit = 10 } = req.query;
  
  let query: any = {};
  
  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit) * 1)
    .skip((Number(page) - 1) * Number(limit));

  const total = await Category.countDocuments(query);

  res.json({
    success: true,
    categories,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json({
    success: true,
    category
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, isActive = true } = req.body;

  // Check if category name already exists
  const existingCategory = await Category.findOne({ name });
  if (existingCategory) {
    return res.status(400).json({ message: 'Category name already exists' });
  }

  const category = await Category.create({
    name,
    description,
    isActive
  });

  res.status(201).json({
    success: true,
    category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, isActive } = req.body;
  
  // Check if category name already exists for other categories
  if (name) {
    const existingCategory = await Category.findOne({ 
      name, 
      _id: { $ne: req.params.id } 
    });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      isActive
    },
    { new: true, runValidators: true }
  );

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json({
    success: true,
    category
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});
