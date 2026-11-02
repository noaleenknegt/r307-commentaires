// Verifie l'exercice : la table commentaires dans PostgreSQL, les six routes, et les deux ensemble.
// 1. le serveur tourne dans un autre terminal :  npm start
// 2. puis :                                      npm run verifier
// Le script lit le meme fichier .env que le serveur. Il ajoute des lignes de test (nom 'Verif')
// et les retire a la fin.

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const BASE = `http://localhost:${process.env.PORT || 3000}/api`;
const JETON = process.env.JETON_ADMIN || 'admin-demo-2026';
const pool = new Pool();

let ok = 0;
let total = 0;
function verifier(nom, condition, detail = '') {
  total += 1;
  if (condition) ok += 1;
  console.log(`${condition ? 'OK  ' : 'NON '} ${nom}${condition ? '' : `  -> ${detail}`}`);
}
const titre = (t) => console.log(`\n--- ${t}`);
const requete = (sql, valeurs) => pool.query(sql, valeurs).catch((err) => ({ erreur: err, rows: [], rowCount: 0 }));
const envoyer = (methode, chemin, corps, jeton) => fetch(BASE + chemin, {
  method: methode,
  headers: { 'Content-Type': 'application/json', ...(jeton ? { Authorization: `Bearer ${JETON}` } : {}) },
  body: corps ? JSON.stringify(corps) : undefined,
});
const json = (r) => r.json().catch(() => null);

