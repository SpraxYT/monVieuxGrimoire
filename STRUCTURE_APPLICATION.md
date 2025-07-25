# Documentation détaillée de l'API Mon Vieux Grimoire

Ce document explique en détail la structure complète de l'application, le rôle de chaque fichier, et les interactions entre les différents composants.

## Structure générale du projet

```
backend/
│
├── controllers/           # Gestion de la logique métier
│   ├── books.js           # Contrôleur pour les opérations liées aux livres
│   └── user.js            # Contrôleur pour l'authentification
│
├── images/                # Stockage des images
│   ├── temp/              # Stockage temporaire avant optimisation
│   └── optimized/         # Images optimisées utilisées par l'application
│
├── middleware/            # Fonctions intermédiaires pour le traitement des requêtes
│   ├── auth.js            # Authentification JWT
│   ├── image-optimization.js # Optimisation des images avec Sharp
│   └── multer-config.js   # Configuration pour le téléchargement de fichiers
│
├── models/                # Modèles de données Mongoose
│   ├── Book.js            # Schéma pour les livres
│   └── User.js            # Schéma pour les utilisateurs
│
├── routes/                # Définition des routes de l'API
│   ├── books.js           # Routes pour les opérations sur les livres
│   └── user.js            # Routes pour l'authentification
│
├── .env                   # Variables d'environnement
├── app.js                 # Configuration de l'application Express
├── server.js              # Point d'entrée principal
├── package.json           # Dépendances et scripts
└── README.md              # Documentation principale
```

## Explication détaillée de chaque fichier

### 1. Fichiers principaux

#### `server.js`
- **Fonction** : Point d'entrée principal de l'application.
- **Rôle** : Configure le serveur HTTP, normalise le port, gère les erreurs de démarrage et lance l'écoute sur le port spécifié.
- **Interactions** : Importe et utilise l'application Express configurée dans `app.js`.

#### `app.js`
- **Fonction** : Configuration de l'application Express.
- **Rôle** : Met en place tous les middlewares globaux, configure la connexion à MongoDB, définit les routes principales et gère les CORS.
- **Middlewares configurés** : 
  - `helmet` pour la sécurité des en-têtes HTTP
  - `express.json()` pour le parsing des requêtes JSON
  - `cors()` pour la gestion des requêtes cross-origin
  - Rate limiting pour prévenir les attaques par force brute
- **Routes enregistrées** : `/api/books` et `/api/auth`

#### `.env`
- **Fonction** : Stockage des variables d'environnement sensibles.
- **Variables** : 
  - `PORT` : Port sur lequel le serveur écoute (4000)
  - `MONGODB_URI` : URI de connexion à la base de données MongoDB
  - `JWT_SECRET` : Clé secrète pour signer les tokens JWT

#### `package.json`
- **Fonction** : Configuration du projet Node.js.
- **Contenu** : Liste des dépendances, scripts de démarrage, informations sur le projet.
- **Scripts** : 
  - `start` : Démarrer le serveur avec Node.js
  - `dev` : Démarrer le serveur avec Nodemon pour le développement

### 2. Models (Modèles de données)

#### `models/User.js`
- **Fonction** : Définit le schéma pour les utilisateurs dans MongoDB.
- **Structure** : 
  - `email` : String, unique et requis
  - `password` : String, requis (stocké sous forme hachée)
- **Plugins** : Utilise `mongoose-unique-validator` pour garantir l'unicité des emails.

#### `models/Book.js`
- **Fonction** : Définit le schéma pour les livres dans MongoDB.
- **Structure** : 
  - `userId` : Identifiant du créateur du livre
  - `title` : Titre du livre
  - `author` : Auteur du livre
  - `imageUrl` : URL de l'image de couverture
  - `year` : Année de publication
  - `genre` : Genre du livre
  - `ratings` : Array de notations (userId, grade)
  - `averageRating` : Note moyenne calculée
- **Sous-schéma** : `ratingSchema` pour les notations avec `userId` et `grade`

### 3. Controllers (Contrôleurs)

#### `controllers/user.js`
- **Fonction** : Gère la logique d'authentification.
- **Méthodes** :
  - `signup` : Crée un nouvel utilisateur avec mot de passe haché
  - `login` : Vérifie les identifiants et renvoie un token JWT

#### `controllers/books.js`
- **Fonction** : Gère toutes les opérations CRUD sur les livres.
- **Méthodes** :
  - `createBook` : Crée un nouveau livre avec image
  - `getAllBooks` : Récupère tous les livres
  - `getOneBook` : Récupère un livre par ID
  - `getBestRatedBooks` : Récupère les 3 meilleurs livres
  - `updateBook` : Met à jour un livre existant
  - `deleteBook` : Supprime un livre et son image
  - `rateBook` : Ajoute une notation à un livre et recalcule la moyenne

