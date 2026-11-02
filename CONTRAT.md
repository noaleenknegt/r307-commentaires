# Le contrat de l'API des commentaires

Ce fichier est le point de rencontre du groupe. Le côté **API** (routeur, contrôleur) appelle ces
fonctions ; le côté **base** (SQL, service) les écrit. Tant que les deux respectent ce contrat, chacun
peut avancer sans attendre l'autre.

Un commentaire a toujours cette forme :

```json
{ "id": 4, "article_id": 2, "nom": "Hugo", "texte": "Le noyer est magnifique...", "cree_le": "2026-09-17T10:30:00.000Z" }
```

## Les routes (côté API : `routes/` et `controllers/`)

| Méthode et chemin | Corps ou paramètre | Réponse | Erreurs |
|---|---|---|---|
| `GET /api/articles/:id/commentaires` | | 200, la liste, du plus ancien au plus récent | 404 si l'article n'existe pas |
| `POST /api/articles/:id/commentaires` | `{ "nom", "texte" }` | 201, le commentaire créé | 400 `CHAMP_MANQUANT` ; 404 si l'article n'existe pas |
| `GET /api/commentaires?nom=Claire` | `nom` dans l'adresse | 200, les commentaires de ce visiteur, avec le **titre** de l'article | 400 `NOM_MANQUANT` |
| `GET /api/commentaires/:id` | | 200, un commentaire | 404 |
| `PATCH /api/commentaires/:id` | `{ "texte" }`, **jeton** | 200, le commentaire modifié | 401 ; 400 `TEXTE_MANQUANT` ; 404 |
| `DELETE /api/commentaires/:id` | **jeton** | 204 | 401 ; 404 |

Le jeton : l'en-tête `Authorization: Bearer admin-demo-2026`, vérifié par `middlewares/jeton.js`, comme en R301.

## Les fonctions du service (côté base : `services/commentaires.service.js`)

| Fonction | Rend | Lance |
|---|---|---|
| `lister(articleId)` | la liste des commentaires de l'article, du plus ancien au plus récent | 404 `ARTICLE_INTROUVABLE` |
| `trouver(id)` | un commentaire | 404 `COMMENTAIRE_INTROUVABLE` |
| `parVisiteur(nom)` | les commentaires de ce visiteur, du plus récent au plus ancien, chacun avec en plus `titre` (le titre de l'article) | rien : une liste vide si personne |
| `creer(articleId, { nom, texte })` | le commentaire créé | 404 `ARTICLE_INTROUVABLE` |
| `modifier(id, { texte })` | le commentaire modifié | 404 `COMMENTAIRE_INTROUVABLE` |
| `supprimer(id)` | rien | 404 `COMMENTAIRE_INTROUVABLE` |

Le service de départ (`services/commentaires.service.js`) respecte déjà ce contrat, avec un fichier JSON.
Le côté API peut donc tester ses routes tout de suite ; le côté base le remplace par PostgreSQL.
