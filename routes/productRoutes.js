const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    stockIn,
    stockOut,
    getStockMovements,
    getProductStockMovements,
    getProductsById,
} = require("../controllers/productController");

const router = express.Router();

router.post("/products", authMiddleware, roleMiddleware("admin"), createProduct);
router.get("/products/:id", authMiddleware, getProductsById);
router.get("/products", authMiddleware, getProducts);
router.put("/products/:id", authMiddleware, roleMiddleware("admin"), updateProduct);
router.delete("/products/:id", authMiddleware, roleMiddleware("admin"), deleteProduct);
router.post("/products/:id/stock/in", authMiddleware, roleMiddleware("admin"), stockIn);
router.post("/products/:id/stock/out", authMiddleware, roleMiddleware("admin"), stockOut);
router.get("/stock-movements", authMiddleware, roleMiddleware("admin"), getStockMovements);
router.get("/products/:id/stock-movements", authMiddleware, roleMiddleware("admin"), getProductStockMovements);

module.exports = router;
