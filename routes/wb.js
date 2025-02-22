const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { getLastBill } = require("../modules/wb");

router.get("/getlastbill", getLastBill);

module.exports = router;
