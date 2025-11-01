const Transaction = require("../models/transaction.model");

const AnalyticsController = {
  getSummary: async (req, res) => {
    // 1. Aggregate total income (current month)
    // 2. Aggregate total expenses (current month)
    // 3. Calculate balance = income - expenses
    // 4. Maybe add category-wise breakdown
    // 5. Return summary data for charts
    try {
      const userId = req.user.userId;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0);

      const income = await Transaction.aggregate([
        {
          $match: {
            type: "income",
            userId: req.user.userId,
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$amount" },
          },
        },
      ]);

      const expenses = await Transaction.aggregate([
        {
          $match: {
            type: "expense",
            userId: req.user.userId,
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$amount" },
          },
        },
      ]);

      const totalIncome = income[0]?.totalIncome || 0;
      const totalExpenses = expenses[0]?.totalExpenses || 0;

      const balance = totalIncome - totalExpenses;

      const categoryBreakdown = await Transaction.aggregate([
        {
          $match: {
            userId: req.user.userId,
            date: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
      ]);
      return res.json({
        success: true,
        message: "Summary fetched successfully",
        data: {
          totalIncome,
          totalExpenses,
          balance,
          categoryBreakdown,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching summary",
        success: false,
        error: error.message,
      });
    }
  },
};


module.exports = AnalyticsController;