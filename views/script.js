console.log("JS connecté");

function adminnavbar(){
    const token = localStorage.getItem("token");
    if(!token) return;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userRole = payload.role;

        const adminLink = document.getElementById("admin-link");

        if(adminLink && userRole !== "admin"){
            adminLink.classList.add("hidden");
        } else if (adminLink) {
            adminLink.classList.remove("hidden");
        }
    } catch (e) {
        console.error("Erreur lors de l'analyse du token", e);
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

function checkAuth() {
    const token = localStorage.getItem("token");
    const publicPages = ["index.html", "register.html"];
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || "index.html";

    if (!token && !publicPages.includes(currentPage)) {
        window.location.href = "index.html";
    }
}

function requireAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        const path = window.location.pathname;
        if (!path.includes("index.html")) {
            window.location.href = "index.html";
        }
        return false;
    }
    return true;
}

checkAuth();
adminnavbar();

async function login() {
    const email_login = document.getElementById("email").value;
    const password_login = document.getElementById("password").value;
    const msgElement = document.getElementById("message");

    const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email: email_login, password: password_login })
    });

    const data = await response.json();

    if (!response.ok) {
        msgElement.className = "error";
        msgElement.textContent = "Email ou mot de passe incorrect";
        return;
    }

    msgElement.className = "success";
    msgElement.textContent = "Connexion réussie...";

    const token = data["Login reussi "].Token;
    localStorage.setItem("token", token);

    setTimeout(() => {
        window.location.href = "products.html";
    }, 1000);
}

async function register(){
    const nom = document.getElementById("nom_register").value;
    const email = document.getElementById("email_register").value;
    const password = document.getElementById("password_register").value;
    const msgElement = document.getElementById("message_register");

    const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name: nom, email, password })
    });

    if (!response.ok) {
        msgElement.className = "error";
        msgElement.textContent = "Erreur lors de l'inscription";
        return;
    }

    msgElement.className = "success";
    msgElement.textContent = "Inscription réussie ! Redirection...";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}

async function deleteProduct(productId) {
    if (!requireAuth() || !confirm("Supprimer ce produit ?")) return;

    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/products/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if(!response.ok){
        alert("Erreur lors de la suppression");
    } else {
        loadProducts();
    }
}

async function updateProduct(productId, currentPrix, currentName) {
    if (!requireAuth()) return;

    const inputName = prompt("Nouveau nom:", currentName);
    if (inputName === null) return;
    
    const inputPrix = prompt("Nouveau prix:", currentPrix);
    if (inputPrix === null) return;

    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/products/${productId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: inputName, prix: Number(inputPrix) })
    });

    if(response.ok) loadProducts();
}

async function add_stock(productId) {
    if (!requireAuth()) return;

    const quantity = Number(prompt("Quantité à ajouter:"));
    if (!quantity || quantity <= 0) return;

    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/products/${productId}/stock/in`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
    });

    loadProducts();
}

async function remove_stock(productId) {
    if (!requireAuth()) return;

    const quantity = Number(prompt("Quantité à retirer:"));
    if (!quantity || quantity <= 0) return;

    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/products/${productId}/stock/out`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
    });

    if (!response.ok) {
        alert("Erreur (stock insuffisant ?)");
    }

    loadProducts();
}

async function loadProducts() {
    if (!requireAuth()) return;

    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userRole = payload.role;

    const response = await fetch("http://localhost:3000/products", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    const container = document.getElementById("Products");
    if (!container) return;

    container.innerHTML = "";

    data.forEach(product => {
        const card = document.createElement("div");
        card.className = "carte_product";
        
        let actionsHtml = "";
        if(userRole === "admin"){
            actionsHtml = `
            <div class="product-actions">
                <button class="btn-secondary" onclick="add_stock('${product._id}')">+ Stock</button>
                <button class="btn-secondary" onclick="remove_stock('${product._id}')">- Stock</button>
                <button class="btn-secondary" onclick="updateProduct('${product._id}', ${product.prix}, '${product.name}')">Modifier</button>
                <button class="btn-secondary" style="color: var(--danger);" onclick="deleteProduct('${product._id}')">Supprimer</button>
                <button class="btn-full" onclick="window.location.href='movement.html?id=${product._id}'">Historique</button>
            </div>
            `;
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <h3 style="margin: 0;">${product.name}</h3>
                <span class="badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}">
                    Stock: ${product.stock}
                </span>
            </div>
            <p style="font-weight: 600; color: var(--text); font-size: 1.125rem;">${product.prix} €</p>
            ${actionsHtml}
        `;
        container.appendChild(card);
    });
}

if (document.getElementById("Products")) {
    loadProducts();
}

async function addProduct() {
    if (!requireAuth()) return;
    const token = localStorage.getItem("token");

    const name = document.getElementById("add_name").value;
    const prix = document.getElementById("add_prix").value;
    const stock = document.getElementById("add_stock").value;

    if (!name || !prix) {
        alert("Veuillez remplir les champs obligatoires");
        return;
    }

    const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            name: name,
            prix: Number(prix),
            stock: Number(stock) || 0
        })
    })

    if(!response.ok){
        alert("Erreur lors de l'ajout du produit");
    }else {
        alert("Produit ajouté avec succès");
        window.location.href = "products.html";
    }
}

async function loadMovement(productId) {
    if (!requireAuth()) return;

    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/products/${productId}/stock-movements`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    const container = document.getElementById("movements");
    if (!container) return;

    container.innerHTML = "";

    if (!data.mouvements || data.mouvements.length === 0) {
        container.innerHTML = "<p class='text-center mt-4'>Aucun mouvement enregistré pour ce produit.</p>";
        return;
    }

    data.mouvements.reverse().forEach(m => {
        const item = document.createElement("div");
        item.className = "movement-item";
        
        // FIX: Compare with "in" instead of "IN"
        const isEntry = m.mouvementType === "in";
        const typeBadge = isEntry ? "badge-success" : "badge-danger";
        const typeText = isEntry ? "Entrée" : "Sortie";

        item.innerHTML = `
            <div class="movement-info">
                <span class="badge ${typeBadge}" style="width: fit-content; margin-bottom: 0.25rem;">${typeText}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(m.date || Date.now()).toLocaleDateString('fr-FR')}</span>
            </div>
            <div style="text-align: right;">
                <div class="movement-stock">Quantité: ${m.quantity}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${m.stockAvant} → ${m.stockApres}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

const params = new URLSearchParams(window.location.search);
const productIdFromUrl = params.get("id");

if (productIdFromUrl && document.getElementById("movements")) {
    loadMovement(productIdFromUrl);
}
