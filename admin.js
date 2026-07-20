// Administration DCT FRANCE
// Lit et réécrit directement data-designers.js / data-niche.js / data-exclusive.js / data-packs.js
// via l'API File System Access (Chrome / Edge). Rien n'est envoyé sur un serveur : tout reste local.

const CATEGORY_CONFIG = {
    designers: {
        file: 'data-designers.js',
        varName: 'designersData',
        label: 'Designers',
        kind: 'perfume',
        imageFolder: 'images/designers',
        headerComment: 'Données des parfums de designers'
    },
    niche: {
        file: 'data-niche.js',
        varName: 'nicheData',
        label: 'Niches',
        kind: 'perfume',
        imageFolder: 'images/niches',
        headerComment: 'Données des parfums de niche'
    },
    exclusive: {
        file: 'data-exclusive.js',
        varName: 'exclusiveData',
        label: 'Exclusifs',
        kind: 'perfume',
        imageFolder: 'images/designers',
        headerComment: 'Données des parfums exclusifs'
    },
    packs: {
        file: 'data-packs.js',
        varName: 'packsData',
        label: 'Packs',
        kind: 'pack',
        imageFolder: 'images/packs',
        headerComment: 'Données des packs'
    }
};

const fsAccessSupported = typeof window.showDirectoryPicker === 'function';

let dirHandle = null;
let writeMode = false;
let editingContext = null; // { category, id: string|null }

const state = {};
Object.keys(CATEGORY_CONFIG).forEach((key) => {
    state[key] = { items: [], brandOrder: [], dirty: false };
});

// ------------------------------------------------------------------
// Références DOM
// ------------------------------------------------------------------
const connectionStatus = document.getElementById('connectionStatus');
const connectBtn = document.getElementById('connectBtn');
const fallbackFileInput = document.getElementById('fallbackFileInput');
const compatBanner = document.getElementById('compatBanner');
const fallbackLoadBtn = document.getElementById('fallbackLoadBtn');
const toastEl = document.getElementById('toast');
const adminMain = document.getElementById('adminMain');
const adminEmpty = document.getElementById('adminEmpty');
const adminTabs = document.getElementById('adminTabs');

const itemModal = document.getElementById('itemModal');
const itemModalTitle = document.getElementById('itemModalTitle');
const itemModalClose = document.getElementById('itemModalClose');
const itemModalCancel = document.getElementById('itemModalCancel');
const itemForm = document.getElementById('itemForm');

const fieldId = document.getElementById('fieldId');
const rowBrand = document.getElementById('rowBrand');
const fieldBrand = document.getElementById('fieldBrand');
const fieldName = document.getElementById('fieldName');
const nameOrPackLabel = document.getElementById('nameOrPackLabel');
const rowSubtitle = document.getElementById('rowSubtitle');
const fieldSubtitle = document.getElementById('fieldSubtitle');
const fieldImage = document.getElementById('fieldImage');
const fieldImageFile = document.getElementById('fieldImageFile');
const imagePreview = document.getElementById('imagePreview');
const rowFragrantica = document.getElementById('rowFragrantica');
const fieldFragrantica = document.getElementById('fieldFragrantica');
const fieldFragranticaFile = document.getElementById('fieldFragranticaFile');
const rowPricePerMl = document.getElementById('rowPricePerMl');
const fieldPricePerMl = document.getElementById('fieldPricePerMl');
const rowPricesPerfume = document.getElementById('rowPricesPerfume');
const fieldPrice5 = document.getElementById('fieldPrice5');
const fieldPrice10 = document.getElementById('fieldPrice10');
const fieldPrice30 = document.getElementById('fieldPrice30');
const rowPricesPack = document.getElementById('rowPricesPack');
const fieldPackPrice2 = document.getElementById('fieldPackPrice2');
const fieldPackPrice5 = document.getElementById('fieldPackPrice5');
const fieldPackPrice10 = document.getElementById('fieldPackPrice10');
const fieldPackPrice30 = document.getElementById('fieldPackPrice30');
const fieldAvailable = document.getElementById('fieldAvailable');

