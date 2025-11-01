const CategoryController = require("../controller/category.controller.js");
const { authenticate } = require("../middleware/auth.middleware.js");

const express = require('express');

const CategoryRouter = express.Router();

CategoryRouter.post("/category", authenticate, CategoryController.create);
CategoryRouter.get("/category/:id", authenticate, CategoryController.getCategoryById);
CategoryRouter.get("/category", authenticate, CategoryController.getCategories);

module.exports = CategoryRouter;    