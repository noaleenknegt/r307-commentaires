// ROUTEUR : la table des adresses. Une ligne par route : methode + chemin -> controleur.
// Aucun traitement ici. On lit ce fichier pour savoir ce que l'API sait faire.

const express = require('express');
const verifierJeton = require('../middlewares/jeton');
const controleur = require('../controllers/articles.controller');

const router = express.Router();

router.use(verifierJeton); // TYPE 4 · niveau routeur : seulement pour /api/articles

router.get('/', controleur.lister);          // lire tout
router.get('/:id', controleur.trouver);      // lire un, avec ?champs=
router.post('/', controleur.creer);          // creer
router.patch('/:id', controleur.modifier);   // modifier en partie
router.delete('/:id', controleur.supprimer); // supprimer

module.exports = router;
