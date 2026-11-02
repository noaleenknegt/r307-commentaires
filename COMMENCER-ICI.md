# Exercice R307 · Séance 1 · Les commentaires, à deux, dans PostgreSQL

En groupe de deux (trois accepté). L'énoncé complet est dans `exercice-seance1.pdf`.

## 1. Lire le contrat, ensemble

`CONTRAT.md` : les six routes, et les six fonctions du service. C'est ce qui relie les deux moitiés
du travail. Le service de départ le respecte déjà, avec un fichier JSON.

## 2. Le dépôt GitHub

Une fois par ordinateur :

```
git config --global user.name "Prénom Nom"
git config --global user.email "l-adresse-de-votre-compte-github"
git config --global pull.rebase false
```

Une personne crée le dépôt `r307-commentaires` (vide) sur GitHub, puis dans ce dossier :

```
git init
git add .
git commit -m "Squelette de départ"
git branch -M main
git remote add origin URL-DU-DEPOT
git push -u origin main
```

Puis *Settings > Collaborators > Add people* : les autres membres (et `josephazar` si le dépôt est privé).
Les autres acceptent l'invitation, puis `git clone URL-DU-DEPOT`.

## 3. Lancer le projet (chacun sur sa machine)

1. Dans pgAdmin : la base **ateliers**, avec `db/ateliers.sql` exécuté (six articles).
2. Copier `.env.exemple` en `.env`, mettre **votre** mot de passe PostgreSQL dans `PGPASSWORD`.
3. Dans le terminal :

```
npm install
npm run reinitialiser
npm start
```

4. Dans un second terminal : `npm run verifier`. Au départ : **5 / 31**.

## 4. Le travail

| Moitié | Fichiers |
|---|---|
| Côté API | `routes/commentaires.routes.js`, `controllers/commentaires.controller.js` |
| Côté base | `sql/commentaires.sql`, `sql/requetes.sql`, `services/commentaires.service.js` |

Chacun ses fichiers. Avant de commencer : `git pull --no-edit`. Dès qu'une chose marche :
`git add` le fichier, `git commit -m "un message clair"`, `git push`.

## 5. Vérifier

| Où en est le groupe | `npm run verifier` |
|---|---|
| au départ | 5 / 31 |
| côté API fini, service encore en JSON | 19 / 31 |
| côté base fini, routes pas encore écrites | 14 / 31 |
| les deux, assemblés | 31 / 31 |

## Remettre la base à zéro

Relancer `db/ateliers.sql` remet les six articles, et **efface aussi la table `commentaires`** :
relancez ensuite `sql/commentaires.sql`.

## Rendre

Les noms dans `package.json` (champ `groupe`), tout poussé sur GitHub, et sur Moodle le **lien** du dépôt.
Chaque membre du groupe dépose le même lien.
