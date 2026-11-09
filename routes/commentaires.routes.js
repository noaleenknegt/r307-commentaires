// ROUTEUR des commentaires, monte sur /api dans serveur.js.
// A ECRIRE : les six routes de CONTRAT.md, une ligne chacune, comme dans routes/articles.routes.js.
// Rappel : un middleware peut se mettre sur UNE route :
//    router.patch('/commentaires/:id', verifierJeton, controleur.modifier);
// Attention a l'ordre : GET /commentaires (avec ?nom=) avant GET /commentaires/:id ne pose pas de
// probleme, mais une route /commentaires/quelquechose placee apres /commentaires/:id ne serait jamais atteinte.

const express = require('express');
const verifierJeton = require('../middlewares/jeton');
const controleur = require('../controllers/commentaires.controller');

const router = express.Router();

router.get("/articles/:id/commentaires", controleur.lister);
router.post("/articles/:id/commentaires", controleur.creer);
router.get("/commentaires", controleur.parVisiteur);
router.get("/commentaires/:id", controleur.trouver);
router.patch("/commentaires/:id", verifierJeton, controleur.modifier);
router.delete("/commentaires/:id", verifierJeton, controleur.supprimer);

module.exports = router;
