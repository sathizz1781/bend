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
const updateConfig = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({ message: "phoneNumber is required" });
    }

    const bodyData = req.body;

    // Remove subscriptionEndDate if present in body
    if (bodyData.subscriptionEndDate) {
      delete bodyData.subscriptionEndDate; 
    }

    // Prepare update payload
    const updateData = {
      ...bodyData,
      updatedAt: new Date()
    };

    const result = await mongoose.connection.db
      .collection("config")
      .findOneAndUpdate(
        { phoneNumber },
        { $set: updateData },
        { returnDocument: "after" }
      );

    if (!result.value) {
      return res.status(404).json({ message: "Config not found" });
    }

    return res.status(200).json({
      message: "Config updated successfully",
      config: result.value,
    });

  } catch (error) {
    console.error("Error updating config:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getConfig = async (req, res) => {
  try {
    const configResult = await mongoose.connection.db
      .collection("config")
      .find({})
      .sort({ _id: -1 })
      .toArray();

    return res.status(200).json({
      message: "Config data",
      data: configResult || []
    });

  } catch (error) {
    console.error("Error getting config:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createConfig ,getConfig,updateConfig};
