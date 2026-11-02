// Une erreur qui connait son code HTTP.
// Le service la lance (« cet article n'existe pas » : 404),
// le gestionnaire d'erreurs la transforme en reponse JSON.
class ErreurHttp extends Error {
  constructor(statut, code, message) {
    super(message);
    this.status = statut;
    this.code = code;
  }
}

module.exports = ErreurHttp;
