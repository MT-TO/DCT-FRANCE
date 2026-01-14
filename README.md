# DCT France - Site de Décants de Parfums

Site web pour DCT France proposant des décants de parfums en formats 5ml, 10ml et 30ml.

## Structure du site

- **index.html** : Page d'accueil avec présentation des catégories
- **presentation.html** : Page de présentation avec l'histoire et l'engagement qualité
- **designers.html** : Page des parfums de designers
- **niche.html** : Page des parfums de niche
- **style.css** : Styles CSS du site
- **script.js** : Gestion du panier et de la navigation
- **perfumes.js** : Affichage et filtrage des parfums
- **data-designers.js** : Données des parfums de designers
- **data-niche.js** : Données des parfums de niche
- **images/** : Dossier contenant les images 

## Fonctionnalités

- ✅ Affichage des parfums par catégorie (Designers / Niche)
- ✅ Panier permettant de visualiser les prix (pas de commande en ligne)
- ✅ Redirection vers Snapchat (dctfrance) ou Discord pour commander
- ✅ Filtrage par marque et recherche de parfums
- ✅ Design élégant avec polices Google Fonts (Playfair Display & Inter)
- ✅ Responsive design (mobile-friendly)
- ✅ Panier sauvegardé dans le localStorage
- ✅ Images pour chaque parfum et pour les pages principales

## Images

### Images principales


### Images des parfums

Placez les images de chaque parfum dans les dossiers correspondants :

- **images/designers/** : Images des parfums de designers
- **images/niche/** : Images des parfums de niche

**Nommage des images** : Les images doivent être nommées selon le nom du parfum (sans accents, apostrophes, espaces remplacés par des tirets).

Exemples :
- "Bois D'argent EDP" → `bois-dargent-edp.jpg`
- "Angels' Share" → `angels-share.jpg`
- "Baccarat Rouge 540 extrait" → `baccarat-rouge-540-extrait.jpg`

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

## Contact

- **Snapchat** : dctfrance
- **Discord** : https://discord.gg/Bgh3JmP7
- **Email** : Matteo.frgc@outlook.fr
