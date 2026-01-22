// Récupérer les données depuis les fichiers data
let perfumesData = [];
const availableSizes = [1, 2, 3, 4, 5, 10, 30];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Charger les données selon la page
    if (typeof window.designersData !== 'undefined') {
        perfumesData = window.designersData;
    } else if (typeof window.nicheData !== 'undefined') {
        perfumesData = window.nicheData;
    }
    
    if (perfumesData && perfumesData.length > 0) {
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
    
    // Ajouter les event listeners pour les menus de formats et les boutons "Ajouter au panier"
    perfumes.forEach((perfume) => {
        const select = document.querySelector(`.size-select[data-perfume-id="${perfume.id}"]`);
        const priceEl = document.querySelector(`.size-price[data-perfume-id="${perfume.id}"]`);
        const button = document.querySelector(`.add-to-cart-${perfume.id}`);
        
        if (select && priceEl) {
            const updatePrice = () => {
                const option = select.selectedOptions[0];
                const price = option ? option.dataset.price : null;
                priceEl.textContent = price ? `${parseFloat(price).toFixed(2)} €` : '';
            };
            
            updatePrice();
            select.addEventListener('change', updatePrice);
        }
        
        if (button && select) {
            button.addEventListener('click', function() {
                const option = select.selectedOptions[0];
                if (!option) return;
                const size = option.value;
                const price = parseFloat(option.dataset.price);
                if (typeof addToCart === 'function' && !Number.isNaN(price)) {
                    addToCart(perfume.name, perfume.brand, size, price);
                }
            });
        }
    });
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
                <button class="add-to-cart-btn add-to-cart-${perfume.id}">
                    Ajouter
                </button>
            </div>
        </div>
    `;
    
    const priceMlText = perfume.pricePerMl ? `(${perfume.pricePerMl.toFixed(2)} €/ml)` : '';
    
    // Déterminer le chemin de l'image selon la catégorie (vérifier la page actuelle)
    const isNichePage = window.location.pathname.includes('niche.html') || 
                        (typeof window.nicheData !== 'undefined' && window.nicheData.some(p => p.id === perfume.id));
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
