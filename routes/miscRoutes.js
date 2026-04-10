const express = require("express");
const { home, test } = require("../controllers/miscController");

const router = express.Router();

router.get("/", home);
router.post("/test", test);

module.exports = router;
