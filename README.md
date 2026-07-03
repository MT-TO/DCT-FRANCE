# DCT France - Site de Décants de Parfums

Site web pour DCT France proposant des décantes de parfums en formats 5ml, 10ml et 30ml.

## Structure du site

- **index.html** : Page d'accueil avec présentation des catégories
- **presentation.html** : Page de présentation avec l'histoire et l'engagement qualité
- **designers.html** : Page des parfums de designers
- **niche.html** : Page des parfums de niche
- **exclusive.html** : Page des parfums exclusifs
- **style.css** : Styles CSS du site
- **script.js** : Gestion du panier et de la navigation
- **perfumes.js** : Affichage et filtrage des parfums
- **data-designers.js** : Données des parfums de designers
- **data-niche.js** : Données des parfums de niche
- **data-exclusive.js** : Données des parfums exclusifs
- **images/** : Dossier contenant les images

## Fonctionnalités

- ✅ Affichage des parfums par catégorie (Designers / Niche / Exclusive)
- ✅ Panier permettant de visualiser les prix (pas de commande en ligne)
- ✅ Redirection vers Snapchat (dctfrance) ou Discord pour commander
- ✅ Filtrage par marque et recherche de parfums
- ✅ Design élégant avec polices Google Fonts (Playfair Display & Inter)
- ✅ Responsive design (mobile-friendly)
- ✅ Panier sauvegardé dans le localStorage
- ✅ Images pour chaque parfum et pour les pages principales

## Images

### Images principales

Placez les images suivantes dans le dossier `images/` :
- **hero-collection.jpg** : Image pour la page d'accueil (hero section)
- **presentation-collection.jpg** : Image pour la page de présentation

### Images des parfums

Placez les images de chaque parfum dans les dossiers correspondants :

- **images/designers/** : Images des parfums de designers
- **images/niche/** : Images des parfums de niche

**Nommage des images** : Les images doivent être nommées selon le nom du parfum (sans accents, apostrophes, espaces remplacés par des tirets).

Exemples :
- "Bois D'argent EDP" → `bois-dargent-edp.jpg`
- "Angels' Share" → `angels-share.jpg`

Le système convertit automatiquement les noms des parfums en noms de fichiers.

## Pour ajouter des parfums

### Parfums de niche

Éditez le fichier `data-niche.js` et ajoutez les parfums au format suivant :

```javascript
{
    id: 'unique-id',
    brand: 'Nom de la marque',
    name: 'Nom du parfum',
    pricePerMl: prix_au_ml,
    price5ml: prix_5ml,
    price10ml: prix_10ml,
    price30ml: prix_30ml  // ou null si non disponible
}
```

### Parfums de designers

Même format pour `data-designers.js`

## Base de données (database/dct_france.sql)

Les fichiers `data-designers.js`, `data-niche.js` et `data-exclusive.js` sont
la **seule source de vérité** pour le catalogue et les prix (ce sont eux qui
alimentent le site). Le fichier `database/dct_france.sql` (schéma MySQL prêt
pour une intégration Stripe) est **généré automatiquement** à partir de ces
fichiers — ne l'éditez jamais à la main.

Après toute modification de prix ou de catalogue dans les fichiers `data-*.js`,
régénérez le SQL avec :

```bash
python3 scripts/generate_sql.py
```

## Contact

- **Snapchat** : dctfrance
- **Discord** : https://discord.gg/BvJNDeu4dR
- **Email** : Matteo.frgc@outlook.fr
