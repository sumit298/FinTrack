const BudgetController = require("../controller/budget.controller.js");
const { authenticate } = require("../middleware/auth.middleware.js");
const express = require("express");

const BudgetRouter = express.Router();

BudgetRouter.post("/budget", authenticate, BudgetController.createBudget);
BudgetRouter.get("/budget", authenticate, BudgetController.getBudget);
BudgetRouter.put("/budget/:id", authenticate, BudgetController.updateBudget);
BudgetRouter.delete("/budget/:id", authenticate, BudgetController.deleteBudget);
BudgetRouter.get("/budget/current-month", authenticate, BudgetController.getCurrentMonthBudget);
BudgetRouter.get("/budget/comparison", authenticate, BudgetController.getBudgetComparison);

module.exports = BudgetRouter;
