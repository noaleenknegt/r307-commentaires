-- =============================================================================
-- R307 · Séance 1 · La base des Ateliers du Bois
-- Deux tables : les auteurs, et leurs articles. Les mêmes six articles que le
-- fichier JSON de demo-json.
--
-- À exécuter dans la base « ateliers » :
--   pgAdmin : clic droit sur la base ateliers > Query Tool, ouvrir ce fichier, F5
--   terminal : psql -d ateliers -f db/ateliers.sql
-- Le script peut être relancé : il efface les tables et les recrée.
-- Il efface AUSSI la table commentaires de l'exercice, qui dépend des articles :
-- après lui, relancer sql/commentaires.sql.
-- =============================================================================

DROP TABLE IF EXISTS commentaires;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS auteurs;

CREATE TABLE auteurs (
  id      INT  GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  prenom  TEXT NOT NULL UNIQUE,
  role    TEXT NOT NULL
);

CREATE TABLE articles (
  id         INT     GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titre      TEXT    NOT NULL CHECK (titre <> ''),
  categorie  TEXT    NOT NULL DEFAULT 'conseils'
                     CHECK (categorie IN ('conseils', 'chantiers', 'atelier')),
  auteur_id  INT     NOT NULL REFERENCES auteurs (id),
  contenu    TEXT    NOT NULL DEFAULT '',
  publie     BOOLEAN NOT NULL DEFAULT false,
  cree_le    DATE    NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO auteurs (prenom, role) VALUES
  ('Marc',   'gérant'),
  ('Sophie', 'menuisière'),
  ('Théo',   'apprenti');

INSERT INTO articles (titre, categorie, auteur_id, contenu, publie, cree_le) VALUES
  ('Choisir son bois pour une table de jardin', 'conseils', 1,
   'Le chêne et le mélèze tiennent dehors sans traitement lourd. Le pin, non.', true, '2026-09-02'),
  ('Une bibliothèque sur mesure à Besançon', 'chantiers', 1,
   'Trois mètres de noyer, un escalier à contourner et une semaine de pose.', true, '2026-09-16'),
  ('Huile ou vernis : ce qui protège vraiment', 'conseils', 2,
   'L''huile nourrit et se reprend facilement. Le vernis protège plus longtemps.', false, '2026-10-01'),
  ('Restaurer une chaise paillée', 'atelier', 2,
   'Démonter, nettoyer, recoller : la paille se refait en dernier.', true, '2026-10-08'),
  ('Une cuisine en chêne massif à Dole', 'chantiers', 3,
   'Douze caissons, un plan de travail de quatre mètres, aucune vis visible.', true, '2026-10-15'),
  ('Affûter ses ciseaux à bois', 'atelier', 3,
   'Une pierre à eau, un angle de 25 degrés, et de la patience.', false, '2026-10-22');

SELECT a.id, a.titre, au.prenom AS auteur, a.publie
FROM articles a JOIN auteurs au ON au.id = a.auteur_id
ORDER BY a.id;
