const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();
const AnalyticsRouter = require("./routes/analytics.routes");
const TransactionRouter = require("./routes/transaction.routes");
const BudgetRouter = require("./routes/budget.routes");
const AuthRouter = require("./routes/auth.routes");
const CategoryRouter = require("./routes/category.routes");
const DocsRouter = require("./routes/docs.routes");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB connection error", err));

app.use("/v1/api", AnalyticsRouter);
app.use("/v1/api", TransactionRouter);
app.use("/v1/api", BudgetRouter);
app.use("/v1/api", AuthRouter);
app.use("/v1/api", CategoryRouter);
app.use("/api-docs", DocsRouter);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is up and running",
  });
});

const port = process.env.PORT || 5050;

app.listen(port, () => console.log(`Server up and running on port: ${port}`));
