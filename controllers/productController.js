const Product = require("../models/Product"); // importer le moddule Product pour pouvoir faire des opérations sur la collection products de la base de données
const Category = require("../models/Categories");

const createProduct = async (req, res) => {
    try {
    const data = { ...req.body };

    if (data.category) {
        const category = await Category.findById(data.category);
        if (!category) {
            return res.status(404).send("Catégorie non trouvée");
        }
    }

    if (data.stock == null) {
        data.stock = 0;
    }

    const product = await Product.create(data); // creer un nouveau produit dans la base de donnÃ©es avec les donnÃ©es envoyÃ©es dans la requete
    res.json(product); // envoyer le produit creer au client
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Error creating product");
    }
};

const getProductsById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        if (!product) {
            return res.status(404).send("Produit non trouvÃ©");
        }
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Error fetching product");
    }
};

const getProducts = async (req, res) => {
    try{
        const products = await Product.find().populate("category"); // chercher tous les produits dans la base de donnees
        res.json(products); // envoyer les produits trouves au client
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    }
};

const updateProduct = async (req, res) => {
    try{
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                return res.status(404).send("Categorie non trouvée");
            }
        }

        if (req.body.stock < 0) {
            return res.status(400).send("Le stock ne peut pas être négatif");
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); // mettre a  jour un produit dans la base de donnees avec les donnees envoyees dans la requete et retourner le produit mis a  jour
        if (!product) {
            return res.status(404).send("Produit non trouvée");
        }
        res.json(product); // envoyer le produit mis a jour au client
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    }
};

const deleteProduct = async (req, res) => {
    try{
        const product = await Product.findByIdAndDelete(req.params.id); // supprimer un produit de la base de donnÃ©es, params sert a recuperer l'id dans l'url de la requete
        if (!product) {
            return res.status(404).send("Produit non trouvÃ©");
        }
        res.send(product); // envoyer le produit supprimÃ© au client
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Error deleting product");
    }
};

const moveStock = async (req, res, type) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Produit non trouvÃ©");
        }

        const quantity = Number(req.body.quantity);
        if (!quantity || quantity <= 0) {
            return res.status(400).send("QuantitÃ© invalide");
        }

        const stockAvant = product.stock || 0;
        let stockApres = stockAvant;

        if (type === "in") {
            stockApres = stockAvant + quantity;
        } else {
            stockApres = stockAvant - quantity;
            if (stockApres < 0) {
                return res.status(400).send("Stock insuffisant: stock nÃ©gatif interdit");
            }
        }

        product.stock = stockApres;
        //console.log("Type envoyée:", type);
        product.mouvements.push({
            mouvementType: type,
            quantity,
            stockAvant,
            stockApres,
            userId: req.user.id,
            note: req.body.note || "",
            date: new Date(),
        });
        //console.log("OBJET PUSH:", {
        //    mouvementType: type,
        //    quantity,
        //    stockAvant,
        //    stockApres,
        //    userId: req.user.id,})

        await product.save();
        //console.log("Mouvement enregistrée:", product.mouvements);

        res.json({
            message: "Mouvement enregistrÃ©",
            product,
        });
    } catch (error) {
        console.error("Error moving stock:", error);
        res.status(500).send("Error moving stock");
    }
};

const stockIn = async (req, res) => {
    return moveStock(req, res, "in");
};

const stockOut = async (req, res) => {
    return moveStock(req, res, "out");
};

const getStockMovements = async (req, res) => {
    try {
        const products = await Product.find().select("name mouvements");
        const allMovements = [];

        for (const product of products) {
            for (const mouvement of product.mouvements || []) {
                allMovements.push({
                    productId: product._id,
                    productName: product.name,
                    ...mouvement.toObject(),
                });
            }
        }

        allMovements.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(allMovements);
    } catch (error) {
        console.error("Error fetching stock movements:", error);
        res.status(500).send("Error fetching stock movements");
    }
};

const getProductStockMovements = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select("name mouvements stock");
        if (!product) {
            return res.status(404).send("Produit non trouvÃ©");
        }

        res.json({
            productId: product._id,
            productName: product.name,
            stock: product.stock,
            mouvements: product.mouvements || [],
        });
    } catch (error) {
        console.error("Error fetching product stock movements:", error);
        res.status(500).send("Error fetching product stock movements");
    }
};

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    stockIn,
    stockOut,
    getStockMovements,
    getProductStockMovements,
    getProductsById,
};