### 4. Routes

#### `routes/user.js`
- **Fonction** : Définit les endpoints pour l'authentification.
- **Routes** :
  - `POST /api/auth/signup` : Inscription
  - `POST /api/auth/login` : Connexion

#### `routes/books.js`
- **Fonction** : Définit les endpoints pour la gestion des livres.
- **Routes** :
  - `GET /api/books` : Liste tous les livres
  - `GET /api/books/bestrating` : Liste les 3 livres les mieux notés
  - `GET /api/books/:id` : Récupère un livre spécifique
  - `POST /api/books` : Crée un nouveau livre (authentifié + upload d'image)
  - `PUT /api/books/:id` : Met à jour un livre (authentifié + upload d'image optionnel)
  - `DELETE /api/books/:id` : Supprime un livre (authentifié)
  - `POST /api/books/:id/rating` : Note un livre (authentifié)

### 5. Middleware

#### `middleware/auth.js`
- **Fonction** : Vérifie l'authentification via JWT.
- **Processus** : Extrait le token JWT de l'en-tête Authorization, le vérifie et ajoute l'ID utilisateur à l'objet requête.
- **Utilisation** : Protège les routes qui nécessitent une authentification.

#### `middleware/multer-config.js`
- **Fonction** : Configure le téléchargement de fichiers.
- **Configuration** : 
  - Destination : `/images/temp`
  - Nommage : nom original + timestamp
  - Filtrage : accepte uniquement les images (jpg, jpeg, png, webp)
  - Limite : 10 Mo maximum

#### `middleware/image-optimization.js`
- **Fonction** : Optimise les images téléchargées.
- **Processus** : 
  1. Prend l'image temporaire téléchargée
  2. Redimensionne à maximum 800x1200px
  3. Convertit en format WebP avec compression (qualité 80%)
  4. Enregistre dans `/images/optimized`
  5. Supprime l'image temporaire
  6. Met à jour le chemin de l'image dans la requête

### 6. Flux de données typiques

#### Création d'un livre :
1. Requête avec authentification et image arrive à `POST /api/books`
2. `auth.js` vérifie le token JWT
3. `multer-config.js` gère le téléchargement de l'image en temporaire
4. `image-optimization.js` optimise l'image
5. `createBook` dans `books.js` crée un nouveau document livre
6. Réponse envoyée au client

#### Notation d'un livre :
1. Requête authentifiée arrive à `POST /api/books/:id/rating`
2. `auth.js` vérifie le token JWT
3. `rateBook` dans `books.js` :
   - Vérifie que l'utilisateur n'a pas déjà noté ce livre
   - Ajoute la nouvelle note au tableau de notations
   - Recalcule la note moyenne
   - Sauvegarde les changements
4. Renvoie le livre mis à jour

### 7. Aspects Green Code

L'API implémente plusieurs pratiques de Green Code pour réduire l'empreinte environnementale :

#### Optimisation des images :
- **Redimensionnement** : Limite la taille des images à 800x1200px maximum
- **Format WebP** : Utilise un format moderne plus efficace que JPEG/PNG
- **Compression** : Réduit la qualité à 80% (imperceptible visuellement mais économise du stockage)
- **Nettoyage** : Supprime les fichiers temporaires inutiles

#### Autres aspects écologiques :
- Rate limiting pour réduire la charge serveur
- Structure efficace de la base de données
- Validation côté serveur pour minimiser les requêtes inutiles
- Cache-Control pour optimiser les requêtes répétées

### 8. Sécurité

L'API implémente plusieurs mesures de sécurité :

- **Helmet** : Protection contre les vulnérabilités web courantes
- **JWT** : Authentification sécurisée sans état
- **Bcrypt** : Hachage sécurisé des mots de passe
- **Rate limiting** : Protection contre les attaques par force brute
- **Validation** : Contrôle des entrées pour prévenir les injections
- **CORS** : Contrôle des domaines autorisés à accéder à l'API

### 9. Instructions de déploiement

Pour déployer cette application :

1. Installer Node.js et MongoDB sur le serveur
2. Configurer MongoDB et créer une base de données
3. Cloner le code source
4. Installer les dépendances avec `npm install`
5. Configurer les variables d'environnement dans `.env`
6. Lancer avec `npm start` ou utiliser PM2 pour la production
