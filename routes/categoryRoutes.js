const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.get("/categories", authMiddleware, getCategories);
router.post("/categories", authMiddleware, roleMiddleware("admin"), createCategory);
router.put("/categories/:id", authMiddleware, roleMiddleware("admin"), updateCategory);
router.delete("/categories/:id", authMiddleware, roleMiddleware("admin"), deleteCategory);

module.exports = router;
