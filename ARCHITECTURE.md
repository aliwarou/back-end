# Architecture de la Plateforme de Consultation Juridique

## Vue d'ensemble

Cette plateforme est construite avec une architecture modulaire utilisant NestJS, permettant une séparation claire des responsabilités et une scalabilité optimale.

## Structure des Modules

```
src/
├── iam/                          # Identity & Access Management
│   ├── authentification/         # Gestion de l'authentification
│   │   ├── guards/              # Guards JWT et Auth
│   │   ├── decorators/          # Décorateurs (@Auth, @ActiveUser)
│   │   └── oauth2/              # Google OAuth2
│   ├── authorization/            # Gestion des autorisations
│   │   ├── guards/              # Role guards
│   │   └── decorators/          # Décorateurs de rôles
│   └── config/                   # Configuration JWT
│
├── users/                        # Gestion des utilisateurs
│   ├── entities/                # Entité User
│   ├── dto/                     # DTOs (Create, Update, GDPR Export)
│   └── hashing/                 # Service de hashage Bcrypt
│
├── lawyer-profiles/              # Profils juristes
│   ├── entities/                # Entité LawyerProfile
│   ├── dto/                     # DTOs avec SearchLawyerDto
│   └── Recherche avancée avec filtres et pagination
│
├── availabilities/               # Disponibilités des juristes
│   ├── entities/                # Entité Availability
│   └── Gestion des créneaux horaires
│
├── appointments/                 # Système de rendez-vous
│   ├── entities/                # Entité Appointment
│   ├── enums/                   # AppointmentStatus (workflow)
│   └── Gestion du cycle de vie complet
│
├── consultations/                # Consultations vidéo/texte
│   ├── entities/                # Entité Consultation
│   └── Intégration Jitsi, tracking durée
│
├── conversations/                # Conversations 1:1
│   ├── entities/                # Entité Conversation
│   └── Gestion des discussions
│
├── messages/                     # Messagerie
│   ├── entities/                # Entité Message
│   └── Messages avec pièces jointes
│
├── documents/                    # Gestion documentaire
│   ├── entities/                # Entité Document
│   ├── services/                # S3Service
│   ├── enums/                   # DocumentType
│   └── Upload/download via presigned URLs
│
├── reviews/                      # Système d'évaluation
│   ├── entities/                # Entité Review
│   ├── dto/                     # DTOs (Create, Respond, Report, Moderate)
│   └── Modération et signalement
│
└── admin/                        # Panel d'administration
    ├── dto/                     # DTOs admin
    └── KYC, modération, statistiques

```

## Flux de Données Principaux

### 1. Inscription et Authentification

```
Client → POST /authentification/sign-up
       ↓
    UsersService.create()
       ↓
    Hash password (Bcrypt)
       ↓
    Save to DB
       ↓
    Return User
```

```
Client → POST /authentification/sign-in
       ↓
    Validate credentials
       ↓
    Generate JWT tokens (Access + Refresh)
       ↓
    Store Refresh Token in Redis
       ↓
    Return tokens
```

### 2. Workflow de Réservation

```
1. Client recherche juristes
   GET /lawyer-profiles/search?specialization=...

2. Client consulte disponibilités
   GET /availabilities/lawyer/:id

3. Client crée rendez-vous
   POST /appointments
   Status: PENDING

4. Juriste reçoit notification
   WebSocket → notification:new

5. Juriste accepte
   PATCH /appointments/:id/status
   Status: PENDING → SCHEDULED

6. Paiement traité (Stripe)
   Webhook → isPaid = true

7. Consultation créée automatiquement
   POST /consultations
   Génération lien Jitsi

8. Jour J - Consultation
   POST /consultations/:id/start
   POST /consultations/:id/end
   Status: SCHEDULED → COMPLETED

9. Client laisse avis
   POST /reviews
```

### 3. Flux de Documents

```
Client → POST /documents/upload-url
       ↓
    S3Service.generatePresignedUploadUrl()
       ↓
    Create Document record in DB
       ↓
    Return { uploadUrl, fileKey }
       ↓
Client uploads file directly to S3
       ↓
Client downloads via GET /documents/:id/download-url
       ↓
    S3Service.generatePresignedDownloadUrl()
```

## Schéma de Base de Données

### Entités Principales

**users**

- id, name, email, password, googleId
- role (Client, Juriste, Admin)
- phone, avatar, isActive, emailVerified
- lastLoginAt, createdAt, updatedAt

**lawyer_profiles**

