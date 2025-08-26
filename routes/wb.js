const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { getLastBill ,getPrevWeightOfVehicle,getRecords,getCharges,postBill,getSingleRecord} = require("../modules/wb");

router.get("/getlastbill", getLastBill);
router.post("/getprevweightofvehicle", getPrevWeightOfVehicle);
router.post("/postbill", postBill);
router.post("/getrecords", getRecords );
router.get("/charges", getCharges );
router.post("/getsinglerecords", getSingleRecord );

module.exports = router;
