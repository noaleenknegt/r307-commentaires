// La connexion a PostgreSQL, partagee par tous les services.
//
// Un Pool garde quelques connexions ouvertes et les prete aux requetes :
// on ne se reconnecte pas a chaque requete HTTP.
// new Pool() sans parametre lit les variables du fichier .env :
//    PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

const { Pool, types } = require('pg');

// Une colonne DATE arrive sinon comme un objet Date a minuit, heure de Paris,
// et JSON.stringify la decale d'un jour : 2026-09-16 devient "2026-09-15T22:00:00.000Z".
// On la garde telle quelle, en texte : '2026-09-16'.
types.setTypeParser(1082, (texte) => texte); // 1082 : le numero du type DATE dans PostgreSQL

const pool = new Pool();

module.exports = pool;
