// TYPE 5 · MIDDLEWARES DE GESTION DES ERREURS : places tout a la fin.
// Toute erreur repond en JSON, toujours avec la meme forme :
//    { "erreur": { "code": "...", "message": "..." } }

// Aucune route n'a repondu : adresse inconnue.
function routeInconnue(req, res) {
  res.status(404).json({
    erreur: { code: 'ROUTE_INCONNUE', message: `Aucune route pour ${req.method} ${req.originalUrl}.` },
  });
}

// QUATRE parametres : c'est a cela qu'Express reconnait un gestionnaire d'erreurs.
// eslint-disable-next-line no-unused-vars
function gestionnaireErreurs(err, req, res, next) {
  const statut = err.status || 500;
  if (statut >= 500) console.error(err); // le detail reste dans le terminal du serveur
  let code = err.code || 'ERREUR_INTERNE';
  let message = statut >= 500 ? 'Erreur interne du serveur.' : err.message;
  if (err.type === 'entity.parse.failed') {
    code = 'JSON_INVALIDE';
    message = 'Le corps de la requête n’est pas du JSON valide.';
  }
  res.status(statut).json({ erreur: { code, message } });
}

module.exports = { routeInconnue, gestionnaireErreurs };
