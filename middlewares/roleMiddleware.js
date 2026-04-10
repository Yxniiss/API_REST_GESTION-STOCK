const User = require("../models/User"); // importer le modÃ¨le User pour pouvoir faire des opÃ©rations sur la collection users de la base de donnÃ©es

const roleMiddleware = (role) => {
    return async (req, res, next) => {
        const user = await User.findById(req.user.id); // chercher l'utilisateur dans la base de donnÃ©es par son id pour vÃ©rifier son rÃ´le les infos sont stocker dans req.user grÃ¢ce au middleware d'authentification la ligne decoded

        if (!user) {
            return res.status(404).send("Utilisateur non trouvÃ©");
        }

        if (user.role !== role){
            return res.status(403).send("AccÃ¨s refusÃ©: mauvais rÃ´le ");
        }
        next();
    };
};

module.exports = roleMiddleware;
