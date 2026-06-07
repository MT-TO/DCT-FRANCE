// Récupérer les données depuis les fichiers data
let perfumesData = [];
let availableSizes = [2, 5, 10, 30];
let cartHandlerInitialized = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Charger les données selon la page
    if (Array.isArray(window.exclusiveData)) {
        perfumesData = window.exclusiveData;
        availableSizes = [5, 10, 30];
    } else if (Array.isArray(window.designersData)) {
        perfumesData = window.designersData;
    } else if (Array.isArray(window.nicheData)) {
        perfumesData = window.nicheData;
    }
    
    if (perfumesData && perfumesData.length > 0) {
        initCartButtons();
        renderPerfumes(perfumesData);
        populateBrandFilter(perfumesData);
        initFilters();
    }
});

// Afficher les parfums
function renderPerfumes(perfumes) {
    const grid = document.getElementById('perfumesGrid');
    if (!grid) return;
    
    if (perfumes.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 3rem; color: var(--text-light);">Aucun parfum trouvé.</p>';
        return;
    }
    
    grid.innerHTML = perfumes.map(perfume => createPerfumeCard(perfume)).join('');
    
    // Ajouter les event listeners pour les menus de formats
    perfumes.forEach((perfume) => {
        const select = document.querySelector(`.size-select[data-perfume-id="${perfume.id}"]`);
        const priceEl = document.querySelector(`.size-price[data-perfume-id="${perfume.id}"]`);
        
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

function initCartButtons() {
    const grid = document.getElementById('perfumesGrid');
    if (!grid || cartHandlerInitialized) return;

    cartHandlerInitialized = true;

    grid.addEventListener('click', function(event) {
        const button = event.target.closest('.add-to-cart-btn');
        if (!button || !grid.contains(button)) return;

        const perfumeId = button.dataset.perfumeId;
        const perfume = perfumesData.find((item) => item.id === perfumeId);
        const select = grid.querySelector(`.size-select[data-perfume-id="${perfumeId}"]`);
        const option = select ? select.selectedOptions[0] : null;

        if (!perfume || !option) return;

        const size = option.value;
        const price = parseFloat(option.dataset.price);

        if (typeof addToCart === 'function' && !Number.isNaN(price)) {
            const wasAdded = addToCart(perfume.name, perfume.brand, size, price);
            if (!wasAdded) return;

            confirmCartButton(button);
        } else if (typeof showNotification === 'function') {
            showNotification('Impossible d\'ajouter cet article au panier.');
        }
    });
}

function confirmCartButton(button) {
    const originalText = button.textContent;
    button.textContent = 'Ajouté';
    button.disabled = true;

    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 900);
}

// Créer une carte de parfum
function createPerfumeCard(perfume) {
    const formats = availableSizes.map((size) => {
        const price = getPriceForSize(perfume, size);
        if (!price || price <= 0) return null;
        return {
            size: size,
            price: price,
            label: `${size} ML`
        };
    }).filter(Boolean);
    
    const optionsHtml = formats.map((format) => `
        <option value="${format.size}" data-price="${format.price.toFixed(2)}">${format.label}</option>
    `).join('');
    
    const formatsHtml = `
        <div class="format-option">
            <div class="format-info">
                <span class="format-size-label">Format</span>
            </div>
            <div class="format-actions">
                <select class="size-select" data-perfume-id="${perfume.id}">
                    ${optionsHtml}
                </select>
                <span class="size-price format-price" data-perfume-id="${perfume.id}"></span>
                <button type="button" class="add-to-cart-btn" data-perfume-id="${perfume.id}">
                    Ajouter au panier
                </button>
            </div>
        </div>
    `;
    
    const priceMlText = perfume.pricePerMl ? `(${perfume.pricePerMl.toFixed(2)} €/ml)` : '';
    
    // Déterminer le chemin de l'image selon la catégorie (vérifier la page actuelle)
    const isNichePage = window.location.pathname.includes('niche.html') ||
                        (Array.isArray(window.nicheData) && window.nicheData.some(p => p.id === perfume.id));
    const imageFolder = isNichePage ? 'images/niches' : 'images/designers';
    // Nettoyer le nom pour le chemin d'image (enlever apostrophes, accents, espaces)
    const imageName = perfume.name.toLowerCase()
        .replace(/'/g, '')
        .replace(/[éèê]/g, 'e')
        .replace(/[àâ]/g, 'a')
        .replace(/[ô]/g, 'o')
        .replace(/[îï]/g, 'i')
        .replace(/[ûù]/g, 'u')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    const imagePath = perfume.image ? perfume.image : `${imageFolder}/${imageName}.jpg`;
    
    return `
        <div class="perfume-card">
            <div class="perfume-image-wrapper">
                <img src="${imagePath}" alt="${perfume.name}" class="perfume-image" onerror="this.style.display='none'">
            </div>
            <div class="perfume-brand">${perfume.brand}</div>
            <h3 class="perfume-name">${perfume.name}</h3>
            ${perfume.pricePerMl ? `<div class="perfume-price-ml">${priceMlText}</div>` : ''}
            <div class="perfume-formats">
                ${formatsHtml}
            </div>
        </div>
    `;
}

function getPriceForSize(perfume, size) {
    if (size === 5 && perfume.price5ml) {
        return perfume.price5ml;
    }
    if (size === 10 && perfume.price10ml) {
        return perfume.price10ml;
    }
    if (size === 30 && perfume.price30ml) {
        return perfume.price30ml;
    }
    
    if (perfume.pricePerMl) {
        return perfume.pricePerMl * size;
    }
    if (perfume.price5ml) {
        return (perfume.price5ml / 5) * size;
    }
    if (perfume.price10ml) {
        return (perfume.price10ml / 10) * size;
    }
    if (perfume.price30ml) {
        return (perfume.price30ml / 30) * size;
    }
    return null;
}

// Remplir le filtre de marques
function populateBrandFilter(perfumes) {
    const filter = document.getElementById('brandFilter');
    if (!filter) return;
    
    const brands = [...new Set(perfumes.map(p => p.brand))].sort();
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        filter.appendChild(option);
    });
}

// Initialiser les filtres
function initFilters() {
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterPerfumes);
    }
    
    if (brandFilter) {
        brandFilter.addEventListener('change', filterPerfumes);
    }
}

// Filtrer les parfums
function filterPerfumes() {
    const searchInput = document.getElementById('searchInput');
    const brandFilter = document.getElementById('brandFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedBrand = brandFilter ? brandFilter.value : '';
    
    let filtered = perfumesData.filter(perfume => {
        const matchesSearch = perfume.name.toLowerCase().includes(searchTerm) ||
                             perfume.brand.toLowerCase().includes(searchTerm);
        const matchesBrand = !selectedBrand || perfume.brand === selectedBrand;
        return matchesSearch && matchesBrand;
    });
    
    renderPerfumes(filtered);
}
