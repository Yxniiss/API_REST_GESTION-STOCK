const express = require("express"); // sert a creer un serveur facilement et gere plus facilement les routes et les requetes http
const mongoose = require("mongoose"); // pour se connecter a une base de donnÃ©es mongoDB et faire des requetes plus facilement
const cors = require("cors");
require("dotenv").config(); // pour charger les variables d'environnement depuis un fichier .env
const miscRoutes = require("./routes/miscRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const roleRoutes = require("./routes/roleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express(); // creer un serveur express
app.use(express.json()); // pour pouvoir recevoir des données au format json dans les requetes http
app.use(cors()); 

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((err)=>{
        console.log("Error connecting to MongoDB",err);
    });

app.use(miscRoutes);
app.use(authRoutes);
app.use(productRoutes);
app.use(roleRoutes);
app.use(categoryRoutes);

app.listen(process.env.PORT || 3000,()=>{
    console.log("Server is running");
});
