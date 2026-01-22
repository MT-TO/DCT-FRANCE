// Gestion du panier
let cart = JSON.parse(localStorage.getItem('dctCart')) || [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCart();
    initModal();
    updateCartCount();
});

// Navigation mobile
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Fermer le menu quand on clique sur un lien
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Gestion du lien panier
    const cartLinks = document.querySelectorAll('.cart-link');
    cartLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openCartModal();
        });
    });
}

// Initialisation du panier
function initCart() {
    updateCartCount();
    renderCart();
}

// Modal du panier
function initModal() {
    const modal = document.getElementById('cartModal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeCartModal();
        });
    }
    
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeCartModal();
            }
        });
    }
}

// Ouvrir le modal du panier
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        renderCart();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Fermer le modal du panier
function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Ajouter au panier
function addToCart(perfumeName, brand, size, price) {
    const item = {
        id: Date.now(),
        name: perfumeName,
        brand: brand,
        size: size,
        price: parseFloat(price)
    };
    
    cart.push(item);
    saveCart();
    updateCartCount();
    
    // Animation de confirmation
    showNotification('Article ajouté au panier !');
}

// Retirer du panier
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    renderCart();
}

// Sauvegarder le panier
function saveCart() {
    localStorage.setItem('dctCart', JSON.stringify(cart));
}

// Mettre à jour le compteur du panier
function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const count = cart.length;
    
    countElements.forEach(element => {
        if (element) {
            element.textContent = count;
            if (count > 0) {
                element.style.display = 'inline-block';
            } else {
                element.style.display = 'none';
            }
        }
    });
    
    // Mettre à jour aussi dans les liens panier
    const cartCountElements = document.getElementById('cartCount');
    if (cartCountElements) {
        cartCountElements.textContent = count;
    }
}

// Afficher le panier
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
        if (cartTotalElement) {
            cartTotalElement.textContent = '0,00 €';
        }
        return;
    }
    
    let html = '';
    let total = 0;
    
    cart.forEach(item => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">${item.brand} - ${item.size} ML</div>
                </div>
                <div style="display: flex; align-items: center;">
                    <span class="cart-item-price">${item.price.toFixed(2)} €</span>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.id})">×</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = html;
    
    if (cartTotalElement) {
        cartTotalElement.textContent = total.toFixed(2) + ' €';
    }
}

// Notification
function showNotification(message) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: #2c3e50;
        color: white;
        padding: 15px 25px;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Ajouter les styles d'animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
