const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { createConfig,getConfig } = require("../modules/config");

router.post("/post", createConfig);
router.get("/get/:phoneNumber", getConfig);

module.exports = router;
