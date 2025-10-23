# Documentation API - Plateforme de Consultation Juridique

## Vue d'ensemble

Cette API permet la gestion complète d'une plateforme de consultation juridique en ligne. Elle offre des fonctionnalités pour :

- Authentification et gestion des utilisateurs
- Profils de juristes
- Système de réservation et rendez-vous
- Consultations vidéo et messagerie
- Gestion de documents
- Évaluations et avis
- Administration

## Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification. Deux types de tokens sont disponibles :

- **Access Token** : utilisé pour les requêtes API (durée : 1h)
- **Refresh Token** : utilisé pour obtenir un nouveau access token (durée : 24h)

### Endpoints d'authentification

#### Inscription

```
POST /authentification/sign-up
Body: {
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "Client" | "Juriste"
}
```

#### Connexion

```
POST /authentification/sign-in
Body: {
  "email": "string",
  "password": "string"
}
Response: {
  "accessToken": "string",
  "refreshToken": "string"
}
```

#### Google OAuth2

```
POST /google-auth
Body: {
  "token": "google-id-token"
}
```

#### Refresh Token

```
POST /authentification/refresh-token
Body: {
  "refreshToken": "string"
}
```

## Modules

### 1. Users (Utilisateurs)

- `GET /users` - Liste tous les utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `GET /users/me/export-data` - Export RGPD des données (authentifié)
- `DELETE /users/me/delete-account` - Suppression compte RGPD (authentifié)
- `PATCH /users/:id` - Mise à jour utilisateur
- `DELETE /users/:id` - Suppression utilisateur

### 2. Lawyer Profiles (Profils Juristes)

- `POST /lawyer-profiles` - Créer profil juriste (Juriste uniquement)
- `GET /lawyer-profiles` - Liste tous les profils vérifiés
- `GET /lawyer-profiles/search` - Recherche avancée avec filtres
  - Query params: `specialization`, `city`, `country`, `languages[]`, `minRate`, `maxRate`, `minRating`, `minExperience`, `sortBy`, `sortOrder`, `page`, `limit`
- `GET /lawyer-profiles/:id` - Détails d'un profil
- `PATCH /lawyer-profiles` - Mise à jour profil (Juriste authentifié)

### 3. Availabilities (Disponibilités)

- `POST /availabilities` - Créer créneau (Juriste)
- `GET /availabilities/my-availabilities` - Mes créneaux (Juriste)
- `GET /availabilities/lawyer/:lawyerProfileId` - Créneaux d'un juriste
- `GET /availabilities/:id` - Détails d'un créneau
- `PATCH /availabilities/:id` - Modifier créneau (Juriste)
- `DELETE /availabilities/:id` - Supprimer créneau (Juriste)

### 4. Appointments (Rendez-vous)

- `POST /appointments` - Créer RDV (Client)
- `GET /appointments/my-appointments` - Mes RDV
- `GET /appointments/:id` - Détails RDV
- `PATCH /appointments/:id/status` - Changer statut
- `DELETE /appointments/:id/cancel` - Annuler RDV

**Statuts possibles :**

- PENDING → ACCEPTED → SCHEDULED → COMPLETED
- Transitions possibles vers CANCELLED ou NO_SHOW

### 5. Consultations

- `POST /consultations` - Créer consultation
- `GET /consultations` - Mes consultations
- `GET /consultations/:id` - Détails consultation
- `POST /consultations/:id/start` - Démarrer consultation
- `POST /consultations/:id/end` - Terminer consultation
- `PATCH /consultations/:id` - Mettre à jour notes

### 6. Conversations & Messages

**Conversations:**

- `POST /conversations` - Créer conversation
- `GET /conversations` - Mes conversations
- `GET /conversations/:id` - Détails conversation
- `PATCH /conversations/:id/mark-as-read` - Marquer comme lu

**Messages:**

