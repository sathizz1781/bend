const getLastBill = async (req, res) => {
  try {
    const users = await User.find().sort({ customerId: -1 });

    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { getLastBill };
