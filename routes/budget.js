const express = require("express");
const router = express.Router();
const {
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
} = require("../modules/budget");

// ===========================
// AUTH ROUTES
// ===========================
router.post("/auth/signup", budgetSignup);
router.post("/auth/login", budgetLogin);
router.post("/auth/logout", budgetLogout);

// ===========================
// USER ROUTES
// ===========================
router.get("/users", userList);
router.patch("/users/:userId", updateUserStatus);

// ===========================
// TRANSACTION ROUTES
// ===========================
router.get("/transactions", getTransactions);
router.post("/transactions", postTransactions);
router.patch("/transactions", updateTransactions);
router.post("/transactions/recurring", createRecurringTransaction);

// ===========================
// WISHLIST ROUTES
// ===========================
router.get("/wishlist", getWishlist);
router.post("/wishlist", postWishlist);
router.put("/wishlist", updateWishlist);

// ===========================
// BUDGET ROUTES
// ===========================
router.get("/budgets", getBudget);
router.post("/budgets", postBudget);
router.put("/budgets", updateBudget);

module.exports = router;
