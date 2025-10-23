import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Plateforme de Consultation Juridique')
    .setDescription(
      'API REST pour la gestion de consultations juridiques en ligne. ' +
        'Permet aux clients de trouver des juristes, réserver des consultations, ' +
        'communiquer et gérer les paiements.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre token JWT',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentification et inscription')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Lawyer Profiles', 'Profils des juristes')
    .addTag('Availabilities', 'Disponibilités des juristes')
    .addTag('Appointments', 'Gestion des rendez-vous')
    .addTag('Consultations', 'Consultations vidéo/texte')
    .addTag('Reviews', 'Avis et évaluations')
    .addTag('Conversations', 'Conversations entre clients et juristes')
    .addTag('Messages', 'Messages dans les conversations')
    .addTag('Documents', 'Gestion des documents (S3)')
    .addTag('Payments', 'Paiements et facturation (Stripe)')
    .addTag('Admin', 'Administration de la plateforme')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`\n🚀 Application démarrée sur le port ${port}`);
  console.log(
    `📚 Documentation Swagger disponible sur: http://localhost:${port}/api\n`,
  );
}
bootstrap();