// ------------------------------------------------------------------
// Utilitaires
// ------------------------------------------------------------------
function slugify(str) {
    return (str || '').toLowerCase()
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
}

function jsString(value) {
    return "'" + String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function formatNum(value) {
    if (value === null || value === undefined || value === '') return 'null';
    const num = Number(value);
    if (Number.isNaN(num)) return 'null';
    return Number.isInteger(num) ? String(num) : String(Math.round(num * 100) / 100);
}

function generateId(category, seed, existingIds) {
    let base;
    if (category === 'exclusive') {
        base = `exclusive-${slugify(seed) || 'item'}`;
    } else if (category === 'packs') {
        base = `pack-${slugify(seed) || 'pack'}`;
    } else {
        base = slugify(seed) || category;
    }
    let n = 1;
    let id = `${base}-${n}`;
    while (existingIds.has(id)) {
        n += 1;
        id = `${base}-${n}`;
    }
    return id;
}

let toastTimer = null;
function showToast(message, isError) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastEl.classList.toggle('toast--error', !!isError);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 5000);
}

function downloadText(filename, text) {
    const blob = new Blob([text], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

// ------------------------------------------------------------------
// Lecture des fichiers data-*.js
// ------------------------------------------------------------------
function parseDataFile(config, text) {
    window[config.varName] = undefined;
    try {
        // Les fichiers data-*.js ne font que "window.xxxData = [...]" : les exécuter
        // équivaut à les charger via une balise <script>, mais depuis leur contenu texte.
        // eslint-disable-next-line no-new-func
        new Function(text)();
    } catch (e) {
        throw new Error(`Impossible de lire ${config.file} : ${e.message}`);
    }
    const data = window[config.varName];
    window[config.varName] = undefined;
    if (!Array.isArray(data)) {
        throw new Error(`${config.file} ne contient pas de tableau window.${config.varName}.`);
    }
    return data.map((item) => ({ ...item }));
}

function applyLoadedItems(key, config, text) {
    const items = parseDataFile(config, text);
    state[key].items = items;
    state[key].brandOrder = config.kind === 'perfume' ? [...new Set(items.map((i) => i.brand))] : [];
    state[key].dirty = false;
}

async function loadCategoryFromHandle(key) {
    const config = CATEGORY_CONFIG[key];
    const fileHandle = await dirHandle.getFileHandle(config.file);
    const file = await fileHandle.getFile();
    const text = await file.text();
    applyLoadedItems(key, config, text);
}

async function connectFolder() {
    try {
        dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    } catch (e) {
        if (e.name !== 'AbortError') {
            showToast('Connexion au dossier refusée ou annulée.', true);
        }
        return;
    }

    try {
        for (const key of Object.keys(CATEGORY_CONFIG)) {
            await loadCategoryFromHandle(key);
        }
    } catch (e) {
        showToast(e.message, true);
        return;
    }

    writeMode = true;
    setConnected(true, true);
    renderAll();
}

fallbackFileInput.addEventListener('change', async () => {
    const files = [...fallbackFileInput.files];
    let loadedAny = false;
    for (const file of files) {
        const key = Object.keys(CATEGORY_CONFIG).find((k) => CATEGORY_CONFIG[k].file === file.name);
        if (!key) {
            showToast(`Fichier ignoré (nom inattendu) : ${file.name}`, true);
            continue;
        }
        try {
            const text = await file.text();
            applyLoadedItems(key, CATEGORY_CONFIG[key], text);
            loadedAny = true;
        } catch (e) {
            showToast(e.message, true);
        }
    }
    fallbackFileInput.value = '';
    if (loadedAny) {
        writeMode = false;
        setConnected(true, false);
        renderAll();
    }
});

function setConnected(on, canWrite) {
    adminMain.hidden = !on;
    adminEmpty.hidden = on;
    connectionStatus.textContent = on
        ? (canWrite ? 'Dossier connecté' : 'Fichiers chargés (mode téléchargement)')
        : 'Dossier non connecté';
    connectionStatus.classList.toggle('connection-status--on', on);
    connectionStatus.classList.toggle('connection-status--off', !on);
}

// ------------------------------------------------------------------
// Écriture disque
// ------------------------------------------------------------------
async function writeFileToPath(relativePath, fileOrBlob) {
    const parts = relativePath.split('/').filter(Boolean);
    const fileName = parts.pop();
    let dir = dirHandle;
    for (const part of parts) {
        dir = await dir.getDirectoryHandle(part, { create: true });
    }
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(fileOrBlob);
    await writable.close();
}

function validateCategory(key) {
    const config = CATEGORY_CONFIG[key];
    const items = state[key].items;

    if (config.kind === 'pack') {
        for (const item of items) {
            if (!item.name || !item.name.trim()) return 'Un pack a un nom vide.';
            for (const size of [2, 5, 10, 30]) {
                const v = item.prices ? item.prices[size] : null;
                if (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) {
                    return `Le pack « ${item.name} » doit avoir un prix pour le format ${size} ml.`;
                }
            }
        }
        return null;
    }

    for (const item of items) {
        if (!item.brand || !item.brand.trim()) return `Un parfum n'a pas de marque (id : ${item.id}).`;
        if (!item.name || !item.name.trim()) return `Un parfum n'a pas de nom (id : ${item.id}).`;
    }

    const idCounts = new Map();
    ['designers', 'niche', 'exclusive'].forEach((k) => {
        state[k].items.forEach((it) => {
            idCounts.set(it.id, (idCounts.get(it.id) || 0) + 1);
        });
    });
    const dup = [...idCounts.entries()].find(([, count]) => count > 1);
    if (dup) return `Identifiant en double détecté : « ${dup[0]} ». Renommez l'un des deux parfums concernés.`;

    return null;
}

async function saveCategory(key) {
    const config = CATEGORY_CONFIG[key];
    const error = validateCategory(key);
    if (error) {
        showToast(error, true);
        return;
    }

    const text = serializeCategory(key);

    if (writeMode && dirHandle) {
        try {
            const fileHandle = await dirHandle.getFileHandle(config.file, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(text);
            await writable.close();
            state[key].dirty = false;
            renderPanel(key);
            showToast(`${config.file} enregistré. Pensez à committer/pousser vos changements pour mettre le site en ligne à jour.`);
        } catch (e) {
            showToast(`Erreur lors de l'enregistrement de ${config.file} : ${e.message}`, true);
        }
    } else {
        downloadText(config.file, text);
        state[key].dirty = false;
        renderPanel(key);
        showToast(`${config.file} téléchargé — remplacez l'ancien fichier du dossier du site par celui-ci.`);
    }
}

// ------------------------------------------------------------------
// Sérialisation (état en mémoire -> texte JS des fichiers data-*.js)
// ------------------------------------------------------------------
function serializePerfumeItem(item) {
    const lines = [];
    lines.push('    {');
    lines.push(`        id: ${jsString(item.id)},`);
    lines.push(`        brand: ${jsString(item.brand)},`);
    lines.push(`        name: ${jsString(item.name)},`);
    lines.push(`        image: ${jsString(item.image || '')},`);
    if (item.fragranticaImage) {
        lines.push(`        fragranticaImage: ${jsString(item.fragranticaImage)},`);
    }
    lines.push(`        pricePerMl: ${formatNum(item.pricePerMl)},`);
    lines.push(`        price5ml: ${formatNum(item.price5ml)},`);
    lines.push(`        price10ml: ${formatNum(item.price10ml)},`);
    lines.push(`        price30ml: ${formatNum(item.price30ml)},`);
    lines.push(`        available: ${item.available === false ? 'false' : 'true'}`);
    lines.push('    }');
    return lines.join('\n');
}

function serializePerfumeFile(config, items, brandOrder) {
    if (items.length === 0) {
        return `// ${config.headerComment}\nwindow.${config.varName} = [];\n`;
    }

    const byBrand = new Map();
    items.forEach((it) => {
        const key = it.brand || '(Sans marque)';
        if (!byBrand.has(key)) byBrand.set(key, []);
        byBrand.get(key).push(it);
    });

    const orderedBrands = brandOrder.filter((b) => byBrand.has(b));
    [...byBrand.keys()].sort((a, b) => a.localeCompare(b, 'fr')).forEach((b) => {
        if (!orderedBrands.includes(b)) orderedBrands.push(b);
    });

    const lines = [];
    orderedBrands.forEach((brand, gi) => {
        if (gi > 0) lines.push('');
        lines.push(`    // ${brand.toUpperCase()}`);
        const groupItems = byBrand.get(brand);
        groupItems.forEach((item, ii) => {
            const isLast = gi === orderedBrands.length - 1 && ii === groupItems.length - 1;
            lines.push(serializePerfumeItem(item) + (isLast ? '' : ','));
        });
    });

    return `// ${config.headerComment}\nwindow.${config.varName} = [\n${lines.join('\n')}\n];\n`;
}

function serializePackItem(item) {
    const lines = [];
    lines.push('    {');
    lines.push(`        id: ${jsString(item.id)},`);
    lines.push(`        name: ${jsString(item.name)},`);
    if (item.subtitle) {
        lines.push(`        subtitle: ${jsString(item.subtitle)},`);
    }
    lines.push(`        image: ${jsString(item.image || '')},`);
    lines.push('        prices: {');
    [2, 5, 10, 30].forEach((size, i) => {
        const value = item.prices ? item.prices[size] : null;
        lines.push(`            ${size}: ${formatNum(value)}${i < 3 ? ',' : ''}`);
    });
    lines.push('        },');
    lines.push(`        available: ${item.available === false ? 'false' : 'true'}`);
    lines.push('    }');
    return lines.join('\n');
}

function serializePacksFile(config, items) {
    if (items.length === 0) {
        return `// ${config.headerComment}\nwindow.${config.varName} = [];\n`;
    }
    const body = items.map((item, i) => serializePackItem(item) + (i < items.length - 1 ? ',' : '')).join('\n');
    return `// ${config.headerComment}\nwindow.${config.varName} = [\n${body}\n];\n`;
}

function serializeCategory(key) {
    const config = CATEGORY_CONFIG[key];
    if (config.kind === 'pack') {
        return serializePacksFile(config, state[key].items);
    }
    return serializePerfumeFile(config, state[key].items, state[key].brandOrder);
}

// ------------------------------------------------------------------
// Rendu
// ------------------------------------------------------------------
function markDirty(category) {
    state[category].dirty = true;
    const panel = document.getElementById(`panel-${category}`);
    if (!panel) return;
    const saveBtn = panel.querySelector('.panel-save');
    if (saveBtn) saveBtn.disabled = false;
    const tab = document.querySelector(`.admin-tab[data-category="${category}"]`);
    if (tab) tab.classList.add('dirty');
    const previewCode = panel.querySelector('.panel-preview-code');
    if (previewCode) previewCode.textContent = serializeCategory(category);
}

function ensurePanelBuilt(category) {
    const panel = document.getElementById(`panel-${category}`);
    if (panel.dataset.built) return panel;

    const config = CATEGORY_CONFIG[category];
    const tpl = document.getElementById(config.kind === 'pack' ? 'panelTemplatePacks' : 'panelTemplate');
    panel.appendChild(tpl.content.cloneNode(true));
    panel.dataset.built = '1';

    const searchInput = panel.querySelector('.panel-search');
    const addBtn = panel.querySelector('.panel-add');
    const saveBtn = panel.querySelector('.panel-save');

    searchInput.addEventListener('input', () => renderPanel(category));
    addBtn.addEventListener('click', () => openModal(category, null));
    saveBtn.addEventListener('click', () => saveCategory(category));

    return panel;
}

function buildRow(category, item) {
    const config = CATEGORY_CONFIG[category];
    const isPack = config.kind === 'pack';
    const tpl = document.getElementById(isPack ? 'packRowTemplate' : 'rowTemplate');
    const row = tpl.content.cloneNode(true).querySelector('.admin-row');
    const isAvailable = item.available !== false;
    row.classList.toggle('row--unavailable', !isAvailable);

    const thumb = row.querySelector('.row-thumb');
    thumb.src = item.image || '';
    thumb.alt = item.name || '';
    thumb.onerror = () => { thumb.style.visibility = 'hidden'; };

    if (isPack) {
        row.querySelector('.pack-row-name').textContent = item.name || '';
        row.querySelector('.pack-row-subtitle').textContent = item.subtitle || '';
        [2, 5, 10, 30].forEach((size) => {
            const input = row.querySelector(`.inline-price[data-field="${size}"]`);
            input.value = item.prices && item.prices[size] != null ? item.prices[size] : '';
            input.addEventListener('change', () => {
                item.prices = item.prices || {};
                item.prices[size] = input.value === '' ? null : Number(input.value);
                markDirty(category);
            });
        });
    } else {
        row.querySelector('.cell-brand').textContent = item.brand || '';
        row.querySelector('.cell-name').textContent = item.name || '';
        row.querySelector('.cell-price-ml').textContent =
            item.pricePerMl != null && item.pricePerMl !== '' ? `${Number(item.pricePerMl).toFixed(2)} €` : '—';
        ['price5ml', 'price10ml', 'price30ml'].forEach((field) => {
            const input = row.querySelector(`.inline-price[data-field="${field}"]`);
            input.value = item[field] != null ? item[field] : '';
            input.addEventListener('change', () => {
                item[field] = input.value === '' ? null : Number(input.value);
                markDirty(category);
            });
        });
    }

    const availToggle = row.querySelector('.row-available');
    availToggle.checked = isAvailable;
    availToggle.addEventListener('change', () => {
        item.available = availToggle.checked;
        row.classList.toggle('row--unavailable', !availToggle.checked);
        markDirty(category);
    });

    row.querySelector('.row-edit').addEventListener('click', () => openModal(category, item));
    row.querySelector('.row-delete').addEventListener('click', () => {
        const label = isPack ? item.name : `${item.brand} ${item.name}`;
        if (!confirm(`Supprimer définitivement « ${label} » ?`)) return;
        state[category].items = state[category].items.filter((i) => i !== item);
        markDirty(category);
        renderPanel(category);
    });

    return row;
}

function renderPanel(category) {
    const panel = ensurePanelBuilt(category);
    const config = CATEGORY_CONFIG[category];
    const tbody = panel.querySelector('.panel-tbody');
    const countEl = panel.querySelector('.panel-count');
    const saveBtn = panel.querySelector('.panel-save');
    const searchInput = panel.querySelector('.panel-search');
    const previewCode = panel.querySelector('.panel-preview-code');

    const term = (searchInput.value || '').trim().toLowerCase();
    const items = state[category].items.filter((item) => {
        if (!term) return true;
        const haystack = config.kind === 'pack'
            ? `${item.name} ${item.subtitle || ''}`
            : `${item.brand} ${item.name}`;
        return haystack.toLowerCase().includes(term);
    });

    tbody.innerHTML = '';
    items.forEach((item) => tbody.appendChild(buildRow(category, item)));

    const total = state[category].items.length;
    countEl.textContent = `${total} ${total > 1 ? 'articles' : 'article'}`;
    saveBtn.disabled = !state[category].dirty;

    const tab = document.querySelector(`.admin-tab[data-category="${category}"]`);
    if (tab) tab.classList.toggle('dirty', state[category].dirty);

    previewCode.textContent = serializeCategory(category);
}

function renderAll() {
    Object.keys(CATEGORY_CONFIG).forEach(renderPanel);
}

adminTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.admin-tab');
    if (!btn) return;
    const category = btn.dataset.category;
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.toggle('active', t === btn));
    Object.keys(CATEGORY_CONFIG).forEach((key) => {
        document.getElementById(`panel-${key}`).hidden = key !== category;
    });
});

