const Transaction = require("../models/transaction.model");

const AnalyticsController = {
  getSummary: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { month, year } = req.query;
      
      const currentDate = new Date();
      const selectedMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
      const selectedYear = year ? parseInt(year) : currentDate.getFullYear();

      const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
      const endOfMonth = new Date(selectedYear, selectedMonth, 0);
      
      console.log('Analytics query params:', { userId, selectedMonth, selectedYear, startOfMonth, endOfMonth });
      
      // Check if there are any transactions at all for this user
      const allTransactions = await Transaction.find({ userId: req.user.userId });
      console.log('Total transactions for user:', allTransactions.length);
      if (allTransactions.length > 0) {
        console.log('Sample transaction:', allTransactions[0]);
        console.log('Transaction dates:', allTransactions.map(t => ({ date: t.date, type: t.type })));
      }
      
      // Check transactions in date range without type filter
      const transactionsInRange = await Transaction.find({
        userId: req.user.userId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }).populate('categoryId');
      console.log('Transactions in date range:', transactionsInRange.length);
      console.log('Transactions with categories:', transactionsInRange.map(t => ({
        amount: t.amount,
        categoryName: t.categoryId?.name,
        categoryType: t.categoryId?.type
      })));

      // Calculate totals using the populated transactions
      const totalIncome = transactionsInRange
        .filter(t => t.categoryId?.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalExpenses = transactionsInRange
        .filter(t => t.categoryId?.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

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
      
      console.log('Analytics results:', { totalIncome, totalExpenses, balance, categoryBreakdownCount: categoryBreakdown.length });
      
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