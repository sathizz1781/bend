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
const updatePaidStatus = async (req, res) => {
  const { sl_nos } = req.body;

  if (!sl_nos || !Array.isArray(sl_nos) || sl_nos.length === 0) {
    return res.status(400).json({ message: "sl Nos array is required" });
  }

  try {
    const result = await mongoose.connection.db
      .collection("wb")
      .updateMany(
        { sl_no: { $in: sl_nos } },
        { $set: { paid_status: true } }
      );

    res.json({
      message: "Paid status updated successfully",
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating paid_status:", error);
    res.status(500).json({ message: "Error updating paid_status", error });
  }
};


const getRecords = async (req, res) => {
  const { startDate, endDate, vehicleNo, partyName } = req.body;

  if (!startDate || !endDate) {
    return res
      .status(400)
      .json({ message: "Start date and end date are required" });
  }

  try {
    // Convert input dd/MM/yyyy strings -> real Date objects
    const parseDate = (str) => {
      const [d, m, y] = str.split("/").map(Number);
      return new Date(y, m - 1, d);
    };

    const start = parseDate(startDate);
    const end = parseDate(endDate);

    // Build aggregation pipeline
    const pipeline = [
      {
        $addFields: {
          // normalize date string -> always dd/MM/yyyy
          normDate: {
            $dateFromString: {
              dateString: {
                $concat: [
                  {
                    $cond: [
                      { $lt: [{ $strLenCP: { $arrayElemAt: [{ $split: ["$date", "/"] }, 0] } }, 2] },
                      { $concat: ["0", { $arrayElemAt: [{ $split: ["$date", "/"] }, 0] }] },
                      { $arrayElemAt: [{ $split: ["$date", "/"] }, 0] }
                    ]
                  },
                  "/",
                  {
                    $cond: [
                      { $lt: [{ $strLenCP: { $arrayElemAt: [{ $split: ["$date", "/"] }, 1] } }, 2] },
                      { $concat: ["0", { $arrayElemAt: [{ $split: ["$date", "/"] }, 1] }] },
                      { $arrayElemAt: [{ $split: ["$date", "/"] }, 1] }
                    ]
                  },
                  "/",
                  { $arrayElemAt: [{ $split: ["$date", "/"] }, 2] }
                ]
              },
              format: "%d/%m/%Y"
            }
          }
        }
      },
      {
        $match: {
          normDate: { $gte: start, $lte: end },
          ...(vehicleNo ? { vehicle_no: vehicleNo } : {}),
          ...(partyName ? { partyName: { $regex: partyName, $options: "i" } } : {})
        }
      },
      { $sort: { sl_no: -1 } }
    ];

    const records = await mongoose.connection.db
      .collection("wb")
      .aggregate(pipeline)
      .toArray();

    res.json({ records });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ message: "Error fetching records", error });
  }
};


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
const getSingleRecord = async (req, res) => {
  try {
    console.log(req.body);
    const { sl_no } = req.body;

    if (!sl_no) {
      return res.status(400).json({ message: "sl_no is required" });
    }

    const record = await mongoose.connection.db
      .collection("wb")
      .findOne({ sl_no });

    if (!record) {
      return res.status(404).json({ message: "No record found" });
    }

    res.status(200).json({ message: "Record found", data: record });
  } catch (error) {
    console.error("Error getting record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getLastBill,getPrevWeightOfVehicle,getRecords,getCharges,postBill,getSingleRecord,updatePaidStatus };
