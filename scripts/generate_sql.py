#!/usr/bin/env python3
"""Régénère database/dct_france.sql à partir des fichiers data-*.js.

Les fichiers data-designers.js, data-niche.js et data-exclusive.js sont la
SEULE source de vérité pour le catalogue et les prix (ce sont eux qui
alimentent le site). Ce script les relit et régénère le fichier SQL en
conséquence, pour qu'il ne puisse jamais diverger silencieusement.

Ne pas éditer database/dct_france.sql à la main : éditer les fichiers
data-*.js puis relancer :

    python3 scripts/generate_sql.py
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SOURCES = [
    ("data-designers.js", "designer"),
    ("data-niche.js", "niche"),
    ("data-exclusive.js", "exclusive"),
]

FIELD_RE = re.compile(
    r"""(\w+)\s*:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|(null)|(-?\d+\.?\d*))"""
)


def unescape(s):
    return s.replace("\\'", "'").replace('\\"', '"')


def parse_objects(text):
    """Extrait chaque objet littéral {...} de premier niveau du tableau."""
    objects = []
    depth = 0
    start = None
    for i, ch in enumerate(text):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start is not None:
                objects.append(text[start:i + 1])
                start = None
    return objects


def parse_perfume(block):
    data = {}
    for m in FIELD_RE.finditer(block):
        key = m.group(1)
        if m.group(2) is not None:
            data[key] = unescape(m.group(2))
        elif m.group(3) is not None:
            data[key] = unescape(m.group(3))
        elif m.group(4) is not None:
            data[key] = None
        elif m.group(5) is not None:
            data[key] = float(m.group(5))
    return data


def load_products():
    products = []
    for filename, category in SOURCES:
        path = os.path.join(ROOT, filename)
        text = open(path, encoding="utf-8").read()
        array_start = text.index('[')
        array_text = text[array_start:]
        for block in parse_objects(array_text):
            perfume = parse_perfume(block)
            if "id" not in perfume:
                continue
            perfume["category"] = category
            products.append(perfume)
    return products


def sql_string(value):
    return "'" + value.replace("'", "''") + "'"


def to_cents(value):
    return int(round(value * 100))


def generate(products):
    lines = []
    lines.append("-- ============================================================")
    lines.append("-- DCT FRANCE — Base de données produits + intégration Stripe")
    lines.append("-- ============================================================")
    lines.append("-- FICHIER GÉNÉRÉ AUTOMATIQUEMENT — NE PAS ÉDITER À LA MAIN.")
    lines.append("-- Source de vérité : data-designers.js / data-niche.js / data-exclusive.js")
    lines.append("-- Régénérer avec : python3 scripts/generate_sql.py")
    lines.append("--")
    lines.append("-- Les prix sont stockés en CENTIMES (comme Stripe l'exige).")
    lines.append("-- stripe_product_id et stripe_price_id sont à renseigner")
    lines.append("-- après création des produits/prix dans le dashboard Stripe.")
    lines.append("-- ============================================================")
    lines.append("")
    lines.append("CREATE DATABASE IF NOT EXISTS dct_france CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    lines.append("USE dct_france;")
    lines.append("")
    lines.append("-- ------------------------------------------------------------")
    lines.append("-- TABLE : products")
    lines.append("-- Un enregistrement = un parfum")
    lines.append("-- stripe_product_id = ID produit Stripe (ex: prod_XXXXXX)")
    lines.append("-- ------------------------------------------------------------")
    lines.append("CREATE TABLE products (")
    lines.append("    id              VARCHAR(60)     PRIMARY KEY,")
    lines.append("    brand           VARCHAR(100)    NOT NULL,")
    lines.append("    name            VARCHAR(150)    NOT NULL,")
    lines.append("    category        ENUM('designer','niche','exclusive') NOT NULL,")
    lines.append("    image           VARCHAR(255),")
    lines.append("    price_per_ml    DECIMAL(6,2)    NOT NULL,")
    lines.append("    stripe_product_id VARCHAR(50)   DEFAULT NULL,")
    lines.append("    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP")
    lines.append(") ENGINE=InnoDB;")
    lines.append("")
    lines.append("-- ------------------------------------------------------------")
    lines.append("-- TABLE : product_prices")
    lines.append("-- Un enregistrement = une déclinaison de taille (5ml, 10ml, 30ml)")
    lines.append("-- price_cents     = prix en centimes (EUR) → pour Stripe")
    lines.append("-- stripe_price_id = ID prix Stripe (ex: price_XXXXXX)")
    lines.append("-- ------------------------------------------------------------")
    lines.append("CREATE TABLE product_prices (")
    lines.append("    id              INT             AUTO_INCREMENT PRIMARY KEY,")
    lines.append("    product_id      VARCHAR(60)     NOT NULL,")
    lines.append("    size_ml         TINYINT         NOT NULL,        -- 5, 10 ou 30")
    lines.append("    price_cents     INT             NOT NULL,        -- ex: 1000 = 10,00 €")
    lines.append("    stripe_price_id VARCHAR(50)     DEFAULT NULL,")
    lines.append("    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,")
    lines.append("    UNIQUE KEY uq_product_size (product_id, size_ml)")
    lines.append(") ENGINE=InnoDB;")
    lines.append("")

    for _, category in SOURCES:
        group = [p for p in products if p["category"] == category]
        if not group:
            continue
        lines.append("-- ============================================================")
        lines.append(f"-- INSERTION — {category.upper()}")
        lines.append("-- ============================================================")
        lines.append("INSERT INTO products (id, brand, name, category, image, price_per_ml) VALUES")
        rows = []
        for p in group:
            rows.append(
                "({}, {}, {}, {}, {}, {:.2f})".format(
                    sql_string(p["id"]),
                    sql_string(p["brand"]),
                    sql_string(p["name"]),
                    sql_string(category),
                    sql_string(p.get("image", "")),
                    p["pricePerMl"],
                )
            )
        lines.append(",\n".join(rows) + ";")
        lines.append("")

    lines.append("-- ============================================================")
    lines.append("-- INSERTION — PRIX PAR TAILLE (en centimes)")
    lines.append("-- ============================================================")
    lines.append("INSERT INTO product_prices (product_id, size_ml, price_cents) VALUES")
    price_rows = []
    for p in products:
        for size, key in ((5, "price5ml"), (10, "price10ml"), (30, "price30ml")):
            value = p.get(key)
            if value is None:
                continue
            price_rows.append(f"({sql_string(p['id'])}, {size}, {to_cents(value)})")
    lines.append(",\n".join(price_rows) + ";")
    lines.append("")

    lines.append("-- ============================================================")
    lines.append("-- VUE UTILE : catalogue complet avec prix formatés")
    lines.append("-- ============================================================")
    lines.append("CREATE VIEW v_catalogue AS")
    lines.append("SELECT")
    lines.append("    p.id,")
    lines.append("    p.brand,")
    lines.append("    p.name,")
    lines.append("    p.category,")
    lines.append("    p.price_per_ml,")
    lines.append("    MAX(CASE WHEN pp.size_ml = 5  THEN pp.price_cents END)  AS price_5ml_cents,")
    lines.append("    MAX(CASE WHEN pp.size_ml = 10 THEN pp.price_cents END)  AS price_10ml_cents,")
    lines.append("    MAX(CASE WHEN pp.size_ml = 30 THEN pp.price_cents END)  AS price_30ml_cents,")
    lines.append("    p.stripe_product_id")
    lines.append("FROM products p")
    lines.append("LEFT JOIN product_prices pp ON pp.product_id = p.id")
    lines.append("GROUP BY p.id;")
    lines.append("")

    return "\n".join(lines)


def main():
    products = load_products()
    ids = [p["id"] for p in products]
    duplicates = {i for i in ids if ids.count(i) > 1}
    if duplicates:
        raise SystemExit(f"IDs en double détectés dans les fichiers data-*.js : {duplicates}")

    sql = generate(products)
    out_path = os.path.join(ROOT, "database", "dct_france.sql")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(sql)
    print(f"{len(products)} produits écrits dans {out_path}")


if __name__ == "__main__":
    main()
