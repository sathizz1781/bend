const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { createUser, userList,updateUser } = require("../modules/user");

router.post("/createuser", createUser);
router.post("/updateuser/:customerId", updateUser);
router.get("/userlist", userList);

module.exports = router;
