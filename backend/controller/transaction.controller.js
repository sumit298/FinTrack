const Transaction = require("../models/transaction.model");
const Category = require("../models/category.model");

const TransactionController = {
  /**
   * @desc    Get all transactions with filters and pagination
   * @route   GET /api/transactions
   * @access  Private
   */
  getTransaction: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 20;
      const { type, categoryId, startDate, endDate, minAmount, maxAmount } =
        req.query;

      const filter = { userId: req.user.userId };

      if (type && ["income", "expense"].includes(type)) {
        filter.type = type;
      }

      if (categoryId) {
        filter.categoryId = categoryId;
      }

      if (startDate && endDate) {
        filter.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      if (minAmount && maxAmount) {
        filter.amount = {
          $gte: parseInt(minAmount),
          $lte: parseInt(maxAmount),
        };
      }

      const total = await Transaction.countDocuments(filter);
      const transactions = await Transaction.find(filter)
        .sort({ _id: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate("categoryId");

      res.json({
        message: "Transactions fetched successfully",
        success: true,
        data: transactions,
        pageInfo: {
          page,
          perPage,
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching transactions",
        success: false,
        error: error.message,
      });
    }
  },

  createTransaction: async (req, res) => {
    try {
      const { type, amount, categoryId, date, description } = req.body;

      if (!amount || !categoryId || !type) {
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

      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          message: "Invalid transaction type",
          success: false,
        });
      }

      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user.userId,
      });

      if (!category) {
        return res.status(400).json({
          message: "Invalid category",
          success: false,
        });
      }

      const transaction = new Transaction({
        type,
        amount: parseFloat(amount),
        userId: req.user.id,
        description: description || "",
        date: date ? new Date(date) : new Date(),
        categoryId: categoryId || null,
      });

      await transaction.populate("cateogoryId", "name type color");

      res.status(200).json({
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      });
    } catch (error) {
      res.json({
        success: false,
        message: "Error creating transaction",
        error: error.message,
      });
    }
  },

  getTransactionById: async (req, res) => {
    try {
      const transaction = Transaction.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      }).populate("categoryId", "name color type");

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found",
          success: false,
        });
      }

      return res.status(201).json({
        success: true,
        data: transaction,
        message: "Transaction fetched successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching transaction",
        success: false,
        error: error.message,
      });
    }
  },

  updateTransaction: async (req, res) => {
    try {
      const { type, amount, categoryId, date, description } = req.body;

      if (!amount || !categoryId || !type) {
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

      if (!["income", "expense"].includes(type)) {
        return res.status(400).json({
          message: "Invalid transaction type",
          success: false,
        });
      }

      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user.userId,
      });

      if (!category) {
        return res.status(400).json({
          message: "Invalid category",
          success: false,
        });
      }

      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        {
          type,
          amount: parseFloat(amount),
          description: description || "",
          date: date ? new Date(date) : new Date(),
          categoryId: categoryId || null,
        },
        { new: true }
      );

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found",
          success: false,
        });
      }

      res.status(200).json({
        success: true,
        message: "Transaction updated successfully",
        data: transaction,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating transaction",
        success: false,
        error: error.message,
      });
    }
  },

  deleteTransaction: async (req, res) => {
    try {
      const transaction = await Transaction.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.userId,
      });

      if (!transaction) {
        return res.status(404).json({
          message: "Transaction not found",
          success: false,
        });
      }

      res.status(200).json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting transaction",
        success: false,
        error: error.message,
      });
    }
  },
};


module.exports = TransactionController;