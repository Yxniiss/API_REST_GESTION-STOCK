const express = require("express"); // sert a creer un serveur facilement et gere plus facilement les routes et les requetes http
const mongoose = require("mongoose"); // pour se connecter a une base de données mongoDB et faire des requetes plus facilement
const User = require("./models/User"); // importer le modèle User pour pouvoir faire des opérations sur la collection users de la base de données
const bcrypt = require("bcryptjs"); // pour hasher les mots de passe avant de les stocker dans la base de données
const jwt = require("jsonwebtoken"); // pour générer des tokens d'authentification pour les utilisateurs après leur connexion
const Product = require("./models/Product"); // importer le modèle Product pour pouvoir faire des opérations sur la collection products de la base de données
const Category = require("./models/Categories");
const Role = require("./models/Roles");
const cors = require("cors");

const app = express(); // creer un serveur express
app.use(express.json()); // pour pouvoir recevoir des données au format json dans les requetes http
app.use(cors()); // pour autoriser les requetes provenant du  frontend qui tourne sur un autre port

mongoose.connect("mongodb://localhost:27017/stock-api")
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((err)=>{
        console.log("Error connecting to MongoDB",err);
    });

const authMiddleware = (req, res, next) => {
    if (!req.headers.authorization) { // vérifier si le token d'authentification est présent dans les headers de la requete
        return res.status(401).send("Token manquant dans les headers");
    }
    const token = req.headers.authorization.split(" ")[1]; // extraire le token d'authentification des headers de la requete
    jwt.verify(token, "cle_secrete", (err, decoded) => {
        if (err) {
            return res.status(401).send("Token invalide");
        }
        req.user = decoded; // stocker les informations de l'utilisateur décodé dans la requete pour pouvoir les utiliser dans les routes protégées
        next(); // passer à la route suivante
    });
}

const roleMiddleware = (role) => {
    return async (req, res, next) => {
        const user = await User.findById(req.user.id); // chercher l'utilisateur dans la base de données par son id pour vérifier son rôle les infos sont stocker dans req.user grâce au middleware d'authentification la ligne decoded

        if (!user) {
            return res.status(404).send("Utilisateur non trouvé");
        }

        if (user.role !== role){
            return res.status(403).send("Accès refusé: mauvais rôle ");
        }
        next();
    };
};

app.get("/",(req,res)=>{
    res.send("Hello World")
});

app.post("/test",(req,res)=>{
    console.log(req.body);
    console.log(req.body.name);
    res.send("test reussi")
});

app.post("/register",async (req,res)=>{
    try{
        const email_register = await User.findOne({ email: req.body.email });

        if (email_register) {
            return res.status(400).json({"error": "email déjà utilisé"});
        }
        req.body.password = await bcrypt.hash(req.body.password,10); // hasher le mot de passe avant de le stocker
        const user = await User.create(req.body);
        res.json(user);
        console.log("User creer avec Succes:", user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
    }
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/views/register.html");
});

app.post("/login",async (req,res)=>{
    try {
        const user = await User.findOne({ email: req.body.email }); // chercher l'utilisateur dans la base de données par son email
        if (!user) {
            return res.status(400).json({"error": "email invalide"});
        }
        const PasswordValid = await bcrypt.compare(req.body.password, user.password); // comparer le mot de passe entré avec le mot de passe hashé dans la base de données
        if (!PasswordValid) {
            return res.status(400).json({"error": "Mot de passe invalide"});
        }
        const token = jwt.sign({id:user._id, role: user.role}, "cle_secrete",{ expiresIn: "24h"}); // generer un token d'authentification avec l'id de l'utilisateur et une clé secrète, le token expire après 1 heure
        res.json({"Login reussi ": {Token: token}}); // envoyer le token d'authentification au client
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Error during login");
    }
});

app.get("/protected", authMiddleware, (req, res) => {
    res.send("Accès autorisé");
});

app.get("/admin", authMiddleware, roleMiddleware("admin"), (req, res) => {
  res.send("Bienvenue admin");
});

app.post("/products", authMiddleware, roleMiddleware("admin"), async (req, res) => {
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

    const product = await Product.create(data); // creer un nouveau produit dans la base de données avec les données envoyées dans la requete
    res.json(product); // envoyer le produit créé au client
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Error creating product");
    }
});

app.get("/products", authMiddleware, async (req, res) => {
    try{
        const products = await Product.find().populate("category"); // chercher tous les produits dans la base de données
        res.json(products); // envoyer les produits trouvés au client
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    }
});

