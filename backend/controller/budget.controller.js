const Budget = require("../models/budget.model");
const Category = require("../models/category.model");
const Transaction = require("../models/transaction.model");

const BudgetController = {
  getBudget: async (req, res) => {
    try {
      const { month, year } = req.query;

      const filter = {
        userId: req.user.userId,
      };

      if (month) filter.month = parseInt(month);
      if (year) filter.year = parseInt(year);

      const budgets = await Budget.find(filter)
        .populate("categoryId", "name type color")
        .sort({ month: -1, year: -1 });

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
          userId: req.user.userId,
        });

        if (!category) {
          return res.status(404).json({
            message: "Category not found",
            success: false,
          });
        }

        if (category.type === "income") {
          return res.status(400).json({
            message: "Income category cannot be used for budget",
            success: false,
          });
        }
      }

      const existingBudget = await Budget.findOne({
        categoryId,
        month: parseInt(month),
        year: parseInt(year),
        userId: req.user.userId,
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
        userId: req.user.userId,
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
      });
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
        year: currentYear,
      }).populate("categoryId", "name type color");

      //calculate spent amount for each budget

      const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
          const spent = await Transaction.aggregate([
            {
              $match: {
                type: "expense",
                userId: req.user.userId,
                date: {
                  $gte: new Date(currentYear, currentMonth - 1, 1),
                  $lte: new Date(currentYear, currentMonth, 0),
                },
                categoryId: budget.categoryId?._id,
              },
            },
            {
              $group: {
                _id: null,
                totalSpent: { $sum: "$amount" },
              },
            },
          ]);

          return {
            ...budget.toObject(),
            spent: spent.length > 0 ? spent[0].totalSpent : 0,
          };
        })
      );

      res.status(200).json({
        success: true,
        message: "Current month budgets fetched successfully",
        data: budgetsWithSpent,
        currentMonth,
        currentYear,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching current month budgets",
        success: false,
        error: error.message,
      });
    }
  },

  getBudgetComparison: async (req, res) => {
    try {
      const { month, year } = req.query;
      const currentDate = new Date();
      const selectedMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const selectedYear = year ? parseInt(year) : currentDate.getFullYear();

      const budgets = await Budget.find({
        userId: req.user.userId,
        month: selectedMonth,
        year: selectedYear,
      }).populate("categoryId", "name type color");

      // Get transactions for the selected period
      const transactionsInRange = await Transaction.find({
        userId: req.user.userId,
        date: {
          $gte: new Date(selectedYear, selectedMonth - 1, 1),
          $lte: new Date(selectedYear, selectedMonth, 0),
        },
      }).populate('categoryId');
      
      
      // Calculate spent amounts by category
      const spentByCategory = {};
      transactionsInRange
        .filter(t => t.categoryId?.type === 'expense')
        .forEach(t => {
          const categoryId = t.categoryId._id.toString();
          spentByCategory[categoryId] = (spentByCategory[categoryId] || 0) + t.amount;
        });
      
      const results = budgets.map((budget) => {
        const spent = spentByCategory[budget.categoryId._id.toString()] || 0;
        const difference = budget.amount - spent;

        return {
          categoryId: budget.categoryId?._id,
          categoryName: budget.categoryId?.name,
          budgetAmount: budget.amount,
          spentAmount: spent,
          difference: difference,
          percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Budget comparison fetched successfully",
        data: results,
      });
    } catch (error) {
      console.error("Error fetching budget comparison", error);
      res.status(500).json({
        message: "Error fetching budget comparison",
        success: false,
        error: error.message,
      });
    }
  },

  updateBudget: async (req, res) => {
    try {
      const { id } = req.params;
      const { categoryId, amount, month, year } = req.body;

      const budget = await Budget.findOneAndUpdate(
        { _id: id, userId: req.user.userId },
        { categoryId, amount: parseFloat(amount), month: parseInt(month), year: parseInt(year) },
        { new: true }
      ).populate("categoryId", "name type color");

      if (!budget) {
        return res.status(404).json({
          message: "Budget not found",
          success: false,
        });
      }

      res.json({
        success: true,
        message: "Budget updated successfully",
        data: budget,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating budget",
        success: false,
        error: error.message,
      });
    }
  },

  deleteBudget: async (req, res) => {
    try {
      const { id } = req.params;

      const budget = await Budget.findOneAndDelete({
        _id: id,
        userId: req.user.userId,
      });

      if (!budget) {
        return res.status(404).json({
          message: "Budget not found",
          success: false,
        });
      }

      res.json({
        success: true,
        message: "Budget deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting budget",
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = BudgetController;
