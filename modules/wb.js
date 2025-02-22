const mongoose = require("mongoose");

const getLastBill = async (req, res) => {
  const collection = mongoose.connection.db.collection("wb");
  try {
    const lastRecord = await collection.findOne({}, { sort: { sl_no: -1 } });

    if (!lastRecord) {
      return res.status(404).json({ message: "No records found" });
    }
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { getLastBill };
