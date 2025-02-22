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
const getCharges = async (req, res) => {
  try {
    const chargeDetails = await mongoose.connection.db
      .collection("charges")
      .find({})
      .toArray(); // Convert cursor to array

    if (!chargeDetails || chargeDetails.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    res.status(200).json({ message: "Charge data", data: chargeDetails });
  } catch (error) {
    console.error("Error getting charges:", error);
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
  const { startDate, endDate,vehicleNo } = req.body;
// console.log(req.body)
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Start date and end date are required" });
  }

  try {
    let query = {
      date: { $gte: startDate, $lte: endDate },
      time: { $gte: "00:00:00", $lte: "23:59:59" } // Time between full day
    }
    if(vehicleNo){
      query = {vehicle_no:vehicleNo}
    }
    const records =  await mongoose.connection.db
      .collection("wb").find(query).sort({ sl_no: -1 })
      .toArray();

    res.json({ records });
  } catch (error) {
    res.status(500).json({ message: "Error fetching records", error });
  }
}
const postBill = async(req,res)=>{
  try{
  let bodyData = req.body
  let insertRecord = {
  "sl_no": bodyData.billNo,
  "date": bodyData.date,
  "time": bodyData.time,
  "vehicle_no": bodyData.vehicleNo,
  "material_name": bodyData.material,
  "party_name": bodyData.party,
  "charges": Number(bodyData.charges),
  "paid_status":bodyData.paidStatus,
  "first_weight": isNaN(Number(bodyData.firstWeight))
      ? 0
      : Number(bodyData.firstWeight),
  "second_weight": isNaN(Number(bodyData.secondWeight))
      ? 0
      : Number(bodyData.secondWeight),
  "net_weight": isNaN(Number(bodyData.netWeight))
      ? 0
      : Number(bodyData.netWeight),
  "whatsapp": bodyData.whatsappNumber

  }
  const result = await mongoose.connection.db
      .collection("wb")
      .insertOne(insertRecord);

    if (result) {
      res.status(201).json({
        message: "Bill inserted successfully"
      });
    } else {
      res.status(500).json({ message: "Failed to insert bill" });
    }
  }catch(error){
     console.error("Error inserting bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
module.exports = { getLastBill,getPrevWeightOfVehicle,getRecords,getCharges,postBill };
