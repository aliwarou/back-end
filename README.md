# Plateforme de Consultation Juridique - Backend API

Une API complète construite avec NestJS pour une plateforme de consultation juridique en ligne permettant aux clients de trouver des juristes, réserver des consultations, et gérer l'ensemble du processus de consultation de bout en bout.

## 🚀 Fonctionnalités Principales

### ✅ Implémenté

- **Authentification & Autorisation**

  - JWT (Access Token + Refresh Token)
  - Google OAuth2
  - Gestion des rôles (Client, Juriste, Admin)
  - Protection des routes par guards

- **Gestion des Utilisateurs**

  - CRUD utilisateurs
  - Export RGPD des données
  - Suppression de compte conforme RGPD

- **Profils Juristes**

  - Création et gestion de profils professionnels
  - Recherche avancée avec filtres multiples
  - Vérification KYC par admin
  - Système de notation et avis

- **Système de Réservation**

  - Gestion des disponibilités
  - Création de rendez-vous
  - Workflow complet (PENDING → ACCEPTED → SCHEDULED → COMPLETED)
  - Annulation et gestion des statuts

- **Consultations**

  - Génération de liens Jitsi pour visioconférence
  - Tracking de durée et horodatage
  - Notes client/juriste

- **Messagerie**

  - Conversations 1:1
  - Messages avec pièces jointes
  - Système de lecture/non-lu

- **Gestion Documentaire**

  - Upload/download via presigned URLs S3
  - Gestion des permissions
  - Support du chiffrement
  - Types de documents variés

- **Évaluations**

  - Système de notation (1-5 étoiles)
  - Commentaires et réponses
  - Signalement et modération

- **Panel Admin**
  - Statistiques globales
  - Vérification des juristes
  - Modération des contenus
  - Gestion des utilisateurs

### 🚧 À Implémenter

- **Module Payments** - Intégration Stripe complète avec webhooks
- **Module Notifications** - WebSocket + Email + Push pour notifications temps réel
- **WebSocket Gateway** - Messagerie instantanée
- **Tests** - Tests unitaires et E2E

## 📋 Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose (recommandé)

## 🛠️ Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd back-end
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Copier le fichier de template et configurer :

```bash
cp env.template .env
```

Éditer `.env` avec vos valeurs :

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=authDB
DB_USER=aliuser
DB_PASSWORD=alipassword

# JWT
JWT_SECRET=votre-secret-jwt-super-securise
JWT_TOKEN_AUDIENCE=votre-audience
JWT_TOKEN_ISSUER=votre-issuer
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_BUCKET_NAME=legal-consultations

# Jitsi
JITSI_BASE_URL=https://meet.jit.si
```

### 4. Lancer les services Docker

```bash
docker-compose up -d
```

Cela démarre :

- PostgreSQL (port 5432)
- Redis (port 6379)
- PgAdmin (port 8080)

### 5. Lancer l'application

```bash
# Mode développement avec watch
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

L'API sera accessible sur `http://localhost:3000`

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Documentation complète de tous les endpoints
- **[Architecture](./ARCHITECTURE.md)** - Architecture détaillée du système

## 🏗️ Structure du Projet

```
src/
├── iam/                    # Authentification & Autorisation
├── users/                  # Gestion utilisateurs + RGPD
├── lawyer-profiles/        # Profils juristes avec recherche avancée
├── availabilities/         # Disponibilités des juristes
├── appointments/           # Système de rendez-vous
├── consultations/          # Consultations vidéo/texte
├── conversations/          # Conversations 1:1
├── messages/               # Messagerie
├── documents/              # Gestion documentaire S3
├── reviews/                # Évaluations et modération
└── admin/                  # Panel administration
```

## 🔑 Endpoints Principaux

### Authentification

- `POST /authentification/sign-up` - Inscription
- `POST /authentification/sign-in` - Connexion
- `POST /authentification/refresh-token` - Renouveler token
- `POST /google-auth` - Connexion Google OAuth2

### Profils Juristes

- `GET /lawyer-profiles/search` - Recherche avancée avec filtres
- `GET /lawyer-profiles/:id` - Détails d'un profil
- `POST /lawyer-profiles` - Créer profil (Juriste)

### Rendez-vous

- `POST /appointments` - Créer RDV (Client)
- `GET /appointments/my-appointments` - Mes RDV
- `PATCH /appointments/:id/status` - Changer statut

### Documents

- `POST /documents/upload-url` - Obtenir URL upload
- `GET /documents/:id/download-url` - URL téléchargement

### RGPD

- `GET /users/me/export-data` - Exporter mes données
- `DELETE /users/me/delete-account` - Supprimer mon compte

Voir [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour la liste complète.

## 🔐 Sécurité

- **Authentification JWT** avec Access + Refresh tokens
- **Hashage Bcrypt** des mots de passe (10 rounds)
- **Validation** stricte avec class-validator
- **Guards & Decorators** pour contrôle d'accès
- **Presigned URLs** pour fichiers S3 avec expiration
- **RGPD** conforme (export + suppression données)

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## 🐳 Docker

Le projet inclut Docker Compose pour faciliter le développement :

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Nettoyer volumes
docker-compose down -v
```

## 🌐 Accès PgAdmin

PgAdmin est disponible sur `http://localhost:8080`

Credentials par défaut :

- Email: waroumy@gmail.com
- Password: admin

## 📊 Technologies Utilisées

- **Framework**: NestJS 10
- **ORM**: TypeORM
- **Base de données**: PostgreSQL
- **Cache**: Redis
- **Authentification**: JWT + Passport
- **Validation**: class-validator
- **Stockage**: AWS S3
- **Visioconférence**: Jitsi
- **OAuth2**: Google

## 📝 Scripts NPM

```bash
npm run start          # Démarrer en mode production
npm run start:dev      # Mode développement avec watch
npm run start:debug    # Mode debug
npm run build          # Compiler le projet
npm run format         # Formatter le code
npm run lint           # Linter le code
npm run test           # Tests unitaires
npm run test:e2e       # Tests E2E
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT.

## 👥 Support

Pour toute question ou problème :

- Consulter la [documentation API](./API_DOCUMENTATION.md)
- Consulter l'[architecture](./ARCHITECTURE.md)
- Ouvrir une issue sur GitHub

## 🗺️ Roadmap

- [ ] Module Payments avec Stripe
- [ ] Module Notifications (WebSocket + Email)
- [ ] Gateway WebSocket pour temps réel
- [ ] Tests complets (unit + E2E)
- [ ] Pipeline CI/CD
- [ ] Monitoring (Prometheus/Grafana)
- [ ] Rate limiting
- [ ] Elasticsearch pour recherche full-text
- [ ] Mobile app (React Native)

---

Développé avec ❤️ en utilisant NestJS
