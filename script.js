// Gestion du panier
let cart = JSON.parse(localStorage.getItem('dctCart')) || [];
let selectedSamples = JSON.parse(localStorage.getItem('dctSamples')) || [];
let checkoutCustomer = JSON.parse(localStorage.getItem('dctCheckoutCustomer')) || {};

const paymentConfig = {
    paypalMeUsername: 'https://www.paypal.me/mxmbr57',
    contactEmail: 'Matteo.frgc@outlook.fr'
};

const samplePerfumes = [
    'JPG Le Mâle EDT',
    'JPG Le Mâle Elixir',
    'Valentino Born in Roma Intense',
    'Azzaro Chrome EDP',
    'Azzaro Chrome EDT',
    'Horace Vintage Vanilla',
    'Stronger With You Amber',
    'Invictus EDT',
    'Scandal Intense',
    'Prada Paradigme',
    'Babycat',
    'Afternoon Swim',
    'Imagination',
    'Symphony',
    'Heure d\'Absences',
    'Dior Homme Intense',
    'Sauvage Elixir',
    'Sauvage EDT',
    'Cuir Saddle EDP',
    'Vanilla Diorama EDP',
    'Gris Dior EDP',
    'Angels\' Share',
    'Creme Brulante',
    'Resolument Affranchi',
    'Rosendo Mateu 5',
    'Rare'
];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCart();
    initModal();
    updateCartCount();
    initFlaconsSearch();
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

