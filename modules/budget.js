const mongoose = require("mongoose");

const budgetAuthSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  firstName: String,
  lastName: String,
  email: { type: String, index: true },
  password: String,
  status: { type: String, default: "active" },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const budgetTransactionsSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  type: { type: String, enum: ["income", "expense"] },
  category: String,
  amount: Number,
  description: String,
  month: Number,
  year: Number,
  date: { type: Date, default: Date.now },
  frequency: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const budgetWishListSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  name: String,
  amount: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const budgetListSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  category: String,
  amount: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const BudgetAuth = mongoose.model("budgetAuth", budgetAuthSchema, "budgetAuth");
const BudgetTransactions = mongoose.model("budgetTransactions", budgetTransactionsSchema, "budgetTransactions");
const BudgetWishList = mongoose.model("budgetWishList", budgetWishListSchema, "budgetWishList");
const BudgetList = mongoose.model("budgetList", budgetListSchema, "budgetList");

const extractUserId = (req) => {
  return req.query?.userId || req.params?.userId || req.body?.userId || req.headers["user-id"] || null;
};

const generateNextUserId = async () => {
  // Find latest created user with a userId and increment numeric suffix
  const last = await BudgetAuth.findOne({ userId: { $exists: true } }).sort({ createdAt: -1 }).exec();
  if (!last || !last.userId) return "BUD10001";
  const match = last.userId.match(/(\d+)$/);
  const nextNum = match ? parseInt(match[1], 10) + 1 : 10001;
  return `BUD${nextNum}`;
};

// AUTH
const budgetSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await BudgetAuth.findOne({ email }).exec();
    if (existingUser) return res.status(409).json({ message: "User already exists" });

    const userId = await generateNextUserId();
    const newUser = new BudgetAuth({ userId, firstName, lastName, email, password, createdAt: new Date(), updatedAt: new Date() });
    await newUser.save();

    return res.status(201).json({ message: "User created successfully", user: { userId: newUser.userId, _id: newUser._id, firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const budgetLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await BudgetAuth.findOne({ email }).exec();
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    if (user.password !== password) return res.status(401).json({ message: "Invalid email or password" });
    if (user.status !== "active") return res.status(403).json({ message: "User account is inactive" });

    return res.status(200).json({ message: "Login successful", user: { userId: user.userId, _id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const budgetLogout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// USERS
const userList = async (req, res) => {
  try {
    const users = await BudgetAuth.find({}, { password: 0 }).exec();
    return res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) return res.status(400).json({ message: "Invalid status value" });

    const user = await BudgetAuth.findOneAndUpdate({ userId }, { status, updatedAt: new Date() }, { new: true }).exec();
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User status updated successfully", user: { userId: user.userId, email: user.email, status: user.status } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// TRANSACTIONS
const getTransactions = async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = extractUserId(req);
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!month || !year) return res.status(400).json({ message: "Month and year are required" });

    const transactions = await BudgetTransactions.find({ userId, month: parseInt(month, 10), year: parseInt(year, 10) }).sort({ date: -1 }).exec();
    return res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const postTransactions = async (req, res) => {
  try {
    const { userId, type, category, amount, description } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!type || !category || !amount) return res.status(400).json({ message: "Missing required fields" });

    const now = new Date();
    const transaction = new BudgetTransactions({ userId, type, category, amount, description, month: now.getMonth() + 1, year: now.getFullYear(), date: now, createdAt: now, updatedAt: now });
    await transaction.save();
    return res.status(201).json({ message: "Transaction added successfully", transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateTransactions = async (req, res) => {
  try {
    const { transactionId } = req.query;
    const userId = extractUserId(req);
    const { type, category, amount, description } = req.body;
    if (!transactionId) return res.status(400).json({ message: "Transaction ID is required" });
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const transaction = await BudgetTransactions.findOne({ _id: transactionId }).exec();
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    transaction.type = type ?? transaction.type;
    transaction.category = category ?? transaction.category;
    transaction.amount = amount ?? transaction.amount;
    transaction.description = description ?? transaction.description;
    transaction.updatedAt = new Date();
    await transaction.save();
    return res.status(200).json({ message: "Transaction updated successfully", transaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const createRecurringTransaction = async (req, res) => {
  try {
    const { userId, type, category, amount, description, frequency } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!type || !category || !amount || !frequency) return res.status(400).json({ message: "Missing required fields" });

    const now = new Date();
    const recurringTransaction = new BudgetTransactions({ userId, type, category, amount, description, frequency, date: now, month: now.getMonth() + 1, year: now.getFullYear(), createdAt: now, updatedAt: now });
    await recurringTransaction.save();
    return res.status(201).json({ message: "Recurring transaction created successfully", transaction: recurringTransaction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// WISHLIST
const getWishlist = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const items = await BudgetWishList.find({ userId }).sort({ createdAt: -1 }).exec();
    return res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const postWishlist = async (req, res) => {
  try {
    const { userId, name, amount, description } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!name || !amount) return res.status(400).json({ message: "Missing required fields" });
    const item = new BudgetWishList({ userId, name, amount, description, createdAt: new Date(), updatedAt: new Date() });
    await item.save();
    return res.status(201).json({ message: "Wishlist item added successfully", item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.query;
    const userId = extractUserId(req);
    const { name, amount, description } = req.body;
    if (!wishlistId) return res.status(400).json({ message: "Wishlist ID is required" });
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const item = await BudgetWishList.findOne({ _id: wishlistId }).exec();
    if (!item) return res.status(404).json({ message: "Wishlist item not found" });
    if (item.userId !== userId) return res.status(403).json({ message: "Forbidden" });
    item.name = name ?? item.name;
    item.amount = amount ?? item.amount;
    item.description = description ?? item.description;
    item.updatedAt = new Date();
    await item.save();
    return res.status(200).json({ message: "Wishlist item updated successfully", item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// BUDGETS
const getBudget = async (req, res) => {
  try {
    const userId = extractUserId(req);
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const budgets = await BudgetList.find({ userId }).sort({ createdAt: -1 }).exec();
    return res.status(200).json({ budgets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const postBudget = async (req, res) => {
  try {
    const { userId, category, amount, description } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    if (!category || !amount) return res.status(400).json({ message: "Missing required fields" });
    const existing = await BudgetList.findOne({ userId, category }).exec();
    if (existing) return res.status(409).json({ message: "Budget for this category already exists" });
    const budget = new BudgetList({ userId, category, amount, description, createdAt: new Date(), updatedAt: new Date() });
    await budget.save();
    return res.status(201).json({ message: "Budget created successfully", budget });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { budgetId } = req.query;
    const userId = extractUserId(req);
    const { category, amount, description } = req.body;
    if (!budgetId) return res.status(400).json({ message: "Budget ID is required" });
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const budget = await BudgetList.findOne({ _id: budgetId }).exec();
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    if (budget.userId !== userId) return res.status(403).json({ message: "Forbidden" });
    budget.category = category ?? budget.category;
    budget.amount = amount ?? budget.amount;
    budget.description = description ?? budget.description;
    budget.updatedAt = new Date();
    await budget.save();
    return res.status(200).json({ message: "Budget updated successfully", budget });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  budgetSignup,
  budgetLogin,
  budgetLogout,
  userList,
  updateUserStatus,
  getTransactions,
  postTransactions,
  updateTransactions,
  createRecurringTransaction,
  getWishlist,
  postWishlist,
  updateWishlist,
  getBudget,
  postBudget,
  updateBudget,
};