- `POST /messages` - Envoyer message
- `GET /messages?conversationId=:id` - Messages d'une conversation
- `PATCH /messages/:id/mark-as-read` - Marquer message lu
- `DELETE /messages/:id` - Supprimer message

### 7. Documents

- `POST /documents/upload-url` - Obtenir URL de téléversement
- `GET /documents` - Mes documents
- `GET /documents/:id` - Détails document
- `GET /documents/:id/download-url` - URL de téléchargement
- `PATCH /documents/:id/grant-access/:userId` - Donner accès
- `PATCH /documents/:id/revoke-access/:userId` - Retirer accès
- `DELETE /documents/:id` - Supprimer document

### 8. Reviews (Évaluations)

- `POST /reviews` - Créer avis (Client)
- `GET /reviews` - Tous les avis publiés
- `GET /reviews/lawyer/:lawyerProfileId` - Avis d'un juriste
- `GET /reviews/my-reviews` - Mes avis
- `PATCH /reviews/:id/respond` - Répondre à un avis (Juriste)
- `POST /reviews/:id/report` - Signaler un avis
- `PATCH /reviews/:id/moderate` - Modérer avis (Admin)
- `DELETE /reviews/:id` - Supprimer avis

### 9. Admin

**Accès réservé aux administrateurs**

- `GET /admin/statistics` - Statistiques globales
- `GET /admin/users` - Liste utilisateurs
- `GET /admin/lawyers/pending-verification` - Juristes en attente
- `PATCH /admin/lawyers/:id/verify` - Vérifier juriste
- `PATCH /admin/users/:id/suspend` - Suspendre utilisateur
- `DELETE /admin/users/:id` - Supprimer utilisateur
- `GET /admin/reviews/reported` - Avis signalés
- `GET /admin/appointments` - Tous les rendez-vous

## Rôles et Permissions

### Client

- Créer des rendez-vous
- Laisser des avis
- Envoyer des messages
- Gérer ses documents

### Juriste

- Créer et gérer son profil
- Gérer ses disponibilités
- Accepter/rejeter des rendez-vous
- Conduire des consultations
- Répondre aux avis

### Admin

- Vérifier les juristes (KYC)
- Modérer les contenus
- Gérer les utilisateurs
- Accéder aux statistiques

## Codes d'état HTTP

- `200 OK` - Succès
- `201 Created` - Ressource créée
- `400 Bad Request` - Requête invalide
- `401 Unauthorized` - Non authentifié
- `403 Forbidden` - Non autorisé
- `404 Not Found` - Ressource non trouvée
- `409 Conflict` - Conflit (ex: ressource existe déjà)
- `500 Internal Server Error` - Erreur serveur

## Pagination

Les endpoints de liste supportent la pagination :

```
GET /endpoint?page=1&limit=20
Response: {
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

## RGPD

### Export des données

```
GET /users/me/export-data
Headers: { Authorization: Bearer <token> }
```

### Suppression des données

```
DELETE /users/me/delete-account
Headers: { Authorization: Bearer <token> }
```

## WebSocket (À implémenter)

Pour les notifications en temps réel et la messagerie instantanée :

```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' },
});

socket.on('message:new', (data) => {
  // Nouveau message reçu
});

socket.on('notification', (data) => {
  // Nouvelle notification
});
```

## Technologies utilisées

- **NestJS** - Framework backend
- **TypeORM** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données
- **Redis** - Stockage des refresh tokens
- **JWT** - Authentification
- **Bcrypt** - Hashage des mots de passe
- **AWS S3** - Stockage de fichiers
- **Jitsi** - Visioconférence
- **Stripe** - Paiements (à implémenter)

## Installation

```bash
# Installer les dépendances
npm install

# Lancer les conteneurs Docker
docker-compose up -d

# Copier .env.example vers .env et configurer
cp .env.example .env

# Lancer en mode développement
npm run start:dev
```

## Variables d'environnement

Voir `.env.example` pour toutes les variables requises.

## Support

Pour toute question ou problème, contactez l'équipe de développement.
