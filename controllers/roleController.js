const Role = require("../models/Roles");
const User = require("../models/User"); // importer le module User pour pouvoir faire des opÃ©rations sur la collection users de la base de données

const createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body); // creer un nouveau role dans la base de donnees avec les donnees envoyees dans la requete
        res.json(role); // envoyer le role au client
    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).send("Error creating role");
    }
};

const updateRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true }); // mettre à jour un role dans la base de donnees avec les donnees envoyees dans la requete et retourner le role mis à jour
        if (!role) {
            return res.status(404).send("Role non trouve");
        }
        res.json(role); // envoyer le role mis à jour au client
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).send("Error updating role");
    }
};

const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id); // supprimer un role de la base de donnees, params sert a recuperer l'id dans l'url de la requete
        if (!role) {
            return res.status(404).send("Role non trouve");
        }
        res.send(role); // envoyer le role supprime au client
    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).send("Error deleting role");
    }
};

const getRoles = async (req, res) => {
    try {
        const roles = await Role.find(); // chercher tous les roles dans la base de donnees
        res.json(roles); // envoyer les roles trouves au client
    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).send("Error fetching roles");
    }
};

const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id); // chercher l'utilisateur dans la base de donnees par son id pour verifier son role les infos sont stocker dans req.user grâce au middleware d'authentification la ligne decoded
        if (!user) {
            return res.status(404).send("Utilisateur non trouvÃ©");
        }
        user.role = req.body.role;
        await user.save(); // sauvegarder les modifications de l'utilisateur dans la base de donnees
        res.json(user); // envoyer l'utilisateur mis a  jour au client
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).send("Error updating user role");
    }
};

module.exports = {
    createRole,
    updateRole,
    deleteRole,
    getRoles,
    updateUserRole,
};
