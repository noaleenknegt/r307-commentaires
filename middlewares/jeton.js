// TYPE 4 · MIDDLEWARE DE NIVEAU ROUTEUR : router.use(verifierJeton)
// Il ne voit que les requetes du routeur des articles.
// Lire est public. Ecrire (POST, PATCH, DELETE) demande l'en-tete :
//    Authorization: Bearer <jeton>
// Le jeton vient du fichier .env, jamais du code.

const ErreurHttp = require('../utils/erreur-http');

const LECTURE = ['GET', 'HEAD'];

function verifierJeton(req, res, next) {
  if (LECTURE.includes(req.method)) return next();

  const [type, jeton] = (req.get('Authorization') || '').split(' ');
  if (type !== 'Bearer' || jeton !== process.env.JETON_ADMIN) {
    return next(new ErreurHttp(401, 'NON_AUTHENTIFIE', 'Écrire demande : Authorization: Bearer <jeton>.'));
  }
  next();
}

module.exports = verifierJeton;
