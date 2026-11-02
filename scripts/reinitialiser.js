// Remet data/commentaires.json dans son etat de depart (huit commentaires).
// Utile tant que le service des commentaires est la version JSON.
//    npm run reinitialiser
const fs = require('fs');
const path = require('path');

const dossier = path.join(__dirname, '..', 'data');
fs.copyFileSync(path.join(dossier, 'commentaires.initial.json'), path.join(dossier, 'commentaires.json'));
console.log('data/commentaires.json remis a zero : 8 commentaires.');
