
const pool = require('../db/pool');
const ErreurHttp = require('../utils/erreur-http');

const introuvable = (id) => new ErreurHttp(404, 'COMMENTAIRE_INTROUVABLE', `Le commentaire ${id} n'existe pas.`);
const articleIntrouvable = (id) => new ErreurHttp(404, 'ARTICLE_INTROUVABLE', `L'article ${id} n'existe pas.`);

async function lister(articleId) {
  const article = await pool.query(
    'SELECT id FROM articles WHERE id = $1',
    [articleId]
  );

  if (article.rowCount === 0) throw articleIntrouvable(articleId);

  const resultat = await pool.query(
    `SELECT id, article_id, nom, texte, cree_le
     FROM commentaires
     WHERE article_id = $1
     ORDER BY cree_le ASC, id ASC`,
    [articleId]
  );

  return resultat.rows;
}

async function trouver(id) {
  const resultat = await pool.query(
    `SELECT id, article_id, nom, texte, cree_le
     FROM commentaires
     WHERE id = $1`,
    [id]
  );

  if (resultat.rowCount === 0) throw introuvable(id);

  return resultat.rows[0];
}

async function parVisiteur(nom) {
  const resultat = await pool.query(
    `SELECT c.id, c.article_id, a.titre, c.texte, c.cree_le
     FROM commentaires AS c
     JOIN articles AS a ON a.id = c.article_id
     WHERE c.nom = $1
     ORDER BY c.cree_le DESC, c.id DESC`,
    [nom]
  );

  return resultat.rows;
}

async function creer(articleId, { nom, texte }) {
  try {
    const resultat = await pool.query(
      `INSERT INTO commentaires (article_id, nom, texte)
       VALUES ($1, $2, $3)
       RETURNING id, article_id, nom, texte, cree_le`,
      [articleId, nom, texte]
    );

    return resultat.rows[0];
  } catch (err) {
    if (err.code === '23503') {
      throw articleIntrouvable(articleId);
    }

    throw err;
  }
}

async function modifier(id, { texte }) {
  const resultat = await pool.query(
    `UPDATE commentaires
     SET texte = $2
     WHERE id = $1
     RETURNING id, article_id, nom, texte, cree_le`,
    [id, texte]
  );

  if (resultat.rowCount === 0) throw introuvable(id);

  return resultat.rows[0];
}

async function supprimer(id) {
  const resultat = await pool.query(
    'DELETE FROM commentaires WHERE id = $1',
    [id]
  );

  if (resultat.rowCount === 0) throw introuvable(id);
}

module.exports = {
  lister,
  trouver,
  parVisiteur,
  creer,
  modifier,
  supprimer
};
