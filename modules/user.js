const User = require("../schema/user");

const createUser = async (req, res) => {
  try {
    const lastUser = await User.findOne().sort({ customerId: -1 });
    console.log("lstuser", lastUser);

    let newCustomerId = "CUST10001"; // Default value
    if (lastUser) {
      // Extract the numeric part of the last customerId (e.g., '10001' from 'CUST10001')
      const lastCustomerIdNumber = parseInt(
        lastUser.customerId.replace("CUST", "")
      );

      // Increment the last customerId number by 1
      newCustomerId = `CUST${lastCustomerIdNumber + 1}`;
    }

    // Create a new user record
    const newUser = new User({
      customerId: newCustomerId,
      email: req.body.email || "",
      companyName: req.body.companyName,
      contactPerson: req.body.contactPerson || "",
      whatsappNumber: req.body.whatsappNumber || "",
      locationUrl: req.body.locationUrl || "",
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      wb_number:req.body.wb_number,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save the new user record
    await newUser.save();

    // Respond with success
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateUser = async(req,res)=>{
  try{
    const { customerId ,wbNumber} = req.params; 
    const updateData = { ...req.body };

    // Optionally remove fields that shouldn't be updated (e.g., customerId)
    delete updateData.customerId;

    // Assuming db is your connected database instance
    const updatedUser = await User.findOneAndUpdate(
      { customerId,wb_number:wbNumber },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  }catch(error){
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const userList = async (req, res) => {
  const wb_number = req.params.wbNumber;
  try {
    const users = await User.find({wb_number}).sort({ customerId: -1 });

    res.status(200).json({ message: "Users retrieved successfully", users });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { createUser, userList,updateUser };
