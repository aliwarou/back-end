# Guide d'Implémentation des Modules Restants

Ce document fournit un guide détaillé pour implémenter les modules qui ont été créés avec une structure de base mais nécessitent une implémentation complète.

## 🔴 Modules À Implémenter

### 1. Module Payments (Stripe)

**Statut**: Structure de base créée  
**Priorité**: Haute  
**Dépendance**: `stripe` (déjà installé)

#### Étapes d'implémentation:

1. **Configuration Stripe**

```typescript
// Dans payments.service.ts
import Stripe from 'stripe';

constructor() {
  this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}
```

2. **Créer Payment Intent**

```typescript
async createPaymentIntent(appointmentId: number, userId: number) {
  const appointment = await this.appointmentRepository.findOne({
    where: { id: appointmentId },
    relations: { lawyerProfile: true },
  });

  const amount = appointment.amount;
  const platformFee = amount * 0.15; // 15% commission

  const paymentIntent = await this.stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // En centimes
    currency: 'eur',
    metadata: {
      appointmentId: appointmentId.toString(),
      userId: userId.toString(),
    },
  });

  const payment = this.paymentRepository.create({
    clientId: userId,
    appointmentId,
    amount,
    platformFee,
    currency: 'EUR',
    stripePaymentIntentId: paymentIntent.id,
  });

  return this.paymentRepository.save(payment);
}
```

3. **Gérer les Webhooks**

```typescript
@Post('webhook')
@RawBody() // Besoin du body brut pour signature
async handleWebhook(@Req() request: Request) {
  const sig = request.headers['stripe-signature'];

  let event;
  try {
    event = this.stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    throw new BadRequestException('Webhook signature invalid');
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.confirmPayment(event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      await this.handlePaymentFailed(event.data.object.id);
      break;
  }

  return { received: true };
}
```

4. **Remboursements**

```typescript
async refundPayment(paymentId: number, reason: string) {
  const payment = await this.paymentRepository.findOneBy({ id: paymentId });

  const refund = await this.stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId,
    reason: 'requested_by_customer',
  });

  payment.status = PaymentStatus.REFUNDED;
  payment.refundedAt = new Date();
  payment.refundReason = reason;

  return this.paymentRepository.save(payment);
}
```

#### Endpoints à implémenter:

- `POST /payments/create-intent/:appointmentId`
- `POST /payments/webhook` (Stripe)
- `GET /payments/my-payments`
- `POST /payments/:id/refund`
- `GET /payments/admin/all` (Admin)

---

### 2. Module Notifications

**Statut**: Non créé  
**Priorité**: Haute  
**Dépendances**: `@nestjs/websockets`, `socket.io`, `nodemailer`

#### Installation:

```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install nodemailer @types/nodemailer
```

#### Structure:

```
src/notifications/
├── notifications.module.ts
├── notifications.service.ts
├── notifications.controller.ts
├── notifications.gateway.ts    # WebSocket
├── email.service.ts            # Service email
├── entities/
│   └── notification.entity.ts
├── dto/
│   ├── create-notification.dto.ts
│   └── notification-settings.dto.ts
└── enums/
    └── notification-type.enum.ts
```

#### Entité Notification:

```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType; // NEW_MESSAGE, APPOINTMENT_ACCEPTED, etc.

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  relatedEntityType: string;

  @Column({ nullable: true })
  relatedEntityId: number;

  @Column({ nullable: true })
  actionUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### WebSocket Gateway:

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() userId: number) {
    client.join(`user-${userId}`);
  }

  sendNotification(userId: number, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }
}
```

#### Service Email:

```typescript
@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  }

  async sendAppointmentConfirmation(user: User, appointment: Appointment) {
    const html = `
      <h1>Rendez-vous confirmé</h1>
      <p>Bonjour ${user.name},</p>
      <p>Votre rendez-vous du ${appointment.scheduledAt} est confirmé.</p>
      <a href="${process.env.FRONTEND_URL}/consultations/${appointment.id}">
        Accéder à la consultation
      </a>
    `;
    await this.sendEmail(user.email, 'Rendez-vous confirmé', html);
  }
}
```

#### Types de notifications:

```typescript
export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  APPOINTMENT_REQUESTED = 'APPOINTMENT_REQUESTED',
  APPOINTMENT_ACCEPTED = 'APPOINTMENT_ACCEPTED',
  APPOINTMENT_REJECTED = 'APPOINTMENT_REJECTED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  NEW_REVIEW = 'NEW_REVIEW',
  REVIEW_RESPONSE = 'REVIEW_RESPONSE',
  DOCUMENT_SHARED = 'DOCUMENT_SHARED',
  PROFILE_VERIFIED = 'PROFILE_VERIFIED',
  ADMIN_MESSAGE = 'ADMIN_MESSAGE',
}
```

