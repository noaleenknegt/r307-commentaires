// TYPE 1 · MIDDLEWARE DE NIVEAU APPLICATION : app.use(journal)
// Il voit passer TOUTES les requetes, avant les routes.
// Une ligne par requete, ecrite quand la reponse est partie.

function journal(req, res, next) {
  const debut = performance.now();
  res.on('finish', () => {
    const duree = (performance.now() - debut).toFixed(1);
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duree} ms)`);
  });
  next(); // sans next(), la requete s'arrete ici
}

module.exports = journal;
