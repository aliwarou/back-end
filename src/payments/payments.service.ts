import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
// import Stripe from 'stripe';

/**
 * Service de gestion des paiements Stripe
 *
 * TODO: À implémenter complètement
 *
 * Fonctionnalités à ajouter :
 * 1. Créer Payment Intent Stripe
 * 2. Confirmer paiement
 * 3. Gérer webhooks Stripe
 * 4. Remboursements
 * 5. Génération de factures
 * 6. Calcul des commissions plateforme
 */
@Injectable()
export class PaymentsService {
  // private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    // TODO: Initialiser Stripe
    // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    //   apiVersion: '2023-10-16',
    // });
  }

  /**
   * Créer un Payment Intent Stripe
   */
  async createPaymentIntent(_appointmentId: number, _userId: number) {
    // TODO: Implémenter
    // 1. Récupérer l'appointment
    // 2. Calculer montant + commission
    // 3. Créer Payment Intent Stripe
    // 4. Enregistrer en base
    throw new Error('À implémenter');
  }

  /**
   * Confirmer un paiement (appelé par webhook Stripe)
   */
  async confirmPayment(_stripePaymentIntentId: string) {
    // TODO: Implémenter
    // 1. Récupérer le payment
    // 2. Mettre à jour status = SUCCEEDED
    // 3. Mettre à jour appointment.isPaid = true
    // 4. Générer facture
    throw new Error('À implémenter');
  }

  /**
   * Gérer les webhooks Stripe
   */
  async handleStripeWebhook(_event: any) {
    // TODO: Implémenter
    // Gérer les événements:
    // - payment_intent.succeeded
    // - payment_intent.payment_failed
    // - charge.refunded
    throw new Error('À implémenter');
  }

  /**
   * Rembourser un paiement
   */
  async refundPayment(_paymentId: number, _reason: string) {
    // TODO: Implémenter
    // 1. Créer refund Stripe
    // 2. Mettre à jour payment.status = REFUNDED
    throw new Error('À implémenter');
  }

  /**
   * Récupérer l'historique des paiements d'un utilisateur
   */
  async findByUser(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { clientId: userId },
      relations: { appointment: true },
      order: { createdAt: 'DESC' },
    });
  }
}