---

### 3. WebSocket pour Messagerie

**Intégrer WebSocket dans le module Messages existant**

#### Mise à jour du module Messages:

```typescript
// messages.gateway.ts (nouveau fichier)
@WebSocketGateway({
  namespace: '/messages',
  cors: { origin: '*' },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody() data: { conversationId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Extraire user du token
    const token = client.handshake.auth.token;
    const user = await this.jwtService.verify(token);

    // Créer le message
    const message = await this.messagesService.create(
      {
        conversationId: data.conversationId,
        content: data.content,
      },
      { sub: user.sub, role: user.role },
    );

    // Émettre aux participants
    this.server
      .to(`conversation-${data.conversationId}`)
      .emit('new-message', message);
  }

  @SubscribeMessage('join-conversation')
  handleJoinConversation(
    @MessageBody() conversationId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation-${conversationId}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { conversationId: number; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`conversation-${data.conversationId}`).emit('user-typing', data);
  }
}
```

#### Mise à jour du module Messages:

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation]),
    ConversationsModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  exports: [MessagesService],
})
export class MessagesModule {}
```

---

## 🔵 Intégrations à Effectuer

### Connecter Notifications aux événements

Dans chaque module, ajouter des appels au service de notifications:

**Exemple dans AppointmentsService:**

```typescript
constructor(
  private notificationsService: NotificationsService,
) {}

async updateStatus(id: number, updateDto: UpdateAppointmentStatusDto, activeUser: ActiveUserData) {
  // ... logique existante ...

  if (appointment.status === AppointmentStatus.ACCEPTED) {
    // Notifier le client
    await this.notificationsService.create({
      userId: appointment.clientId,
      type: NotificationType.APPOINTMENT_ACCEPTED,
      title: 'Rendez-vous accepté',
      message: `Votre rendez-vous a été accepté par le juriste.`,
      relatedEntityType: 'appointment',
      relatedEntityId: appointment.id,
    });

    // Envoyer email
    await this.emailService.sendAppointmentConfirmation(...);
  }

  return appointment;
}
```

---

## 📋 Checklist d'implémentation

### Module Payments

- [ ] Initialiser Stripe client
- [ ] Implémenter createPaymentIntent
- [ ] Implémenter handleStripeWebhook
- [ ] Implémenter confirmPayment
- [ ] Implémenter refundPayment
- [ ] Configurer Stripe CLI pour webhooks locaux
- [ ] Créer templates de factures
- [ ] Tests E2E avec Stripe test mode

### Module Notifications

- [ ] Créer entité Notification
- [ ] Créer NotificationsGateway (WebSocket)
- [ ] Créer EmailService
- [ ] Créer templates d'emails
- [ ] Implémenter les 12 types de notifications
- [ ] Ajouter préférences utilisateur
- [ ] Implémenter marquage comme lu
- [ ] Tests WebSocket

### WebSocket Messagerie

- [ ] Créer MessagesGateway
- [ ] Implémenter send-message
- [ ] Implémenter typing indicator
- [ ] Implémenter online/offline status
- [ ] Implémenter read receipts en temps réel
- [ ] Tests WebSocket

### Intégrations

- [ ] Connecter Appointments → Notifications
- [ ] Connecter Payments → Notifications
- [ ] Connecter Messages → Notifications
- [ ] Connecter Reviews → Notifications
- [ ] Ajouter cron jobs pour rappels

---

## 🧪 Tests

Pour chaque module, créer:

- Tests unitaires (`.spec.ts`)
- Tests E2E (`test/e2e/`)
- Tests d'intégration pour webhooks
- Tests WebSocket

---

## 📚 Ressources

- [Stripe Documentation](https://stripe.com/docs/api)
- [NestJS WebSocket](https://docs.nestjs.com/websockets/gateways)
- [Nodemailer](https://nodemailer.com/)
- [Socket.io](https://socket.io/docs/v4/)

---

## ⚠️ Important

Avant de déployer en production:

1. Configurer les webhooks Stripe en production
2. Tester tous les flux de paiement
3. Configurer SMTP production
4. Tester les notifications dans différents scénarios
5. Implémenter rate limiting sur WebSocket
6. Ajouter monitoring (Sentry, DataDog)
7. Configurer Redis adapter pour Socket.io multi-serveurs
