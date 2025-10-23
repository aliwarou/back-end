import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Auth } from 'src/iam/authentification/decorators/auth.decorator';
import { AuthType } from 'src/iam/authentification/enums/auth-type.enum';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user.interface';

/**
 * Contrôleur des paiements
 *
 * TODO: À compléter avec toutes les routes nécessaires
 */
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Créer un Payment Intent pour un rendez-vous
   * TODO: À implémenter
   */
  @Auth(AuthType.Bearer)
  @Post('create-intent/:appointmentId')
  createPaymentIntent(
    @Param('appointmentId', ParseIntPipe) appointmentId: number,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    return this.paymentsService.createPaymentIntent(
      appointmentId,
      activeUser.sub,
    );
  }

  /**
   * Webhook Stripe
   * TODO: À implémenter avec vérification signature
   */
  @Auth(AuthType.None)
  @Post('webhook')
  handleWebhook(@Body() body: any) {
    return this.paymentsService.handleStripeWebhook(body);
  }

  /**
   * Historique des paiements
   */
  @Auth(AuthType.Bearer)
  @Get('my-payments')
  findMyPayments(@ActiveUser() activeUser: ActiveUserData) {
    return this.paymentsService.findByUser(activeUser.sub);
  }
}
