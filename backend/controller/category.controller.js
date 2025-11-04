const Category = require("../models/category.model");

const CategoryController = {
  create: async (req, res) => {
    try {
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          message: "Please provide all fields",
          success: false,
        });
      }

      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          message: "Invalid type",
          success: false,
        });
      }

      const existingCategory = await Category.findOne({
        name: name.trim(),
        type,
        userId: req.user.userId,
      });

      if (existingCategory) {
        return res.status(400).json({
          message: "Category already exists",
          success: false,
        });
      }

      const userId = req.user.userId;
      const category = new Category({ name, type, userId });
      if (type === "expense") {
        category.color = "#FF0000";
      } else {
        category.color = "#00FF00";
      }
      await category.save();

      return res.status(201).json({
        message: "Category created successfully",
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(401).json({
        message: "Error creating category",
        success: false,
        error: error.message,
      });
    }
  },
  getCategoryById: async (req, res) => {
    try {
      const category = await Category.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
          success: false,
        });
      }

      return res.json({
        message: "Category found",
        success: true,
        data: category,
      });
    } catch (error) {
      res.json({
        message: "Error fetching category",
        success: false,
        error: error.message,
      });
    }
  },

  getCategories: async (req, res) => {
    try {
      const { type } = req.query;
      const filter = {
        userId: req.user.userId,
      };

      if (type && ["income", "expense"].includes(type)) {
        filter.type = type;
      }

      const categories = await Category.find(filter).sort({ name: 1 });

      res.json({
        message: "Categories fetched successfully",
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching categories",
        success: false,
        error: error.message,
      });
    }
  },
  updateCategory: async (req, res) => {
    try {
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          message: "Please provide all fields",
          success: false,
        });
      }

      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          message: "Invalid type",
          success: false,
        });
      }

      const category = await Category.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        { name, type },
        { new: true }
      );

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
          success: false,
        });
      }

      return res.json({
        message: "Category updated successfully",
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating category",
        success: false,
        error: error.message,
      });
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const category = await Category.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
          success: false,
        });
      }

      return res.json({
        message: "Category deleted successfully",
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting category",
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = CategoryController;
