const CategoryController = require("../controller/category.controller.js");
const { authenticate } = require("../middleware/auth.middleware.js");

const express = require("express");

const CategoryRouter = express.Router();

CategoryRouter.post("/category", authenticate, CategoryController.create);
CategoryRouter.get(
  "/category/:id",
  authenticate,
  CategoryController.getCategoryById
);
CategoryRouter.get("/category", authenticate, CategoryController.getCategories);
CategoryRouter.put(
  "/category/:id",
  authenticate,
  CategoryController.updateCategory
);
CategoryRouter.delete(
  "/category/:id",
  authenticate,
  CategoryController.deleteCategory
);
module.exports = CategoryRouter;
