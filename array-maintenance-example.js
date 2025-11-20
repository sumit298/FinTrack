// Example: If you wanted to maintain arrays in Category model

// In Transaction Controller - createTransaction
const transaction = new Transaction({
  type,
  amount: parseFloat(amount),
  userId: req.user.userId,
  description: description || "",
  date: date ? new Date(date) : new Date(),
  categoryId: categoryId || null,
});

await transaction.save();

// Update category's transaction array
await Category.findByIdAndUpdate(
  categoryId,
  { $push: { transaction: transaction._id } }
);

// In Budget Controller - createBudget  
const budget = new Budget({
  categoryId,
  amount: parseFloat(amount),
  month: parseInt(month),
  year: parseInt(year),
  userId: req.user.userId,
});

await budget.save();

// Update category's budget array
await Category.findByIdAndUpdate(
  categoryId,
  { $push: { budget: budget._id } }
);

// Don't forget to handle deletions too:
// In deleteTransaction
await Category.findByIdAndUpdate(
  transaction.categoryId,
  { $pull: { transaction: transaction._id } }
);

// In deleteBudget
await Category.findByIdAndUpdate(
  budget.categoryId,
  { $pull: { budget: budget._id } }
);