const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { createConfig,getConfig,updateConfig } = require("../modules/config");

router.post("/post", createConfig);
router.put("/put/:phoneNumber",updateConfig)
router.get("/get", getConfig);

module.exports = router;
