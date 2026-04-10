const jwt = require("jsonwebtoken"); // pour generer des tokens d'authentification pour les utilisateurs apres leur connexion

const authMiddleware = (req, res, next) => {
    if (!req.headers.authorization) { // vÃ©rifier si le token d'authentification est prÃ©sent dans les headers de la requete
        return res.status(401).send("Token manquant dans les headers");
    }
    const token = req.headers.authorization.split(" ")[1]; // extraire le token d'authentification des headers de la requete
    jwt.verify(token, "cle_secrete", (err, decoded) => {
        if (err) {
            return res.status(401).send("Token invalide");
        }
        req.user = decoded; // stocker les informations de l'utilisateur decode dans la requete pour pouvoir les utiliser dans les routes protegees
        next(); // passer a la route suivante
    });
}

module.exports = authMiddleware;
