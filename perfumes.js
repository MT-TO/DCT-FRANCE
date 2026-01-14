// Récupérer les données depuis les fichiers data
let perfumesData = [];

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
    
    // Ajouter les event listeners pour les boutons "Ajouter au panier"
    perfumes.forEach((perfume) => {
        const formats = [];
        if (perfume.price5ml && perfume.price5ml > 0) {
            formats.push({ size: '5ml', price: perfume.price5ml, label: '5 ML' });
        }
        if (perfume.price10ml && perfume.price10ml > 0) {
            formats.push({ size: '10ml', price: perfume.price10ml, label: '10 ML' });
        }
        if (perfume.price30ml && perfume.price30ml > 0) {
            formats.push({ size: '30ml', price: perfume.price30ml, label: '30 ML' });
        }
        
        formats.forEach((format, formatIndex) => {
            const button = document.querySelector(`.add-to-cart-${perfume.id}[data-size="${format.size}"]`);
            if (button) {
                button.addEventListener('click', function() {
                    if (typeof addToCart === 'function') {
                        addToCart(perfume.name, perfume.brand, format.size, format.price);
                    }
                });
            }
        });
    });
}

// Créer une carte de parfum
function createPerfumeCard(perfume) {
    const formats = [];
    
    if (perfume.price5ml && perfume.price5ml > 0) {
        formats.push({
            size: '5ml',
            price: perfume.price5ml,
            label: '5 ML'
        });
    }
    
    if (perfume.price10ml && perfume.price10ml > 0) {
        formats.push({
            size: '10ml',
            price: perfume.price10ml,
            label: '10 ML'
        });
    }
    
    if (perfume.price30ml && perfume.price30ml > 0) {
        formats.push({
            size: '30ml',
            price: perfume.price30ml,
            label: '30 ML'
        });
    }
    
    const formatsHtml = formats.map((format) => `
        <div class="format-option">
            <div class="format-info">
                <span class="format-size-label">${format.label}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="format-price">${format.price.toFixed(2)} €</span>
                <button class="add-to-cart-btn add-to-cart-${perfume.id}" data-size="${format.size}">
                    Ajouter
                </button>
            </div>
        </div>
    `).join('');
    
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
    const imagePath = `${imageFolder}/${imageName}.jpg`;
    
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