// ------------------------------------------------------------------
// Modal ajout / édition
// ------------------------------------------------------------------
function updateImagePreview(path) {
    if (!path) {
        imagePreview.hidden = true;
        imagePreview.src = '';
        return;
    }
    imagePreview.src = path;
    imagePreview.hidden = false;
    imagePreview.onerror = () => { imagePreview.hidden = true; };
}

function openModal(category, item) {
    editingContext = { category, id: item ? item.id : null };
    const config = CATEGORY_CONFIG[category];
    const isPack = config.kind === 'pack';

    itemModalTitle.textContent = item
        ? `Modifier — ${isPack ? item.name : `${item.brand} ${item.name}`}`
        : (isPack ? 'Ajouter un pack' : 'Ajouter un parfum');
    nameOrPackLabel.textContent = isPack ? '(nom du pack)' : '';

    rowBrand.hidden = isPack;
    rowSubtitle.hidden = !isPack;
    rowFragrantica.hidden = isPack;
    rowPricePerMl.hidden = isPack;
    rowPricesPerfume.hidden = isPack;
    rowPricesPack.hidden = !isPack;

    fieldId.value = item ? item.id : '';
    fieldBrand.value = item ? (item.brand || '') : '';
    fieldName.value = item ? (item.name || '') : '';
    fieldSubtitle.value = item ? (item.subtitle || '') : '';
    fieldImage.value = item ? (item.image || '') : '';
    fieldFragrantica.value = item && !isPack ? (item.fragranticaImage || '') : '';
    fieldPricePerMl.value = item && item.pricePerMl != null ? item.pricePerMl : '';
    fieldPrice5.value = item && item.price5ml != null ? item.price5ml : '';
    fieldPrice10.value = item && item.price10ml != null ? item.price10ml : '';
    fieldPrice30.value = item && item.price30ml != null ? item.price30ml : '';

    const prices = item && item.prices ? item.prices : {};
    fieldPackPrice2.value = prices[2] != null ? prices[2] : '';
    fieldPackPrice5.value = prices[5] != null ? prices[5] : '';
    fieldPackPrice10.value = prices[10] != null ? prices[10] : '';
    fieldPackPrice30.value = prices[30] != null ? prices[30] : '';

    fieldAvailable.checked = item ? item.available !== false : true;

    updateImagePreview(fieldImage.value);

    const canUploadImages = writeMode && !!dirHandle;
    fieldImageFile.disabled = !canUploadImages;
    fieldFragranticaFile.disabled = !canUploadImages;

    itemModal.style.display = 'block';
    (isPack ? fieldName : fieldBrand).focus();
}

