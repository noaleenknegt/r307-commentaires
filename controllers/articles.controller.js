// CONTROLEUR : la traduction entre HTTP et le service.
// Chaque fonction est le callback d'une route : (req, res, next).
//   1. lire ce que la requete apporte : req.params, req.query, req.body ;
//   2. verifier la forme (400 si elle ne va pas) ;
//   3. appeler le service ;
//   4. choisir le code et repondre. Toute erreur part vers next(err).
// Le controleur ne lit jamais le fichier JSON : c'est le travail du service.

const service = require('../services/articles.service');
const ErreurHttp = require('../utils/erreur-http');

// GET /api/articles
function lister(req, res, next) {
  service.lister()
    .then((articles) => res.json(articles))
    .catch(next);
}

// GET /api/articles/:id?champs=titre,date
function trouver(req, res, next) {
  const id = Number(req.params.id); // req.params est toujours du texte
  const champs = req.query.champs ? req.query.champs.split(',') : null;
  service.trouver(id, champs)
    .then((article) => res.json(article))
    .catch(next);
}

// POST /api/articles
function creer(req, res, next) {
  const { titre, categorie, auteur, contenu } = req.body || {};
  if (!titre) return next(new ErreurHttp(400, 'TITRE_MANQUANT', 'Le champ titre est obligatoire.'));
  service.creer({ titre, categorie, auteur, contenu })
    .then((article) => res.status(201).json(article))
    .catch(next);
}

// PATCH /api/articles/:id
function modifier(req, res, next) {
  const id = Number(req.params.id);
  service.modifier(id, req.body || {})
    .then((article) => res.json(article))
    .catch(next);
}

// DELETE /api/articles/:id
function supprimer(req, res, next) {
  const id = Number(req.params.id);
  service.supprimer(id)
    .then(() => res.status(204).end())
    .catch(next);
}

module.exports = { lister, trouver, creer, modifier, supprimer };
