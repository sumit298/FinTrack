const Budget = require("../models/budget");
const Category = require("../models/category");

const BudgetController = {
  getBudget: async (req, res) => {
    try {
      const { month, year } = req.query;

      const filter = {
        userId: req.user.userId,
        month,
        year,
      };

      if (month) filter.month = parseInt(month);
      if (year) filter.year = parseInt(year);

      const budgets = await Budget.find(filter)
        .populate("categoryId", "name type color")
        .sort({ month: -1, year: -1 });

      if (!budgets)
        return res.status(404).json({
          message: "No budgets found",
          success: false,
        });

      res.json({
        success: true,
        data: budgets,
      });
    } catch (error) {
      console.error("Get budgets error", error);
      res.status(500).json({
        message: "Error fetching budgets",
        success: false,
        error: error.message,
      });
    }
  },

  createBudget: async (req, res) => {
    try {
      const { categoryId, amount, month, year } = req.body;
      if (!categoryId || !amount || !month || !year) {
        return res.status(400).json({
          message: "Please fill all the fields",
          success: false,
        });
      }

      if (amount < 0) {
        return res.status(400).json({
          message: "Amount cannot be negative",
          success: false,
        });
      }

      if (month < 1 || month > 12) {
        return res.status(400).json({
          message: "Month must be between 1 and 12",
          success: false,
        });
      }

      if (year < 2020 || year > 2100) {
        return res.status(400).json({
          message: "Year must be between 2020 and 2100",
          success: false,
        });
      }

      if (categoryId) {
        const category = await Category.findOne({
          _id: categoryId,
          userId: req.userId,
        });

        if (!category) {
          res.status(404).json({
            message: "Category not found",
            success: false,
          });
        }

        if (category.type === "expense") {
          return res.status(400).json({
            message: "Expense category cannot be used for budget",
            success: false,
          });
        }
      }

      const existingBudget = await Budget.findOne({
        categoryId,
        month: parseInt(month),
        year: parseInt(year),
        userId: req.user.id,
      });

      if (existingBudget) {
        return res.status(400).json({
          message: "Budget already exists for this month and year",
          success: false,
        });
      }
      const budget = new Budget({
        categoryId,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        userId: req.userId,
      });

      await budget.save();

      return res.status(201).json({
        message: "Budget created successfully",
        success: true,
        data: budget,
      });
    } catch (error) {
        res.status(500).json({
        message: "Error creating budget",
        success: false,
        error: error.message,
      })
    }
  },

  getCurrentMonthBudget: async (req, res) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
      const currentYear = currentDate.getFullYear();

      const budgets = await Budget.find({
        userId: req.user.userId,
        month: currentMonth,
        year: currentYear
      }).populate("categoryId", "name type color");

      res.json({
        success: true,
        message: "Current month budgets fetched successfully",
        data: budgets,
        currentMonth,
        currentYear
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching current month budgets",
        success: false,
        error: error.message
      });
    }
  },

  getBudgetComparison: async (req, res) => {
    try {
        
    } catch (error) {
        
    }
  }
};



module.exports = BudgetController;