function closeModal() {
    itemModal.style.display = 'none';
    editingContext = null;
}

itemModalClose.addEventListener('click', closeModal);
itemModalCancel.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === itemModal) closeModal();
});

async function handleImageUpload(fileInput, pathInput, isMain) {
    const file = fileInput.files[0];
    if (!file) return;
    if (!dirHandle || !writeMode || !editingContext) {
        showToast('Connectez le dossier du site (Chrome ou Edge) pour importer une image directement.', true);
        fileInput.value = '';
        return;
    }
    const config = CATEGORY_CONFIG[editingContext.category];
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const baseName = slugify(fieldName.value) || slugify(fieldBrand.value) || 'image';
    const folder = isMain ? config.imageFolder : 'images/images fragrantica';
    const targetPath = pathInput.value.trim() || `${folder}/${baseName}.${ext}`;

    try {
        await writeFileToPath(targetPath, file);
        pathInput.value = targetPath;
        if (isMain) updateImagePreview(targetPath);
        showToast(`Image enregistrée : ${targetPath}`);
    } catch (e) {
        showToast(`Erreur lors de l'enregistrement de l'image : ${e.message}`, true);
    } finally {
        fileInput.value = '';
    }
}

fieldImageFile.addEventListener('change', () => handleImageUpload(fieldImageFile, fieldImage, true));
fieldFragranticaFile.addEventListener('change', () => handleImageUpload(fieldFragranticaFile, fieldFragrantica, false));

itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!editingContext) return;

    const { category } = editingContext;
    const config = CATEGORY_CONFIG[category];
    const isPack = config.kind === 'pack';

    const name = fieldName.value.trim();
    if (!name) {
        showToast('Le nom est obligatoire.', true);
        return;
    }
    if (!isPack && !fieldBrand.value.trim()) {
        showToast('La marque est obligatoire.', true);
        return;
    }

    const isNew = !editingContext.id;
    let item;

    if (isNew) {
        const existingIds = new Set();
        if (isPack) {
            state.packs.items.forEach((it) => existingIds.add(it.id));
            item = { id: generateId('packs', name, existingIds) };
        } else {
            ['designers', 'niche', 'exclusive'].forEach((k) => {
                state[k].items.forEach((it) => existingIds.add(it.id));
            });
            item = { id: generateId(category, fieldBrand.value.trim(), existingIds) };
        }
        state[category].items.push(item);
    } else {
        item = state[category].items.find((i) => i.id === editingContext.id);
        if (!item) {
            closeModal();
            return;
        }
    }

    if (isPack) {
        item.name = name;
        item.subtitle = fieldSubtitle.value.trim();
        item.image = fieldImage.value.trim();
        item.prices = {
            2: fieldPackPrice2.value === '' ? null : Number(fieldPackPrice2.value),
            5: fieldPackPrice5.value === '' ? null : Number(fieldPackPrice5.value),
            10: fieldPackPrice10.value === '' ? null : Number(fieldPackPrice10.value),
            30: fieldPackPrice30.value === '' ? null : Number(fieldPackPrice30.value)
        };
    } else {
        item.brand = fieldBrand.value.trim();
        item.name = name;
        item.image = fieldImage.value.trim();
        if (fieldFragrantica.value.trim()) {
            item.fragranticaImage = fieldFragrantica.value.trim();
        } else {
            delete item.fragranticaImage;
        }
        item.pricePerMl = fieldPricePerMl.value === '' ? null : Number(fieldPricePerMl.value);
        item.price5ml = fieldPrice5.value === '' ? null : Number(fieldPrice5.value);
        item.price10ml = fieldPrice10.value === '' ? null : Number(fieldPrice10.value);
        item.price30ml = fieldPrice30.value === '' ? null : Number(fieldPrice30.value);

        if (isNew && item.brand && !state[category].brandOrder.includes(item.brand)) {
            state[category].brandOrder.push(item.brand);
        }
    }

    item.available = fieldAvailable.checked;

    markDirty(category);
    renderPanel(category);
    closeModal();
    showToast(isNew ? 'Parfum ajouté au tableau.' : 'Modifications appliquées au tableau.');
});

// ------------------------------------------------------------------
// Initialisation
// ------------------------------------------------------------------
connectBtn.addEventListener('click', connectFolder);
fallbackLoadBtn.addEventListener('click', () => fallbackFileInput.click());

if (!fsAccessSupported) {
    compatBanner.hidden = false;
    connectBtn.hidden = true;
}

window.addEventListener('beforeunload', (e) => {
    const anyDirty = Object.values(state).some((s) => s.dirty);
    if (anyDirty) {
        e.preventDefault();
        e.returnValue = '';
    }
});
