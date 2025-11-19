const mongoose = require("mongoose");

const createConfig = async(req,res)=>{
  try{
  let bodyData = req.body
  let insertRecord = {
  ...bodyData,
  subscriptionEndDate:new Date(
  new Date().setFullYear(new Date().getFullYear() + 1)
),
    createdAt:new Date()
    
  }
  const result = await mongoose.connection.db
      .collection("config")
      .insertOne(insertRecord);

    if (result) {
      res.status(201).json({
        message: "Bill inserted successfully"
      });
    } else {
      res.status(500).json({ message: "Failed to insert configs" });
    }
  }catch(error){
     console.error("Error inserting configs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const getConfig = async(req,res)=>{
    try {
        const { phoneNumber } = req.params;
        if (!phoneNumber) {
          return res.status(400).json({ message: "Phone Number is required" });
        }
        const configResult = await mongoose.connection.db
          .collection("config")
          .findOne({ phoneNumber })
        
        res.status(200).json({
          message: "Config data",
          data: configResult||{}
        });
      } catch (error) {
        console.error("Error getting charges:", error);
        res.status(500).json({ message: "Internal server error" });
      }
}
module.exports = { createConfig ,getConfig};
