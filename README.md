# Mon Vieux Grimoire - API Backend

Ceci est l'API RESTful pour la plateforme d'évaluation de livres "Mon Vieux Grimoire". L'API suit les bonnes pratiques de Green Code avec optimisation des images.

## Fonctionnalités

- Authentification utilisateur avec JWT
- Gestion des livres (opérations CRUD)
- Système de notation des livres
- Optimisation des images pour de meilleures performances et un impact environnemental réduit

## Instructions d'installation

### Prérequis

- Node.js (v14+)
- MongoDB (installation locale ou MongoDB Atlas)

### Installation

1. Clonez le dépôt
2. Naviguez vers le répertoire backend
3. Installez les dépendances:
   ```
   npm install
   ```
4. Créez un fichier `.env` avec les variables suivantes:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/mon-vieux-grimoire
   JWT_SECRET=votre_clé_secrète
   ```
5. Démarrez le serveur:
   ```
   npm start
   ```
   Ou pour le développement avec rechargement automatique:
   ```
   npm run dev
   ```

## Points d'API

### Authentification

- **POST /api/auth/signup**: Inscrire un nouvel utilisateur
  - Corps: `{ email: string, password: string }`
  - Réponse: `{ message: string }`

- **POST /api/auth/login**: Connecter un utilisateur
  - Corps: `{ email: string, password: string }`
  - Réponse: `{ userId: string, token: string }`

### Livres

- **GET /api/books**: Obtenir tous les livres
  - Pas d'authentification requise
  - Réponse: Tableau de livres

- **GET /api/books/:id**: Obtenir un livre spécifique par ID
  - Pas d'authentification requise
  - Réponse: Un seul livre

- **GET /api/books/bestrating**: Obtenir les 3 livres les mieux notés
  - Pas d'authentification requise
  - Réponse: Tableau de livres

- **POST /api/books**: Créer un nouveau livre
  - Authentification requise
  - Corps: FormData avec `book` (chaîne JSON) et `image` (fichier)
  - Réponse: `{ message: string }`

- **PUT /api/books/:id**: Mettre à jour un livre
  - Authentification requise (uniquement le créateur du livre)
  - Corps: FormData avec `book` (chaîne JSON) et `image` (fichier) OU objet JSON
  - Réponse: `{ message: string }`

- **DELETE /api/books/:id**: Supprimer un livre
  - Authentification requise (uniquement le créateur du livre)
  - Réponse: `{ message: string }`

- **POST /api/books/:id/rating**: Noter un livre
  - Authentification requise
  - Corps: `{ userId: string, rating: number }`
  - Réponse: Objet livre mis à jour

## Fonctionnalités Green Code

- Optimisation des images avec Sharp pour:
  - Redimensionner les images (max 800x1200)
  - Convertir au format WebP
  - Compresser les images pour réduire la taille des fichiers
  - Nettoyer les fichiers temporaires

## Fonctionnalités de sécurité

- Hachage de mot de passe avec bcrypt
- Authentification JWT
- Limitation de débit sur les points d'API d'authentification
- Helmet pour sécuriser les en-têtes HTTP
- Validation pour les téléchargements de fichiers (type et taille)
