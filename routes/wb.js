const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { getLastBill ,getPrevWeightOfVehicle,getRecords} = require("../modules/wb");

router.get("/getlastbill", getLastBill);
router.post("/getprevweightofvehicle", getPrevWeightOfVehicle);
router.post("/getrecords", getRecords );

module.exports = router;