- id, userId (FK)
- specialization, bio, hourlyRate
- languages[], city, country
- barAssociation, licenseNumber
- yearsOfExperience
- KYC fields (idDocumentUrl, licenseDocumentUrl, kycVerified, etc.)
- averageRating, totalReviews
- isVerified, isAvailableForConsultation

**availabilities**

- id, lawyerProfileId (FK)
- date, startTime, endTime
- isAvailable, reason

**appointments**

- id, clientId (FK), lawyerProfileId (FK)
- scheduledAt, durationMinutes
- status (enum), consultationLink
- clientNotes, lawyerNotes
- amount, isPaid, paymentId
- rejectionReason, cancellationReason

**consultations**

- id, appointmentId (FK)
- videoRoomId, videoLink
- startedAt, endedAt, durationMinutes
- documentsShared[], isRecorded

**conversations**

- id, clientId (FK), lawyerId (FK)
- lastMessageAt, lastMessageText
- unreadCountClient, unreadCountLawyer

**messages**

- id, conversationId (FK), senderId (FK)
- content, attachments[]
- isRead, readAt, isDeleted

**documents**

- id, ownerId (FK)
- fileName, fileUrl, mimeType, fileSize
- type (enum), hash
- isEncrypted, accessibleBy[]
- relatedEntityType, relatedEntityId

**reviews**

- id, clientId (FK), lawyerProfileId (FK), appointmentId (FK)
- rating (1-5), comment
- lawyerResponse, respondedAt
- isPublished, isReported, isModerated

## Sécurité

### 1. Authentification & Autorisation

- **JWT Strategy** : Access Token (1h) + Refresh Token (24h)
- **Guards** : AccessTokenGuard, RoleGuard
- **Decorators** : @Auth(), @Role(), @ActiveUser()

### 2. Protection des Routes

```typescript
@Auth(AuthType.Bearer)  // Nécessite authentification
@Role(RoleEnum.Juriste) // Nécessite rôle Juriste
@Post()
create(@ActiveUser() user: ActiveUserData) {
  // user.sub = userId, user.role = role
}
```

### 3. Sécurité des Données

- **Mots de passe** : Hashés avec Bcrypt (10 rounds)
- **Documents** : Presigned URLs avec expiration
- **Permissions** : Vérification propriétaire + accessibleBy[]
- **RGPD** : Export et suppression des données
- **Validation** : class-validator sur tous les DTOs

## Performance & Scalabilité

### 1. Optimisations

- **Indexes DB** : Sur les champs fréquemment recherchés
- **Pagination** : Toutes les listes avec page/limit
- **Eager/Lazy Loading** : Relations TypeORM optimisées
- **Redis** : Cache des refresh tokens

### 2. Scalabilité Horizontale

- **Stateless API** : JWT permet multi-instances
- **S3** : Stockage distribué
- **Redis** : Session store partagé
- **WebSocket** : Adapter Redis pour multi-serveurs

## Intégrations Externes

### 1. Services Cloud

- **AWS S3** : Stockage de fichiers
- **Stripe** : Paiements en ligne
- **Jitsi** : Visioconférence
- **Google OAuth2** : Authentification sociale

### 2. Services Email

- **SMTP** : Notifications par email
- **Templates** : Emails transactionnels

## Déploiement

### Docker Compose (Dev)

```yaml
services:
  - postgres: Base de données
  - redis: Cache et sessions
  - pgadmin: Administration DB
```

### Production

- **Backend** : Container NestJS
- **Database** : PostgreSQL managed
- **Cache** : Redis managed
- **Storage** : AWS S3
- **CDN** : CloudFront pour assets

## Monitoring & Logs

- **Logs applicatifs** : NestJS Logger
- **Logs d'erreurs** : Exception filters
- **Metrics** : À implémenter (Prometheus/Grafana)
- **APM** : À implémenter (Sentry, DataDog)

## Améliorations Futures

1. **Module Payments** : Intégration Stripe complète avec webhooks
2. **Module Notifications** : WebSocket + Email + Push
3. **WebSocket Gateway** : Temps réel pour messagerie
4. **Tests** : Tests unitaires et E2E
5. **CI/CD** : Pipeline automatisé
6. **Monitoring** : Observabilité complète
7. **Rate Limiting** : Protection anti-abus
8. **Elasticsearch** : Recherche full-text avancée

## Conventions de Code

- **Naming** : kebab-case pour fichiers, PascalCase pour classes
- **DTOs** : class-validator pour validation
- **Services** : Logique métier isolée
- **Controllers** : Minimalistes, délèguent aux services
- **Entities** : TypeORM avec decorators
- **Modules** : Feature-based organization

## Contact & Support

Pour toute question technique, consultez :

- API Documentation: `API_DOCUMENTATION.md`
- README: `README.md`
