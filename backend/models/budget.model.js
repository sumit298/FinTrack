const mongoose = require("mongoose");

const budget = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",

  },
  amount: {
    type: Number,
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
}, { timestamps: true});

budgetSchema.index({ userId: 1, categoryId: 1, month: 1, year: 1 }, { unique: true });


const Budget = mongoose.model("Budget", budget);
module.exports = Budget;
