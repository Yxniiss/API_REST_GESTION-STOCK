const User = require("../models/User"); // importer le modÃ¨le User pour pouvoir faire des opÃ©rations sur la collection users de la base de donnÃ©es
const bcrypt = require("bcryptjs"); // pour hasher les mots de passe avant de les stocker dans la base de donnÃ©es
const jwt = require("jsonwebtoken"); // pour gÃ©nÃ©rer des tokens d'authentification pour les utilisateurs aprÃ¨s leur connexion

const register = async (req,res)=>{
    try{
        const email_register = await User.findOne({ email: req.body.email });

        if (email_register) {
            return res.status(400).json({"error": "email dÃ©jÃ  utilisÃ©"});
        }
        req.body.password = await bcrypt.hash(req.body.password,10); // hasher le mot de passe avant de le stocker
        const user = await User.create(req.body);
        res.json(user);
        console.log("User creer avec Succes:", user);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
    }
};

const registerPage = (req, res) => {
    res.sendFile(__dirname + "/../views/register.html");
};

const login = async (req,res)=>{
    try {
        const user = await User.findOne({ email: req.body.email }); // chercher l'utilisateur dans la base de donnÃ©es par son email
        if (!user) {
            return res.status(400).json({"error": "email invalide"});
        }
        const PasswordValid = await bcrypt.compare(req.body.password, user.password); // comparer le mot de passe entrÃ© avec le mot de passe hashÃ© dans la base de donnÃ©es
        if (!PasswordValid) {
            return res.status(400).json({"error": "Mot de passe invalide"});
        }
        const token = jwt.sign({id:user._id, role: user.role}, "cle_secrete",{ expiresIn: "24h"}); // generer un token d'authentification avec l'id de l'utilisateur et une clÃ© secrÃ¨te, le token expire aprÃ¨s 1 heure
        res.json({"Login reussi ": {Token: token}}); // envoyer le token d'authentification au client
    }
    catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Error during login");
    }
};

const protectedRoute = (req, res) => {
    res.send("AccÃ¨s autorisÃ©");
};

const adminRoute = (req, res) => {
  res.send("Bienvenue admin");
};

module.exports = {
    register,
    registerPage,
    login,
    protectedRoute,
    adminRoute,
};