(async () => {
  const connexion = await requete('SELECT 1');
  if (connexion.erreur) {
    console.log(`NON  connexion a PostgreSQL impossible -> ${connexion.erreur.message}`);
    console.log('     Verifiez le fichier .env (PGUSER, PGPASSWORD, PGDATABASE) et que PostgreSQL tourne.');
    process.exit(1);
  }
  try { await fetch(`${BASE}/articles`); } catch {
    console.log(`NON  le serveur ne repond pas sur ${BASE} : lancez npm start dans un autre terminal`);
    await pool.end();
    process.exit(1);
  }

  // =========================================================================
  titre('Cote base : la table commentaires');
  const table = await requete("SELECT to_regclass('commentaires') AS t");
  const aTable = !!table.rows[0]?.t;
  verifier('la table commentaires existe', aTable, 'executez sql/commentaires.sql dans la base');
  const fk = await requete(`SELECT confdeltype FROM pg_constraint WHERE conrelid = to_regclass('commentaires')
    AND contype = 'f' AND confrelid = to_regclass('articles')`);
  verifier('article_id est une cle etrangere vers articles', fk.rowCount === 1, 'REFERENCES articles (id) manquant');
  verifier('ON DELETE CASCADE sur cette cle', fk.rows[0]?.confdeltype === 'c', 'supprimer un article doit supprimer ses commentaires');
  const colonnes = await requete(`SELECT column_name, is_nullable FROM information_schema.columns
    WHERE table_name = 'commentaires' ORDER BY ordinal_position`);
  const noms = colonnes.rows.map((c) => c.column_name).join(',');
  verifier('les colonnes : id, article_id, nom, texte, cree_le', noms === 'id,article_id,nom,texte,cree_le', noms || 'aucune');
  const obligatoires = colonnes.rows.filter((c) => c.is_nullable === 'NO').map((c) => c.column_name);
  verifier('nom, texte et cree_le sont obligatoires (NOT NULL)',
    ['nom', 'texte', 'cree_le'].every((c) => obligatoires.includes(c)), obligatoires.join(',') || 'aucune colonne');
  const vide = await requete("INSERT INTO commentaires (article_id, nom, texte) VALUES (1, 'Verif', '') RETURNING id");
  verifier('un texte vide est refuse par la base (CHECK)', vide.erreur?.code === '23514',
    vide.erreur ? vide.erreur.message : 'une contrainte CHECK manque');
  const seed = await requete('SELECT count(*)::int AS n FROM commentaires WHERE article_id = 1');
  verifier('les huit commentaires de depart sont inseres (3 sur l\'article 1)', seed.rows[0]?.n >= 3,
    seed.erreur ? seed.erreur.message : `${seed.rows[0]?.n} trouve(s)`);

  // =========================================================================
  titre('Cote API : les six routes');
  let r = await fetch(`${BASE}/articles/1/commentaires`);
  const liste = await json(r);
  verifier('GET /api/articles/1/commentaires : 200 et une liste', r.status === 200 && Array.isArray(liste), r.status);
  verifier('  triee du plus ancien au plus recent',
    Array.isArray(liste) && liste.length > 0 && liste.every((c, i) => i === 0 || liste[i - 1].cree_le <= c.cree_le), 'ordre faux ou liste vide');
  r = await fetch(`${BASE}/articles/999999/commentaires`);
  verifier('GET sur un article qui n\'existe pas : 404', r.status === 404, r.status);

  r = await envoyer('POST', '/articles/4/commentaires', { nom: 'Verif', texte: 'Ecrit par l\'API' });
  const cree = (await json(r)) || {};
  verifier('POST /api/articles/4/commentaires : 201 et le commentaire', r.status === 201 && cree.id && cree.article_id === 4, r.status);
  r = await envoyer('POST', '/articles/4/commentaires', { nom: 'Verif' });
  verifier('POST sans texte : 400', r.status === 400, r.status);
  r = await envoyer('POST', '/articles/999999/commentaires', { nom: 'Verif', texte: 'Perdu' });
  verifier('POST sur un article qui n\'existe pas : 404', r.status === 404, r.status);

  const id = cree.id ?? 0;
  r = await fetch(`${BASE}/commentaires/${id}`);
  const un = await json(r);
  verifier('GET /api/commentaires/:id : 200 et ce commentaire', r.status === 200 && un?.id === id, r.status);
  r = await fetch(`${BASE}/commentaires/999999`);
  verifier('GET /api/commentaires/999999 : 404', r.status === 404, r.status);

  r = await fetch(`${BASE}/commentaires?nom=Verif`);
  const parNom = await json(r);
  verifier('GET /api/commentaires?nom=Verif : 200, avec le titre de l\'article',
    r.status === 200 && Array.isArray(parNom) && parNom.some((c) => c.id === id && c.titre), r.status);
  r = await fetch(`${BASE}/commentaires`);
  verifier('GET /api/commentaires sans nom : 400', r.status === 400, r.status);

  r = await envoyer('PATCH', `/commentaires/${id}`, { texte: 'Corrige' });
  verifier('PATCH sans jeton : 401', r.status === 401, r.status);
  r = await envoyer('PATCH', `/commentaires/${id}`, { texte: 'Corrige par l\'API' }, true);
  const modifie = await json(r);
  verifier('PATCH avec jeton : 200 et le texte modifie', r.status === 200 && modifie?.texte === 'Corrige par l\'API', r.status);
  r = await envoyer('PATCH', `/commentaires/${id}`, {}, true);
  verifier('PATCH sans texte : 400', r.status === 400, r.status);
  r = await envoyer('PATCH', '/commentaires/999999', { texte: 'x' }, true);
  verifier('PATCH sur un commentaire qui n\'existe pas : 404', r.status === 404, r.status);

  // =========================================================================
  titre('Les deux ensemble : l\'API lit et ecrit dans la base');
  const enBase = await requete('SELECT texte FROM commentaires WHERE id = $1', [id]);
  verifier('le commentaire cree par l\'API est dans la base', enBase.rowCount === 1, 'il est ailleurs (fichier JSON ?)');
  verifier('la modification faite par l\'API est dans la base', enBase.rows[0]?.texte === 'Corrige par l\'API', 'texte different');
  const direct = await requete(
    "INSERT INTO commentaires (article_id, nom, texte) VALUES (2, 'Verif', 'Ecrit directement en SQL') RETURNING id");
  r = await fetch(`${BASE}/commentaires/${direct.rows[0]?.id ?? 0}`);
  verifier('une ligne inseree en SQL sort par l\'API', r.status === 200, 'le service lit encore le fichier JSON ?');

  r = await envoyer('DELETE', `/commentaires/${id}`);
  verifier('DELETE sans jeton : 401', r.status === 401, r.status);
  r = await envoyer('DELETE', `/commentaires/${id}`, null, true);
  verifier('DELETE avec jeton : 204', r.status === 204, r.status);
  r = await envoyer('DELETE', `/commentaires/${id}`, null, true);
  verifier('DELETE une seconde fois : 404', r.status === 404, r.status);

  const art = await requete("INSERT INTO articles (titre, auteur_id) VALUES ('Article de verification', 1) RETURNING id");
  const idArt = art.rows[0]?.id;
  await requete("INSERT INTO commentaires (article_id, nom, texte) VALUES ($1, 'Verif', 'Disparait avec l''article')", [idArt]);
  await requete('DELETE FROM articles WHERE id = $1', [idArt]);
  const orphelins = await requete('SELECT count(*)::int AS n FROM commentaires WHERE article_id = $1', [idArt]);
  verifier('supprimer un article supprime ses commentaires', orphelins.rows[0]?.n === 0,
    orphelins.erreur ? orphelins.erreur.message : `${orphelins.rows[0]?.n} commentaire(s) restent`);

  // =========================================================================
  titre('Le code');
  const lireCode = (f) => { try { return fs.readFileSync(path.join(__dirname, '..', f), 'utf8'); } catch { return ''; } };
  const service = lireCode('services/commentaires.service.js');
  const controleur = lireCode('controllers/commentaires.controller.js');
  verifier('le service n\'utilise plus le fichier JSON', !/fs\/promises|readFile|writeFile/.test(service), 'fs est encore la');
  verifier('aucune valeur collee dans le SQL : des $1, pas de ${...}', !/query\(\s*`[^`]*\$\{(?!COLONNES)/.test(service), 'injection possible');
  verifier('le controleur passe par le service, jamais par la base', /service\.\w+\(/.test(controleur) && !/db\/pool|pool\.query/.test(controleur),
    /db\/pool|pool\.query/.test(controleur) ? 'pas de pool dans le controleur' : 'le controleur n\'appelle pas encore le service');

  await requete("DELETE FROM commentaires WHERE nom = 'Verif'");
  await pool.end();
  console.log(`\n${ok} / ${total}`);
})();