app.put("/products/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try{
        if (req.body.category) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                return res.status(404).send("Catégorie non trouvée");
            }
        }

        if (req.body.stock < 0) {
            return res.status(400).send("Le stock ne peut pas être négatif");
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); // mettre à jour un produit dans la base de données avec les données envoyées dans la requete et retourner le produit mis à jour
        if (!product) {
            return res.status(404).send("Produit non trouvé");
        }
        res.json(product); // envoyer le produit mis à jour au client
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    }
});

app.delete("/products/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try{
        const product = await Product.findByIdAndDelete(req.params.id); // supprimer un produit de la base de données, params sert a recuperer l'id dans l'url de la requete
        if (!product) {
            return res.status(404).send("Produit non trouvé");
        }
        res.send(product); // envoyer le produit supprimé au client
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Error deleting product");
    }
});

const moveStock = async (req, res, type) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send("Produit non trouvé");
        }

        const quantity = Number(req.body.quantity);
        if (!quantity || quantity <= 0) {
            return res.status(400).send("Quantité invalide");
        }

        const stockAvant = product.stock || 0;
        let stockApres = stockAvant;

        if (type === "in") {
            stockApres = stockAvant + quantity;
        } else {
            stockApres = stockAvant - quantity;
            if (stockApres < 0) {
                return res.status(400).send("Stock insuffisant: stock négatif interdit");
            }
        }

        product.stock = stockApres;
        //console.log("Type envoyé:", type);
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
        //console.log("Mouvement enregistré:", product.mouvements);

        res.json({
            message: "Mouvement enregistré",
            product,
        });
    } catch (error) {
        console.error("Error moving stock:", error);
        res.status(500).send("Error moving stock");
    }
};

app.post("/products/:id/stock/in", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    return moveStock(req, res, "in");
});

app.post("/products/:id/stock/out", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    return moveStock(req, res, "out");
});

app.get("/stock-movements", authMiddleware, roleMiddleware("admin"), async (req, res) => {
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
});

app.get("/products/:id/stock-movements", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select("name mouvements stock");
        if (!product) {
            return res.status(404).send("Produit non trouvé");
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
});

app.post("/role", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const role = await Role.create(req.body); // creer un nouveau rôle dans la base de données avec les données envoyées dans la requete
        res.json(role); // envoyer le rôle créé au client
    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).send("Error creating role");
    }
});

app.put("/role/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true }); // mettre à jour un rôle dans la base de données avec les données envoyées dans la requete et retourner le rôle mis à jour
        if (!role) {
            return res.status(404).send("Rôle non trouvé");
        }
        res.json(role); // envoyer le rôle mis à jour au client
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).send("Error updating role");
    }
});

app.delete("/role/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id); // supprimer un rôle de la base de données, params sert a recuperer l'id dans l'url de la requete
        if (!role) {
            return res.status(404).send("Rôle non trouvé");
        }
        res.send(role); // envoyer le rôle supprimé au client
    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).send("Error deleting role");
    }
});

app.get("/role", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const roles = await Role.find(); // chercher tous les rôles dans la base de données
        res.json(roles); // envoyer les rôles trouvés au client
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).send("Error fetching roles");
    }
});

app.put("/users/:id/role", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // chercher l'utilisateur dans la base de données par son id pour vérifier son rôle les infos sont stocker dans req.user grâce au middleware d'authentification la ligne decoded
        if (!user) {
            return res.status(404).send("Utilisateur non trouvé");
        }
        user.role = req.body.role;
        await user.save(); // sauvegarder les modifications de l'utilisateur dans la base de données
        res.json(user); // envoyer l'utilisateur mis à jour au client
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).send("Error updating user role");
    }
});

app.get("/categories", authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find(); // chercher tous les catégories dans la base de données
        res.json(categories); // envoyer les catégories trouvés au client
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send("Error fetching categories");
    }
});

app.post("/categories", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const category = await Category.create(req.body); // creer une nouvelle catégorie dans la base de données avec les données envoyées dans la requete
        res.json(category); // envoyer la catégorie créée au client
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).send("Error creating category");
    }
});

app.put("/categories/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }); // mettre à jour une catégorie dans la base de données avec les données envoyées dans la requete et retourner la catégorie mise à jour
        if (!category) {
            return res.status(404).send("Catégorie non trouvée");
        }
        res.json(category); // envoyer la catégorie mise à jour au client
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).send("Error updating category");
    }
});

app.delete("/categories/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const productUsingCategory = await Product.findOne({ category: req.params.id });
        if (productUsingCategory) {
            return res.status(400).send("Impossible de supprimer: catégorie utilisée par un produit");
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
});

app.listen(3000,()=>{
    console.log("Server is running on port 3000");
});