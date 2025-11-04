const AnalyticsController = require("../controller/analytics.controller.js");
const { authenticate } = require("../middleware/auth.middleware.js");
const express = require("express");

const AnalyticsRouter = express.Router();

AnalyticsRouter.get("/analytics/summary", authenticate, AnalyticsController.getSummary);

module.exports = AnalyticsRouter;