function saveSamples() {
    localStorage.setItem('dctSamples', JSON.stringify(selectedSamples));
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

// Recherche sur les pages catalogue
function initFlaconsSearch() {
    const grid = document.querySelector('.flacons-grid');
    const searchInput = document.getElementById('searchInput');
    if (!grid || !searchInput) return;

    const cards = Array.from(grid.querySelectorAll('.perfume-card'));

    const filterCards = () => {
        const query = searchInput.value.trim().toLowerCase();

        cards.forEach((card) => {
            const nameEl = card.querySelector('.perfume-name');
            const brandEl = card.querySelector('.perfume-brand');
            const name = nameEl ? nameEl.textContent.toLowerCase() : '';
            const brand = brandEl ? brandEl.textContent.toLowerCase() : '';
            const matches = name.includes(query) || brand.includes(query);
            card.style.display = matches ? '' : 'none';
        });
    };

    searchInput.addEventListener('input', filterCards);
}

// Afficher le panier
function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartMessage = document.querySelector('.cart-message');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        selectedSamples = [];
        saveSamples();
        cartItemsContainer.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
        if (cartTotalElement) {
            cartTotalElement.textContent = '0,00 €';
        }
        if (cartMessage) {
            cartMessage.innerHTML = renderEmptyCheckoutMessage();
        }
        return;
    }
    
    let itemsHtml = '';
    const total = getCartTotal();
    
    cart.forEach(item => {
        itemsHtml += `
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

    cartItemsContainer.innerHTML = itemsHtml + renderSampleChoices(total);
    initSampleChoiceHandlers(total);
    
    if (cartTotalElement) {
        cartTotalElement.textContent = total.toFixed(2) + ' €';
    }

    renderCheckout(total);
}

function getCartTotal() {
    return cart.reduce((total, item) => total + item.price, 0);
}

function getEligibleSampleCount(total) {
    if (total >= 100) return 3;
    if (total >= 50) return 2;
    if (total > 0) return 1;
    return 0;
}

function renderSampleChoices(total) {
    const sampleCount = getEligibleSampleCount(total);
    selectedSamples = selectedSamples.slice(0, sampleCount);
    saveSamples();

    if (sampleCount === 0) return '';

    const sampleSelects = Array.from({ length: sampleCount }, (_, index) => {
        const selectedValue = selectedSamples[index] || '';
        const options = samplePerfumes.map((sample) => {
            const isSelectedElsewhere = selectedSamples.some((choice, choiceIndex) => {
                return choice === sample && choiceIndex !== index;
            });
            const selected = sample === selectedValue ? ' selected' : '';
            const disabled = isSelectedElsewhere ? ' disabled' : '';
            return `<option value="${escapeHtml(sample)}"${selected}${disabled}>${escapeHtml(sample)}</option>`;
        }).join('');

        return `
            <label class="sample-choice">
                <span>Échantillon offert ${index + 1}</span>
                <select class="sample-select" data-sample-index="${index}">
                    <option value="">Choisir un parfum</option>
                    ${options}
                </select>
            </label>
        `;
    }).join('');

    return `
        <div class="sample-section">
            <div class="sample-header">
                <h3>Échantillons offerts</h3>
                <span>${sampleCount} disponible${sampleCount > 1 ? 's' : ''}</span>
            </div>
            <p>1 échantillon de 0 à 49,99 €, 2 de 50 à 99,99 €, 3 dès 100 €.</p>
            <div class="sample-choices">${sampleSelects}</div>
        </div>
    `;
}

function initSampleChoiceHandlers(total) {
    const sampleCount = getEligibleSampleCount(total);
    if (sampleCount === 0) return;

    document.querySelectorAll('.sample-select').forEach((select) => {
        select.addEventListener('change', function() {
            const index = parseInt(this.dataset.sampleIndex, 10);
            selectedSamples[index] = this.value;
            selectedSamples = selectedSamples
                .slice(0, sampleCount)
                .filter((sample, sampleIndex, samples) => sample === '' || samples.indexOf(sample) === sampleIndex);
            saveSamples();
            renderCart();
        });
    });
}

function renderCheckout(total) {
    const checkoutContainer = document.querySelector('.cart-message');
    if (!checkoutContainer) return;

    checkoutContainer.innerHTML = `
        <div class="checkout-panel">
            <div class="checkout-header">
                <h3>Finaliser la commande</h3>
                <p>Renseignez vos informations, vérifiez vos échantillons, puis choisissez un paiement en ligne.</p>
            </div>
            ${renderSampleValidation(total)}
            <form id="checkoutForm" class="checkout-form">
                <div class="checkout-grid">
                    <label>
                        <span>Nom complet</span>
                        <input type="text" name="fullName" value="${escapeHtml(checkoutCustomer.fullName || '')}" autocomplete="name" required>
                    </label>
                    <label>
                        <span>Email</span>
                        <input type="email" name="email" value="${escapeHtml(checkoutCustomer.email || '')}" autocomplete="email" required>
                    </label>
                    <label>
                        <span>Téléphone</span>
                        <input type="tel" name="phone" value="${escapeHtml(checkoutCustomer.phone || '')}" autocomplete="tel" required>
                    </label>
                    <label>
                        <span>Code postal</span>
                        <input type="text" name="postalCode" value="${escapeHtml(checkoutCustomer.postalCode || '')}" autocomplete="postal-code" required>
                    </label>
                    <label class="checkout-field-wide">
                        <span>Adresse de livraison</span>
                        <input type="text" name="address" value="${escapeHtml(checkoutCustomer.address || '')}" autocomplete="street-address" required>
                    </label>
                    <label>
                        <span>Ville</span>
                        <input type="text" name="city" value="${escapeHtml(checkoutCustomer.city || '')}" autocomplete="address-level2" required>
                    </label>
                    <label>
                        <span>Complément</span>
                        <input type="text" name="deliveryNote" value="${escapeHtml(checkoutCustomer.deliveryNote || '')}" placeholder="Bâtiment, étage...">
                    </label>
                </div>
                <div class="checkout-summary">
                    <div>
                        <span>Total à payer</span>
                        <strong>${formatPrice(total)}</strong>
                    </div>
                    <small>Référence générée au moment du paiement pour retrouver la commande.</small>
                </div>
                <div class="payment-actions">
                    <button type="submit" class="btn btn-primary" data-payment-method="paypal">Payer avec PayPal</button>
                    <button type="button" class="btn btn-outline" id="emailOrderBtn">Envoyer la commande</button>
                </div>
                ${renderPaymentConfigNotice()}
            </form>
        </div>
    `;

    initCheckoutHandlers(total);
}

function renderEmptyCheckoutMessage() {
    return `
        <div class="checkout-panel">
            <div class="checkout-header">
                <h3>Finaliser la commande</h3>
                <p>Ajoutez au moins un parfum au panier pour choisir vos échantillons et payer en ligne.</p>
            </div>
        </div>
    `;
}

function renderSampleValidation(total) {
    const sampleCount = getEligibleSampleCount(total);
    if (sampleCount === 0) return '';

    const selectedCount = selectedSamples.filter(Boolean).length;
    const statusClass = selectedCount === sampleCount ? 'is-complete' : 'is-missing';

    return `
        <div class="checkout-sample-status ${statusClass}">
            <strong>${selectedCount}/${sampleCount} échantillon${sampleCount > 1 ? 's' : ''} choisi${sampleCount > 1 ? 's' : ''}</strong>
            <span>${selectedCount === sampleCount ? 'Votre sélection est prête.' : 'Choisissez tous vos échantillons offerts avant le paiement.'}</span>
        </div>
    `;
}

function renderPaymentConfigNotice() {
    const hasPaypal = Boolean(paymentConfig.paypalMeUsername);

    if (hasPaypal) return '';

    return `
        <p class="payment-config-note">
            Paiement PayPal prêt côté interface. Pour encaisser réellement, renseignez
            <code>paypalMeUsername</code> dans <code>script.js</code>.
        </p>
    `;
}

function initCheckoutHandlers(total) {
    const checkoutForm = document.getElementById('checkoutForm');
    const emailOrderBtn = document.getElementById('emailOrderBtn');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('input', function() {
        checkoutCustomer = getCheckoutCustomer(checkoutForm);
        saveCheckoutCustomer();
    });

    checkoutForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const submitter = event.submitter;
        const method = submitter ? submitter.dataset.paymentMethod : 'paypal';
        startPayment(method, total, checkoutForm);
    });

    if (emailOrderBtn) {
        emailOrderBtn.addEventListener('click', function() {
            sendOrderByEmail(total, checkoutForm);
        });
    }
}

function startPayment(method, total, form) {
    if (!validateCheckout(total, form)) return;

    const order = createOrder(total, form);
    const paymentUrl = buildPaymentUrl(method, order);

    if (!paymentUrl) {
        showNotification('Configurez PayPal dans script.js pour activer ce paiement.');
        return;
    }

    localStorage.setItem('dctPendingOrder', JSON.stringify(order));
    window.open(paymentUrl, '_blank', 'noopener');
    showNotification('Page de paiement ouverte. Conservez la référence de commande.');
}

function sendOrderByEmail(total, form) {
    if (!validateCheckout(total, form)) return;

    const order = createOrder(total, form);
    localStorage.setItem('dctPendingOrder', JSON.stringify(order));

    const subject = encodeURIComponent(`Commande ${order.reference} - DCT FRANCE`);
    const body = encodeURIComponent(formatOrderMessage(order));
    window.location.href = `mailto:${paymentConfig.contactEmail}?subject=${subject}&body=${body}`;
}

function validateCheckout(total, form) {
    const requiredSampleCount = getEligibleSampleCount(total);
    const selectedCount = selectedSamples.filter(Boolean).length;

    if (selectedCount < requiredSampleCount) {
        showNotification('Choisissez tous vos échantillons avant de payer.');
        return false;
    }

    if (!form.reportValidity()) {
        return false;
    }

    checkoutCustomer = getCheckoutCustomer(form);
    saveCheckoutCustomer();
    return true;
}

function getCheckoutCustomer(form) {
    const formData = new FormData(form);
    return {
        fullName: String(formData.get('fullName') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        address: String(formData.get('address') || '').trim(),
        postalCode: String(formData.get('postalCode') || '').trim(),
        city: String(formData.get('city') || '').trim(),
        deliveryNote: String(formData.get('deliveryNote') || '').trim()
    };
}

function saveCheckoutCustomer() {
    localStorage.setItem('dctCheckoutCustomer', JSON.stringify(checkoutCustomer));
}

function createOrder(total, form) {
    const customer = getCheckoutCustomer(form);
    const reference = `DCT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    return {
        reference: reference,
        createdAt: new Date().toISOString(),
        customer: customer,
        items: cart.map(item => ({
            name: item.name,
            brand: item.brand,
            size: item.size,
            price: item.price
        })),
        samples: selectedSamples.filter(Boolean),
        total: total
    };
}

function buildPaymentUrl(method, order) {
    if (method === 'paypal') {
        if (!paymentConfig.paypalMeUsername) return '';
        const paypalBaseUrl = paymentConfig.paypalMeUsername.startsWith('http')
            ? paymentConfig.paypalMeUsername.replace(/\/$/, '')
            : `https://www.paypal.me/${encodeURIComponent(paymentConfig.paypalMeUsername)}`;
        return `${paypalBaseUrl}/${order.total.toFixed(2)}`;
    }

    return '';
}

function formatOrderMessage(order) {
    const lines = [
        `Référence: ${order.reference}`,
        `Total: ${formatPrice(order.total)}`,
        '',
        'Client',
        `Nom: ${order.customer.fullName}`,
        `Email: ${order.customer.email}`,
        `Téléphone: ${order.customer.phone}`,
        `Adresse: ${order.customer.address}`,
        `Ville: ${order.customer.postalCode} ${order.customer.city}`,
        `Complément: ${order.customer.deliveryNote || '-'}`,
        '',
        'Articles'
    ];

    order.items.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.name} - ${item.brand} - ${item.size} ML - ${formatPrice(item.price)}`);
    });

    lines.push('', 'Échantillons offerts');
    order.samples.forEach((sample, index) => {
        lines.push(`${index + 1}. ${sample}`);
    });

    return lines.join('\n');
}

function formatPrice(value) {
    return `${Number(value).toFixed(2)} €`;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
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
