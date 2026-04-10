const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const { register, registerPage, login, protectedRoute, adminRoute } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.get("/register", registerPage);
router.post("/login", login);
router.get("/protected", authMiddleware, protectedRoute);
router.get("/admin", authMiddleware, roleMiddleware("admin"), adminRoute);

module.exports = router;
