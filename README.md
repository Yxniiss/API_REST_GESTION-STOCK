# 📦 API REST - Gestion de Stock

![Node.js](https://img.shields.io/badge/Node.js-22-green)
![Express](https://img.shields.io/badge/Express.js-Backend-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![License](https://img.shields.io/badge/License-ISC-lightgrey)
![Status](https://img.shields.io/badge/Status-Development-orange)

## 🚀 Description

Ce projet est une API REST de gestion de stock développée avec **Node.js**, **Express** et **MongoDB**.

Il permet de gérer :
- les utilisateurs (authentification)
- les produits
- les catégories
- les rôles (admin / utilisateur)

Le projet suit une architecture **MVC (Model - Controller - Routes)** pour une meilleure organisation du code.

---

## 🛠️ Technologies utilisées

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **JWT (JSON Web Token)**
- **bcryptjs**
- **cors**

---

## 📁 Structure du projet

/project

├── controllers/
├── models/
├── routes/
├── middlewares/
├── index.js
├── package.json



---

## 🔐 Fonctionnalités

- ✅ Inscription utilisateur
- ✅ Connexion utilisateur
- ✅ Authentification sécurisée avec JWT
- ✅ Routes protégées
- ✅ Gestion des rôles (admin / user)
- ✅ CRUD produits
- ✅ CRUD catégories

---

## ⚙️ Installation en local

### 1. Cloner le projet

```bash
git clone https://github.com/Yxniiss/API_REST_GESTION-STOCK.git
cd API_REST_GESTION-STOCK

npm install

npm index.js
