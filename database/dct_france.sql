-- ============================================================
-- DCT FRANCE — Base de données produits + intégration Stripe
-- ============================================================
-- FICHIER GÉNÉRÉ AUTOMATIQUEMENT — NE PAS ÉDITER À LA MAIN.
-- Source de vérité : data-designers.js / data-niche.js / data-exclusive.js
-- Régénérer avec : python3 scripts/generate_sql.py
--
-- Les prix sont stockés en CENTIMES (comme Stripe l'exige).
-- stripe_product_id et stripe_price_id sont à renseigner
-- après création des produits/prix dans le dashboard Stripe.
-- ============================================================

CREATE DATABASE IF NOT EXISTS dct_france CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dct_france;

-- ------------------------------------------------------------
-- TABLE : products
-- Un enregistrement = un parfum
-- stripe_product_id = ID produit Stripe (ex: prod_XXXXXX)
-- ------------------------------------------------------------
CREATE TABLE products (
    id              VARCHAR(60)     PRIMARY KEY,
    brand           VARCHAR(100)    NOT NULL,
    name            VARCHAR(150)    NOT NULL,
    category        ENUM('designer','niche','exclusive') NOT NULL,
    image           VARCHAR(255),
    price_per_ml    DECIMAL(6,2)    NOT NULL,
    stripe_product_id VARCHAR(50)   DEFAULT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- TABLE : product_prices
-- Un enregistrement = une déclinaison de taille (5ml, 10ml, 30ml)
-- price_cents     = prix en centimes (EUR) → pour Stripe
-- stripe_price_id = ID prix Stripe (ex: price_XXXXXX)
-- ------------------------------------------------------------
CREATE TABLE product_prices (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    product_id      VARCHAR(60)     NOT NULL,
    size_ml         TINYINT         NOT NULL,        -- 5, 10 ou 30
    price_cents     INT             NOT NULL,        -- ex: 1000 = 10,00 €
    stripe_price_id VARCHAR(50)     DEFAULT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_product_size (product_id, size_ml)
) ENGINE=InnoDB;

-- ============================================================
-- INSERTION — DESIGNER
-- ============================================================
INSERT INTO products (id, brand, name, category, image, price_per_ml) VALUES
('dior-1', 'DIOR', 'Gris Dior EDP', 'designer', 'images/designers/gris-dior.jpg', 2.00),
('dior-2', 'DIOR', 'Bois D''argent EDP', 'designer', 'images/designers/bois-dargent-dior.webp', 2.00),
('dior-10', 'DIOR', 'Gris Dior Esprit', 'designer', 'images/designers/gris-dior-esprit-de-parfum.jpg', 4.00),
('dior-6', 'DIOR', 'Cuir Saddle EDP', 'designer', 'images/designers/dior-cuir-saddle.webp', 2.00),
('dior-7', 'DIOR', 'Sauvage EDT', 'designer', 'images/designers/dior-sauvage-edt.jpg', 1.00),
('dior-8', 'DIOR', 'Sauvage Elixir', 'designer', 'images/designers/sauvage-elixir.jpg', 3.00),
('dior-9', 'DIOR', 'Sauvage Extrait', 'designer', 'images/designers/sauvage dior extrait.png', 3.50),
('dior-11', 'DIOR', 'Bois D''argent Esprit', 'designer', 'images/designers/bois-dargent-esprit-de-parfum.png', 4.00),
('lv-2', 'Louis Vuitton', 'Ombre Nomade', 'designer', 'images/designers/ombre-nomade-lv.jpg', 3.00),
('lv-4', 'Louis Vuitton', 'Spell on You', 'designer', 'images/designers/louis-vuitton-spell-on-you-lp0214-pm2-front-view.webp', 2.50),
('lv-5', 'Louis Vuitton', 'City of Stars', 'designer', 'images/designers/louis-vuitton-city-of-stars-lp0282-pm2-front-view.webp', 2.50),
('lv-7', 'Louis Vuitton', 'Heure d''Absences', 'designer', 'images/designers/heure-dabsences-lv.jpg', 2.50),
('lv-8', 'Louis Vuitton', 'Imagination', 'designer', 'images/designers/louis-vuitton-imagination-lp0219.jpg', 2.50),
('lv-9', 'Louis Vuitton', 'LV Lovers', 'designer', 'images/designers/lv lovers.webp', 2.50),
('jpg-1', 'Jean Paul Gaultier', 'Le Mâle EDT', 'designer', 'images/designers/le-male-jpg-edt.webp', 1.00),
('jpg-2', 'Jean Paul Gaultier', 'Le Mâle Elixir', 'designer', 'images/designers/le-male-elixir.webp', 2.00),
('jpg-3', 'Jean Paul Gaultier', 'Scandal Intense', 'designer', 'images/designers/scandal-intense.jpg', 1.50),
('prada-1', 'Prada', 'Prada Paradigme', 'designer', 'images/designers/prada-paradigme.avif', 2.00),
('versace-1', 'Versace', 'Eros EDT', 'designer', 'images/designers/versace-eros-edt.avif', 1.00),
('paco-1', 'Paco Rabanne', 'Invictus EDT', 'designer', 'images/designers/invictus-edt.jpg', 1.00),
('azzaro-1', 'Azzaro', 'Chrome EDT', 'designer', 'images/designers/azzaro-chrome-edt.jpg', 0.70),
('azzaro-2', 'Azzaro', 'Chrome EDP', 'designer', 'images/designers/azzaro-chrome-edp.webp', 1.00),
('horace-1', 'Horace', 'Vintage Vanilla', 'designer', 'images/designers/horace-vintage-vanilla.png', 2.00),
('cartier-1', 'Cartier', 'Oud Vanille', 'designer', 'images/designers/oud-cartier-vanille-carprodcard.avif', 3.00),
('van-cleef-1', 'Van Cleef & Arpels', 'Bois d''Iris', 'designer', 'images/designers/bois-diris-van-clief.avif', 2.00),
('tomford-1', 'Tom Ford', 'Neroli Portofino', 'designer', 'images/designers/neroli portofino tom ford.avif', 4.10),
('hermes-1', 'Hermès', 'Ambre Narguilé', 'designer', 'images/designers/ambre-narguile-hermes.webp', 2.70),
('margiela-1', 'Maison Margiela', 'By the Fireplace', 'designer', 'images/designers/by the fireplace maison margiela.avif', 1.00),
('givenchy-1', 'Givenchy', 'L''Interdit Rouge EDP', 'designer', 'images/designers/l''interdit rouge.avif', 1.20),
('armani-1', 'Giorgio Armani', 'Stronger With You Intensely', 'designer', 'images/designers/stronger-with-you-intensely.jpg', 1.00);

-- ============================================================
-- INSERTION — NICHE
-- ============================================================
INSERT INTO products (id, brand, name, category, image, price_per_ml) VALUES
('killian-1', 'Kilian', 'Angels'' Share', 'niche', 'images/niches/angels-share.webp', 4.00),
('xerjoff-2', 'Xerjoff', 'Naxos', 'niche', 'images/flacons-entier/xerjoff-naxos.jpg', 2.00),
('xerjoff-3', 'Xerjoff', 'Torino 21', 'niche', 'images/niches/torino 21.jpg', 2.15),
('fascent-1', 'Fascent', 'Creme Brulante', 'niche', 'images/niches/fascent-creme-brulante.webp', 2.50),
('fascent-2', 'Fascent', 'Milky No Way', 'niche', 'images/niches/milky-no-way.jpg', 2.50),
('fascent-3', 'Fascent', 'Corn Star', 'niche', 'images/niches/corn-star.jpg', 2.50),
('fascent-4', 'Fascent', 'I Fig You', 'niche', 'images/niches/i-fig-you.jpg', 2.50),
('harold-1', 'Harold & Maude', 'Resolument Affranchi', 'niche', 'images/niches/resolument-affranchi.webp', 3.00),
('manufacture-1', 'La Manufacture', 'Rare', 'niche', 'images/niches/rare-la-manufacture.webp', 2.00),
('les-eaux-primordiales-1', 'Les Eaux Primordiales', 'Ambre Supermassive', 'niche', 'images/niches/ambre-supermassive.webp', 2.00),
('reinvented-1', 'Reinvented', 'Sacred Bond', 'niche', 'images/niches/sacred-bond.webp', 2.00),
('cuir-caramelo-1', 'Yzkine', 'Cuir Caramelo', 'niche', 'images/niches/cuir-caramelo.webp', 2.20),
('mind-games-1', 'Nobl''art', 'Mona Lisa', 'niche', 'images/niches/mona-lisa.webp', 1.30),
('liquides-imaginaires-1', 'Liquides Imaginaires', 'Blanche Bête', 'niche', 'images/niches/blanche-bete.webp', 3.00),
('frederic-malle-1', 'Frederic Malle', 'Musc Ravageur', 'niche', 'images/niches/musc-ravageur.avif', 3.00),
('parfums-de-marly-1', 'Parfums de Marly', 'Althaïr', 'niche', 'images/niches/althair-parfums-de-marly.webp', 1.90),
('mfk-1', 'Maison Francis Kurkdjian', 'Grand Soir', 'niche', 'images/niches/grand-soir-mfk.webp', 2.00),
('mfk-2', 'Maison Francis Kurkdjian', 'Oud Satin Mood EDP', 'niche', 'images/niches/oud-satin-mood-mfk.webp', 3.00),
('montale-1', 'Montale', 'Arabians Tonka', 'niche', 'images/niches/arabians-tonka.webp', 1.00),
('acqua-di-parma-1', 'Acqua di Parma', 'Bergamotto di Calabria', 'niche', 'images/niches/bergamotto-di-calabria.jpg', 1.90),
('place-de-la-reverie-1', 'Place de la Rêverie', 'Passion Riviera', 'niche', 'images/niches/passion-riviera-place-de-la-reverie.webp', 4.00),
('place-de-la-reverie-2', 'Place de la Rêverie', 'Santal de Paris', 'niche', 'images/niches/santal-de-paris-place-de-la-reverie.webp', 4.00),
('place-de-la-reverie-3', 'Place de la Rêverie', 'Fève Nectar', 'niche', 'images/niches/feve nectar place de la reverie.webp', 4.00),
('maison-magistral-1', 'Maison Magistral', 'Sweet Venin', 'niche', 'images/niches/sweet venin maison magistral.png', 1.70),
('mancera-1', 'Mancera', 'Roses Vanille', 'niche', 'images/niches/roses-vanille-mancera.jpg', 0.90),
('nishane-1', 'Nishane', 'Ani', 'niche', 'images/niches/ani nishane extrait.jpg', 1.50),
('fragranza-1', 'Maison Fragranza', 'Rosa Vento', 'niche', 'images/niches/rosa vento.webp', 0.70),
('essential-parfums-1', 'Essential Parfums', 'Divine Vanille', 'niche', 'images/niches/divine vanille.jpg', 1.00),
('essential-parfums-2', 'Essential Parfums', 'The Musc', 'niche', 'images/niches/the musc.jpg', 1.00),
('essential-parfums-3', 'Essential Parfums', 'Bois Impérial', 'niche', 'images/niches/bois-imperial-essential-parfums.jpg', 1.00);

-- ============================================================
-- INSERTION — EXCLUSIVE
-- ============================================================
INSERT INTO products (id, brand, name, category, image, price_per_ml) VALUES
('exclusive-dior-1', 'DIOR', 'Vétiver Dior', 'exclusive', 'images/designers/vetiver-dior.jpg', 4.00),
('exclusive-dior-2', 'DIOR', 'Fève Délicieuse Dior', 'exclusive', 'images/designers/feve-delicieuse-dior.webp', 4.00),
('exclusive-dior-4', 'DIOR', 'Patchouli Impérial Dior', 'exclusive', 'images/designers/patchouli-imperial-dior.jpg', 4.00);

-- ============================================================
-- INSERTION — PRIX PAR TAILLE (en centimes)
-- ============================================================
INSERT INTO product_prices (product_id, size_ml, price_cents) VALUES
('dior-1', 5, 1000),
('dior-1', 10, 2000),
('dior-1', 30, 5000),
('dior-2', 5, 1000),
('dior-2', 10, 2000),
('dior-2', 30, 5000),
('dior-10', 5, 2000),
('dior-10', 10, 4000),
('dior-10', 30, 11000),
('dior-6', 5, 1000),
('dior-6', 10, 2000),
('dior-6', 30, 5000),
('dior-7', 5, 500),
('dior-7', 10, 1000),
('dior-7', 30, 2000),
('dior-8', 5, 1500),
('dior-8', 10, 3000),
('dior-8', 30, 7000),
('dior-9', 5, 1700),
('dior-9', 10, 3500),
('dior-9', 30, 9500),
('dior-11', 5, 2000),
('dior-11', 10, 4000),
('dior-11', 30, 11000),
('lv-2', 5, 1500),
('lv-2', 10, 3000),
('lv-2', 30, 8500),
('lv-4', 5, 1250),
('lv-4', 10, 2500),
('lv-4', 30, 7500),
('lv-5', 5, 1250),
('lv-5', 10, 2500),
('lv-5', 30, 7500),
('lv-7', 5, 1250),
('lv-7', 10, 2500),
('lv-7', 30, 7000),
('lv-8', 5, 1250),
('lv-8', 10, 2500),
('lv-8', 30, 7500),
('lv-9', 5, 1250),
('lv-9', 10, 2500),
('lv-9', 30, 7500),
('jpg-1', 5, 500),
('jpg-1', 10, 1000),
('jpg-1', 30, 2000),
('jpg-2', 5, 1000),
('jpg-2', 10, 2000),
('jpg-2', 30, 3000),
('jpg-3', 5, 750),
('jpg-3', 10, 1500),
('jpg-3', 30, 3000),
('prada-1', 5, 1000),
('prada-1', 10, 2000),
('prada-1', 30, 4000),
('versace-1', 5, 500),
('versace-1', 10, 1000),
('versace-1', 30, 2000),
('paco-1', 5, 500),
('paco-1', 10, 1000),
('paco-1', 30, 2000),
('azzaro-1', 5, 350),
('azzaro-1', 10, 700),
('azzaro-1', 30, 1500),
('azzaro-2', 5, 500),
('azzaro-2', 10, 1000),
('azzaro-2', 30, 2500),
('horace-1', 5, 1000),
('horace-1', 10, 2000),
('horace-1', 30, 5000),
('cartier-1', 5, 1500),
('cartier-1', 10, 3000),
('cartier-1', 30, 8000),
('van-cleef-1', 5, 1000),
('van-cleef-1', 10, 2000),
('van-cleef-1', 30, 6000),
('tomford-1', 5, 2050),
('tomford-1', 10, 4100),
('tomford-1', 30, 11500),
('hermes-1', 5, 1350),
('hermes-1', 10, 2700),
('hermes-1', 30, 7500),
('margiela-1', 5, 500),
('margiela-1', 10, 1000),
('margiela-1', 30, 2500),
('givenchy-1', 5, 600),
('givenchy-1', 10, 1200),
('givenchy-1', 30, 3500),
('armani-1', 5, 500),
('armani-1', 10, 1000),
('armani-1', 30, 2500),
('killian-1', 5, 2000),
('killian-1', 10, 4000),
('killian-1', 30, 11000),
('xerjoff-2', 5, 1000),
('xerjoff-2', 10, 2000),
('xerjoff-2', 30, 5000),
('xerjoff-3', 5, 1075),
('xerjoff-3', 10, 2150),
('xerjoff-3', 30, 5500),
('fascent-1', 5, 1250),
('fascent-1', 10, 2500),
('fascent-2', 5, 1250),
('fascent-2', 10, 2500),
('fascent-3', 5, 1250),
('fascent-3', 10, 2500),
('fascent-4', 5, 1250),
('fascent-4', 10, 2500),
('harold-1', 5, 1500),
('harold-1', 10, 3000),
('harold-1', 30, 8000),
('manufacture-1', 5, 1000),
('manufacture-1', 10, 2000),
('manufacture-1', 30, 5000),
('les-eaux-primordiales-1', 5, 1000),
('les-eaux-primordiales-1', 10, 2000),
('les-eaux-primordiales-1', 30, 5500),
('reinvented-1', 5, 1000),
('reinvented-1', 10, 2000),
('reinvented-1', 30, 5000),
('cuir-caramelo-1', 5, 1100),
('cuir-caramelo-1', 10, 2200),
('cuir-caramelo-1', 30, 6000),
('mind-games-1', 5, 650),
('mind-games-1', 10, 1300),
('mind-games-1', 30, 3000),
('liquides-imaginaires-1', 5, 1500),
('liquides-imaginaires-1', 10, 3000),
('liquides-imaginaires-1', 30, 8000),
('frederic-malle-1', 5, 1500),
('frederic-malle-1', 10, 3000),
('frederic-malle-1', 30, 8500),
('parfums-de-marly-1', 5, 950),
('parfums-de-marly-1', 10, 1900),
('parfums-de-marly-1', 30, 5500),
('mfk-1', 5, 1000),
('mfk-1', 10, 2000),
('mfk-1', 30, 5000),
('mfk-2', 5, 1500),
('mfk-2', 10, 3000),
('mfk-2', 30, 7500),
('montale-1', 5, 500),
('montale-1', 10, 1000),
('montale-1', 30, 2500),
('acqua-di-parma-1', 5, 950),
('acqua-di-parma-1', 10, 1900),
('acqua-di-parma-1', 30, 4500),
('place-de-la-reverie-1', 5, 2000),
('place-de-la-reverie-1', 10, 4000),
('place-de-la-reverie-1', 30, 11000),
('place-de-la-reverie-2', 5, 2000),
('place-de-la-reverie-2', 10, 4000),
('place-de-la-reverie-2', 30, 11000),
('place-de-la-reverie-3', 5, 2000),
('place-de-la-reverie-3', 10, 4000),
('place-de-la-reverie-3', 30, 11000),
('maison-magistral-1', 5, 850),
('maison-magistral-1', 10, 1700),
('maison-magistral-1', 30, 4700),
('mancera-1', 5, 450),
('mancera-1', 10, 900),
('mancera-1', 30, 2500),
('nishane-1', 5, 750),
('nishane-1', 10, 1500),
('nishane-1', 30, 4000),
('fragranza-1', 5, 350),
('fragranza-1', 10, 700),
('fragranza-1', 30, 2000),
('essential-parfums-1', 5, 500),
('essential-parfums-1', 10, 1000),
('essential-parfums-1', 30, 3000),
('essential-parfums-2', 5, 500),
('essential-parfums-2', 10, 1000),
('essential-parfums-2', 30, 3000),
('essential-parfums-3', 5, 500),
('essential-parfums-3', 10, 1000),
('essential-parfums-3', 30, 3000),
('exclusive-dior-1', 5, 2000),
('exclusive-dior-1', 10, 3200),
('exclusive-dior-1', 30, 10500),
('exclusive-dior-2', 5, 2000),
('exclusive-dior-2', 10, 3200),
('exclusive-dior-2', 30, 10500),
('exclusive-dior-4', 5, 2000),
('exclusive-dior-4', 10, 3200),
('exclusive-dior-4', 30, 10500);

-- ============================================================
-- VUE UTILE : catalogue complet avec prix formatés
-- ============================================================
CREATE VIEW v_catalogue AS
SELECT
    p.id,
    p.brand,
    p.name,
    p.category,
    p.price_per_ml,
    MAX(CASE WHEN pp.size_ml = 5  THEN pp.price_cents END)  AS price_5ml_cents,
    MAX(CASE WHEN pp.size_ml = 10 THEN pp.price_cents END)  AS price_10ml_cents,
    MAX(CASE WHEN pp.size_ml = 30 THEN pp.price_cents END)  AS price_30ml_cents,
    p.stripe_product_id
FROM products p
LEFT JOIN product_prices pp ON pp.product_id = p.id
GROUP BY p.id;
