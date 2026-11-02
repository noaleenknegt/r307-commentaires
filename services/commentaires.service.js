// SERVICE des commentaires · VERSION FICHIER JSON (celle de depart).
// Elle respecte le contrat (CONTRAT.md) : le cote API peut s'en servir tout de suite pour tester
// ses routes. Le cote base la remplace par une version PostgreSQL, avec les MEMES fonctions.
// Les articles, eux, sont deja dans PostgreSQL (services/articles.service.js).

const fs = require('fs/promises');
const path = require('path');
const ErreurHttp = require('../utils/erreur-http');
const articles = require('./articles.service');

const FICHIER = path.join(__dirname, '..', 'data', 'commentaires.json');
const lire = async () => JSON.parse(await fs.readFile(FICHIER, 'utf8'));
const ecrire = (liste) => fs.writeFile(FICHIER, JSON.stringify(liste, null, 2));
const introuvable = (id) => new ErreurHttp(404, 'COMMENTAIRE_INTROUVABLE', `Le commentaire ${id} n'existe pas.`);

async function lister(articleId) {
  await articles.trouver(articleId); // 404 si l'article n'existe pas
  const tous = await lire();
  return tous.filter((c) => c.article_id === articleId).sort((a, b) => a.cree_le.localeCompare(b.cree_le));
}

async function trouver(id) {
  const commentaire = (await lire()).find((c) => c.id === id);
  if (!commentaire) throw introuvable(id);
  return commentaire;
}

async function parVisiteur(nom) {
  const siens = (await lire()).filter((c) => c.nom === nom).sort((a, b) => b.cree_le.localeCompare(a.cree_le));
  const resultat = [];
  for (const c of siens) {
    const article = await articles.trouver(c.article_id);
    resultat.push({ id: c.id, article_id: c.article_id, titre: article.titre, texte: c.texte, cree_le: c.cree_le });
  }
  return resultat;
}

async function creer(articleId, { nom, texte }) {
  await articles.trouver(articleId);
  const tous = await lire();
  const id = tous.length === 0 ? 1 : Math.max(...tous.map((c) => c.id)) + 1;
  const commentaire = { id, article_id: articleId, nom, texte, cree_le: new Date().toISOString() };
  tous.push(commentaire);
  await ecrire(tous);
  return commentaire;
}

async function modifier(id, { texte }) {
  const tous = await lire();
  const commentaire = tous.find((c) => c.id === id);
  if (!commentaire) throw introuvable(id);
  commentaire.texte = texte;
  await ecrire(tous);
  return commentaire;
}

async function supprimer(id) {
  const tous = await lire();
  const restants = tous.filter((c) => c.id !== id);
  if (restants.length === tous.length) throw introuvable(id);
  await ecrire(restants);
}

module.exports = { lister, trouver, parVisiteur, creer, modifier, supprimer };
