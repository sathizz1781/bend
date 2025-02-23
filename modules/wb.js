const mongoose = require("mongoose");

const getLastBill = async (req, res) => {
  const collection = mongoose.connection.db.collection("wb");
  try {
    const lastRecord = await mongoose.connection.db
      .collection("wb")
      .findOne({}, { sort: { sl_no: -1 } }); // Corrected syntax

    if (!lastRecord) {
      return res.status(404).json({ message: "No records found" });
    }

    res.status(200).json({ message: "Last record retrieved successfully", data: lastRecord });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getPrevWeightOfVehicle = async (req, res) => {
  
  try {
console.log(req.body);
    const vehicleNo = req.body.vehicleNo;
    
    // Retrieve all records for the given vehicleNo sorted descending by sl_no
    const records = await mongoose.connection.db
      .collection("wb")
      .find({ vehicle_no: vehicleNo })
      .sort({ sl_no: -1 })
      .toArray();

    if (!records || records.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    res.status(200).json({ message: "Last Weight list", data: records });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getRecords =  async (req, res) => {
  const { startDate, endDate } = req.body;
console.log(req.body)
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Start date and end date are required" });
  }

  try {
    const records =  await mongoose.connection.db
      .collection("wb").find({
      date: { $gte: startDate, $lte: endDate },
      time: { $gte: "00:00:00", $lte: "23:59:59" } // Time between full day
    }).sort({ sl_no: -1 })
      .toArray();

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error });
  }
}

module.exports = { getLastBill,getPrevWeightOfVehicle,getRecords };
