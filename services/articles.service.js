// SERVICE : le seul a toucher aux donnees, ici la base PostgreSQL.
// Il ne connait ni req, ni res, ni HTTP. Il recoit des valeurs, il rend des valeurs,
// ou il lance une erreur. Memes fonctions, memes reponses que la version JSON :
// le routeur et le controleur n'ont pas change.
//
// Les valeurs ne sont JAMAIS collees dans le texte SQL : elles passent par $1, $2...

const pool = require('../db/pool');
const ErreurHttp = require('../utils/erreur-http');

// Les colonnes que l'API renvoie, avec les noms du fichier JSON d'avant.
const COLONNES = `
  a.id, a.titre, a.categorie, au.prenom AS auteur, a.contenu, a.publie, a.cree_le AS date
  FROM articles a JOIN auteurs au ON au.id = a.auteur_id`;

const introuvable = (id) => new ErreurHttp(404, 'ARTICLE_INTROUVABLE', `L'article ${id} n'existe pas.`);

// Une erreur de PostgreSQL a un code a cinq caracteres. On traduit ceux qu'un client
// peut provoquer en une erreur HTTP 400 ; les autres restent des erreurs 500.
function traduire(err) {
  if (err.code === '23514') return new ErreurHttp(400, 'VALEUR_REFUSEE', `Valeur refusée par la base (${err.constraint}).`);
  if (err.code === '22P02') return new ErreurHttp(400, 'TYPE_INVALIDE', 'Une valeur n’a pas le bon type.');
  return err;
}

// READ · tous les articles
async function lister() {
  const resultat = await pool.query(`SELECT ${COLONNES} ORDER BY a.id`);
  return resultat.rows;
}

// READ · un article, eventuellement reduit a quelques champs
async function trouver(id, champs) {
  if (!Number.isInteger(id)) throw introuvable(id);
  const resultat = await pool.query(`SELECT ${COLONNES} WHERE a.id = $1`, [id]);
  const article = resultat.rows[0];
  if (!article) throw introuvable(id);
  if (!champs) return article;
  const reduit = { id: article.id };
  for (const champ of champs) {
    if (champ in article) reduit[champ] = article[champ];
  }
  return reduit;
}

// CREATE · l'auteur arrive par son prenom : la base retrouve son id
async function creer(donnees) {
  try {
    const resultat = await pool.query(
      `INSERT INTO articles (titre, categorie, auteur_id, contenu)
       SELECT $1, $2, au.id, $4 FROM auteurs au WHERE au.prenom = $3
       RETURNING id`,
      [donnees.titre, donnees.categorie || 'conseils', donnees.auteur || 'Marc', donnees.contenu || ''],
    );
    if (resultat.rowCount === 0) {
      throw new ErreurHttp(400, 'AUTEUR_INCONNU', `Aucun auteur ne s'appelle ${donnees.auteur}.`);
    }
    return trouver(resultat.rows[0].id);
  } catch (err) {
    throw traduire(err);
  }
}

// UPDATE · partiel : COALESCE garde l'ancienne valeur quand le champ n'est pas envoye
async function modifier(id, changements) {
  if (!Number.isInteger(id)) throw introuvable(id);
  const { titre, categorie, auteur, contenu, publie } = changements;
  try {
    const resultat = await pool.query(
      `UPDATE articles SET
         titre     = COALESCE($2, titre),
         categorie = COALESCE($3, categorie),
         contenu   = COALESCE($4, contenu),
         publie    = COALESCE($5, publie),
         auteur_id = COALESCE((SELECT id FROM auteurs WHERE prenom = $6), auteur_id)
       WHERE id = $1`,
      [id, titre ?? null, categorie ?? null, contenu ?? null, publie ?? null, auteur ?? null],
    );
    if (resultat.rowCount === 0) throw introuvable(id);
    return trouver(id);
  } catch (err) {
    throw traduire(err);
  }
}

// DELETE
async function supprimer(id) {
  if (!Number.isInteger(id)) throw introuvable(id);
  const resultat = await pool.query('DELETE FROM articles WHERE id = $1', [id]);
  if (resultat.rowCount === 0) throw introuvable(id);
}

module.exports = { lister, trouver, creer, modifier, supprimer };
