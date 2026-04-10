const Category = require("../models/Categories");
const Product = require("../models/Product"); // importer le module Product pour pouvoir faire des opérations sur la collection products de la base de donnéees

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find(); // chercher tous les catégories dans la base de données
        res.json(categories); // envoyer les catégories trouvés au client
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Error fetching categories");
    }
};

const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body); // creer une nouvelle catégorie dans la base de données avec les données envoyées dans la requête
        res.json(category); // envoyer la catégorie créée au client
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).send("Error creating category");
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }); // mettre à jour une catégorie dans la base de données avec les données envoyées dans la requête et retourner la catégorie mise à jour
        if (!category) {
            return res.status(404).send("Catégorie non trouvée");
        }
        res.json(category); // envoyer la catégorie mise à jour au client
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send("Error updating category");
    }
};

const deleteCategory = async (req, res) => {
    try {
        const productUsingCategory = await Product.findOne({ category: req.params.id });
        if (productUsingCategory) {
            return res.status(400).send("Impossible de supprimer: catÃ©gorie utilisÃ©e par un produit");
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).send("Catégorie non trouvée");
        }
        res.send(category); // envoyer la catégorie supprimée au client
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).send("Error deleting category");
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
