const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
    createRole,
    updateRole,
    deleteRole,
    getRoles,
    updateUserRole,
} = require("../controllers/roleController");

const router = express.Router();

router.post("/role", authMiddleware, roleMiddleware("admin"), createRole);
router.put("/role/:id", authMiddleware, roleMiddleware("admin"), updateRole);
router.delete("/role/:id", authMiddleware, roleMiddleware("admin"), deleteRole);
router.get("/role", authMiddleware, roleMiddleware("admin"), getRoles);
router.put("/users/:id/role", authMiddleware, roleMiddleware("admin"), updateUserRole);

module.exports = router;
