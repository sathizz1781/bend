const mongoose = require("mongoose");

// Define collection schemas inline
const budgetAuthSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  status: { type: String, default: "active" },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const budgetTransactionsSchema = new mongoose.Schema({
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
  name: String,
  amount: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const budgetListSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create models using the specified collection names
const BudgetAuth = mongoose.model("budgetAuth", budgetAuthSchema, "budgetAuth");
const BudgetTransactions = mongoose.model("budgetTransactions", budgetTransactionsSchema, "budgetTransactions");
const BudgetWishList = mongoose.model("budgetWishList", budgetWishListSchema, "budgetWishList");
const BudgetList = mongoose.model("budgetList", budgetListSchema, "budgetList");

// ===========================
// AUTH CONTROLLERS
// ===========================

const budgetSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await BudgetAuth.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new BudgetAuth({
      firstName,
      lastName,
      email,
      password, // In production, hash this password
      status: "active",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const budgetLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await BudgetAuth.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // In production, use bcrypt to compare passwords
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "User account is inactive" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const budgetLogout = async (req, res) => {
  try {
    // Clear session
    req.session = null;
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// USER CONTROLLERS
// ===========================

const userList = async (req, res) => {
  try {
    const users = await BudgetAuth.find({}, { password: 0 });

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const user = await BudgetAuth.findByIdAndUpdate(
      userId,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User status updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// TRANSACTION CONTROLLERS
// ===========================

const getTransactions = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const transactions = await BudgetTransactions.find({
      month: parseInt(month),
      year: parseInt(year),
    }).sort({ date: -1 });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const postTransactions = async (req, res) => {
  try {
    const { type, category, amount, description } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const now = new Date();
    const transaction = new BudgetTransactions({
      type,
      category,
      amount,
      description,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      date: now,
      createdAt: now,
      updatedAt: now,
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateTransactions = async (req, res) => {
  try {
    const { transactionId } = req.query;
    const { type, category, amount, description } = req.body;

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required" });
    }

    const updatedTransaction = await BudgetTransactions.findByIdAndUpdate(
      transactionId,
      { type, category, amount, description, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createRecurringTransaction = async (req, res) => {
  try {
    const { type, category, amount, description, frequency } = req.body;

    if (!type || !category || !amount || !frequency) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const now = new Date();
    const recurringTransaction = new BudgetTransactions({
      type,
      category,
      amount,
      description,
      frequency,
      date: now,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      createdAt: now,
      updatedAt: now,
    });

    await recurringTransaction.save();

    res.status(201).json({
      message: "Recurring transaction created successfully",
      transaction: recurringTransaction,
    });
  } catch (error) {
    console.error("Error creating recurring transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// WISHLIST CONTROLLERS
// ===========================

const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await BudgetWishList.find().sort({ createdAt: -1 });

    res.status(200).json({ items: wishlistItems });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const postWishlist = async (req, res) => {
  try {
    const { name, amount, description } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const wishlistItem = new BudgetWishList({
      name,
      amount,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await wishlistItem.save();

    res.status(201).json({
      message: "Wishlist item added successfully",
      item: wishlistItem,
    });
  } catch (error) {
    console.error("Error adding wishlist item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.query;
    const { name, amount, description } = req.body;

    if (!wishlistId) {
      return res.status(400).json({ message: "Wishlist ID is required" });
    }

    const updatedItem = await BudgetWishList.findByIdAndUpdate(
      wishlistId,
      { name, amount, description, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Wishlist item not found" });
    }

    res.status(200).json({
      message: "Wishlist item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Error updating wishlist item:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// BUDGET CONTROLLERS
// ===========================

const getBudget = async (req, res) => {
  try {
    const budgets = await BudgetList.find().sort({ createdAt: -1 });

    res.status(200).json({ budgets });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const postBudget = async (req, res) => {
  try {
    const { category, amount, description } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if budget for this category already exists
    const existingBudget = await BudgetList.findOne({ category });
    if (existingBudget) {
      return res.status(409).json({ message: "Budget for this category already exists" });
    }

    const budget = new BudgetList({
      category,
      amount,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await budget.save();

    res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    console.error("Error creating budget:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { budgetId } = req.query;
    const { category, amount, description } = req.body;

    if (!budgetId) {
      return res.status(400).json({ message: "Budget ID is required" });
    }

    const updatedBudget = await BudgetList.findByIdAndUpdate(
      budgetId,
      { category, amount, description, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({
      message: "Budget updated successfully",
      budget: updatedBudget,
    });
  } catch (error) {
    console.error("Error updating budget:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// EXPORTS
// ===========================

module.exports = {
  // Auth
  budgetSignup,
  budgetLogin,
  budgetLogout,
  // Users
  userList,
  updateUserStatus,
  // Transactions
  getTransactions,
  postTransactions,
  updateTransactions,
  createRecurringTransaction,
  // Wishlist
  getWishlist,
  postWishlist,
  updateWishlist,
  // Budget
  getBudget,
  postBudget,
  updateBudget,
};
