const TransactionController = require("../controller/transaction.controller.js");
const { authenticate } = require("../middleware/auth.middleware.js");
const express = require("express");

const TransactionRouter = express.Router();

TransactionRouter.get("/transactions", authenticate, TransactionController.getTransaction);
TransactionRouter.post(
  "/transactions",
  authenticate,
  TransactionController.createTransaction
);
TransactionRouter.delete(
  "/transactions/:id",
  authenticate,
  TransactionController.deleteTransaction
);
TransactionRouter.put(
  "/transactions/:id",
  authenticate,
  TransactionController.updateTransaction
);
TransactionRouter.get(
  "/transactions/:id",
  authenticate,
  TransactionController.getTransactionById
);

module.exports = TransactionRouter;
