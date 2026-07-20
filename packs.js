// Rendu et gestion des packs
const packSizes = [2, 5, 10, 30];

document.addEventListener('DOMContentLoaded', function() {
    if (Array.isArray(window.packsData) && window.packsData.length > 0) {
        renderPacks(window.packsData);
        initPackCartButtons();
    }
});

// Afficher les packs
function renderPacks(packs) {
    const grid = document.getElementById('packsGrid');
    if (!grid) return;

    grid.innerHTML = packs.map(pack => createPackCard(pack)).join('');

    packs.forEach((pack) => {
        const select = document.querySelector(`.size-select[data-pack-id="${pack.id}"]`);
        const priceEl = document.querySelector(`.size-price[data-pack-id="${pack.id}"]`);

        if (select && priceEl) {
            const updatePrice = () => {
                const option = select.selectedOptions[0];
                const price = option ? option.dataset.price : null;
                priceEl.textContent = price ? `${parseFloat(price).toFixed(2)} €` : '';
            };

            updatePrice();
            select.addEventListener('change', updatePrice);
        }
    });
}

// Créer une carte de pack
function createPackCard(pack) {
    const isAvailable = pack.available !== false;
    const optionsHtml = packSizes.map((size) => `
        <option value="${size}" data-price="${pack.prices[size].toFixed(2)}">${size} ML</option>
    `).join('');

    return `
        <div class="pack-card${isAvailable ? '' : ' perfume-card--unavailable'}">
            <div class="pack-image-wrapper">
                ${isAvailable ? '' : '<span class="unavailable-badge">Indisponible</span>'}
                <img src="${pack.image}" alt="${pack.name}" class="pack-image" loading="lazy" decoding="async" onerror="this.style.visibility='hidden'">
            </div>
            <div class="pack-body">
                <h3 class="pack-name">${pack.name}</h3>
                ${pack.subtitle ? `<p class="pack-subtitle">${pack.subtitle}</p>` : ''}
                <div class="perfume-formats">
                    <div class="format-option">
                        <div class="format-info">
                            <span class="format-size-label">Format</span>
                        </div>
                        <div class="format-actions">
                            <select class="size-select" data-pack-id="${pack.id}" ${isAvailable ? '' : 'disabled'}>
                                ${optionsHtml}
                            </select>
                            <span class="size-price format-price" data-pack-id="${pack.id}"></span>
                            <button type="button" class="add-to-cart-btn" data-pack-id="${pack.id}" ${isAvailable ? '' : 'disabled'}>
                                ${isAvailable ? 'Ajouter au panier' : 'Indisponible'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initPackCartButtons() {
    const grid = document.getElementById('packsGrid');
    if (!grid) return;

    grid.addEventListener('click', function(event) {
        const button = event.target.closest('.add-to-cart-btn');
        if (!button || !grid.contains(button)) return;

        const packId = button.dataset.packId;
        const pack = window.packsData.find((item) => item.id === packId);
        const select = grid.querySelector(`.size-select[data-pack-id="${packId}"]`);
        const option = select ? select.selectedOptions[0] : null;

        if (!pack || !option) return;

        const size = option.value;
        const price = parseFloat(option.dataset.price);

        if (typeof addToCart === 'function' && !Number.isNaN(price)) {
            const wasAdded = addToCart(pack.name, 'Pack', size, price);
            if (!wasAdded) return;

            const originalText = button.textContent;
            button.textContent = 'Ajouté';
            button.disabled = true;

            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 900);
        } else if (typeof showNotification === 'function') {
            showNotification('Impossible d\'ajouter cet article au panier.');
        }
    });
}
