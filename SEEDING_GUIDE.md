# 🌱 Guide de Seeding - Données de Test

## ✅ Données créées

### 👥 **Clients** (5)

- `client1@example.com` - Wilma Sporer
- `client2@example.com` - Matthew Blanda PhD
- `client3@example.com` - Vanessa Hilpert
- `client4@example.com` - Jennie Mayert
- `client5@example.com` - Oscar Abernathy

### ⚖️ **Juristes** (5)

- `juriste1@example.com` - Droit des affaires
- `juriste2@example.com` - Droit du travail
- `juriste3@example.com` - Droit de la famille
- `juriste4@example.com` - Droit pénal
- `juriste5@example.com` - Droit immobilier

### 🛡️ **Administrateur** (1)

- `admin@example.com`

**🔑 Mot de passe pour tous les comptes : `Pass123!`**

---

## 📊 Statistiques

- ✅ 5 Profils de juristes vérifiés
- ✅ 70 Créneaux de disponibilité (7 jours × 2 créneaux × 5 juristes)
- ✅ 5 Rendez-vous :
  - 3 acceptés (clients 1, 2, 3)
  - 2 en attente (clients 4, 5)
- ✅ 3 Avis (4-5 étoiles)

---

## 🚀 Commandes disponibles

### Lancer le seeding

```bash
npm run seed
```

### Réinitialiser complètement la base de données + seeding

```bash
npm run db:reset
```

---

## 🧪 Scénarios de test

### 1️⃣ **Test du parcours client**

```bash
# 1. Se connecter en tant que client
POST /auth/sign-in
{
  "email": "client1@example.com",
  "password": "Pass123!"
}

# 2. Rechercher un juriste
GET /lawyer-profiles/search?specialization=Droit des affaires

# 3. Voir les disponibilités d'un juriste
GET /availabilities/lawyer/:lawyerProfileId

# 4. Réserver un rendez-vous
POST /appointments
{
  "lawyerProfileId": 1,
  "scheduledAt": "2025-10-28T10:00:00Z",
  "durationMinutes": 60
}

# 5. Voir mes rendez-vous
GET /appointments/my-appointments

# 6. Laisser un avis
POST /reviews
{
  "lawyerProfileId": 1,
  "rating": 5,
  "comment": "Excellent juriste !"
}
```

### 2️⃣ **Test du parcours juriste**

```bash
# 1. Se connecter en tant que juriste
POST /auth/sign-in
{
  "email": "juriste1@example.com",
  "password": "Pass123!"
}

# 2. Voir mes disponibilités
GET /availabilities/my-availabilities

# 3. Ajouter un créneau
POST /availabilities
{
  "date": "2025-10-30",
  "startTime": "09:00",
  "endTime": "17:00"
}

# 4. Voir mes rendez-vous
GET /appointments/my-appointments

# 5. Accepter un rendez-vous
PATCH /appointments/:id/status
{
  "status": "accepted"
}

# 6. Répondre à un avis
PATCH /reviews/:id/respond
{
  "lawyerResponse": "Merci pour votre retour !"
}
```

### 3️⃣ **Test du panneau admin**

```bash
# 1. Se connecter en tant qu'admin
POST /auth/sign-in
{
  "email": "admin@example.com",
  "password": "Pass123!"
}

# 2. Voir les statistiques
GET /admin/stats

# 3. Voir les juristes en attente de vérification
GET /admin/lawyers/pending-verification

# 4. Vérifier un juriste
PATCH /admin/lawyers/:id/verify
{
  "isVerified": true,
  "kycVerified": true
}

# 5. Suspendre un utilisateur
PATCH /admin/users/:id/suspend
{
  "isActive": false,
  "reason": "Comportement inapproprié"
}

# 6. Modérer un avis
PATCH /admin/reviews/:id/moderate
{
  "isPublished": false
}
```

---

## 🔍 Tester dans Swagger

1. Ouvrez **http://localhost:3000/api**
2. Cliquez sur **Auth → POST /auth/sign-in**
3. Essayez avec `client1@example.com` / `Pass123!`
4. Copiez le `accessToken` de la réponse
5. Cliquez sur **🔓 Authorize** en haut
6. Collez le token et validez
7. Explorez tous les endpoints ! 🎊

---

## 📝 Notes

- Les disponibilités sont créées pour les **7 prochains jours**
- Les rendez-vous sont planifiés dans le **futur** (à partir de demain)
- Les juristes ont des tarifs entre **80€ et 250€ de l'heure**
- Tous les profils de juristes sont **déjà vérifiés**
- Les avis ont des notes entre **4 et 5 étoiles**

---

## ⚠️ Attention

La commande `npm run db:reset` **supprime toutes les données** de la base. Utilisez-la avec précaution !
