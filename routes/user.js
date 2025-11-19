const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");
const { createUser, userList,updateUser } = require("../modules/user");

router.post("/createuser", createUser);
router.post("/updateuser/:customerId/:wbNumber", updateUser);
router.get("/userlist/:wbNumber", userList);

module.exports = router;
