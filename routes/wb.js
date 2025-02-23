const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { getLastBill ,getPrevWeightOfVehicle} = require("../modules/wb");

router.get("/getlastbill", getLastBill);
router.post("/getprevweightofvehicle", getPrevWeightOfVehicle);

module.exports = router;
