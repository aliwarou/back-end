import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { LawyerProfileService } from '../lawyer-profiles/lawyer-profiles.service';
import { AvailabilitiesService } from '../availabilities/availabilities.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { ReviewsService } from '../reviews/reviews.service';
import { faker } from '@faker-js/faker';
import { RoleEnum } from '../iam/authentification/enums/role.enum';
import { AppointmentStatus } from '../appointments/enums/appointment-status.enum';

async function seed() {
  console.log('🌱 Démarrage du seeding...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const lawyerProfileService = app.get(LawyerProfileService);
  const availabilitiesService = app.get(AvailabilitiesService);
  const appointmentsService = app.get(AppointmentsService);
  const reviewsService = app.get(ReviewsService);

  try {
    // ==========================================
    // 1️⃣ CRÉER DES CLIENTS
    // ==========================================
    console.log('👥 Création de 5 clients...');
    const clients = [];
    for (let i = 0; i < 5; i++) {
      const client = await usersService.create({
        name: faker.person.fullName(),
        email: `client${i + 1}@example.com`,
        password: 'Pass123!',
        role: RoleEnum.Client,
      });
      clients.push(client);
      console.log(`   ✅ Client créé: ${client.email}`);
    }

    // ==========================================
    // 2️⃣ CRÉER DES JURISTES
    // ==========================================
    console.log('\n⚖️  Création de 5 juristes...');
    const lawyers = [];
    const specializations = [
      'Droit des affaires',
      'Droit du travail',
      'Droit de la famille',
      'Droit pénal',
      'Droit immobilier',
    ];

    for (let i = 0; i < 5; i++) {
      const lawyer = await usersService.create({
        name: faker.person.fullName(),
        email: `juriste${i + 1}@example.com`,
        password: 'Pass123!',
        role: RoleEnum.Juriste,
      });
      lawyers.push(lawyer);
      console.log(`   ✅ Juriste créé: ${lawyer.email}`);

      // Créer le profil du juriste
      const profile = await lawyerProfileService.create(
        {
          specialization: specializations[i],
          bio: faker.lorem.paragraphs(2),
          hourlyRate: faker.number.int({ min: 80, max: 250 }),
          officeAddress: faker.location.streetAddress(),
          languages: ['Français', 'Anglais'],
          city: faker.location.city(),
          country: 'France',
          barAssociation: 'Barreau de Paris',
          licenseNumber: `P${faker.number.int({ min: 10000, max: 99999 })}`,
          yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
        },
        { sub: lawyer.id, email: lawyer.email, role: lawyer.role },
      );

      // Vérifier le profil (simuler validation admin)
      await lawyerProfileService['lawyerProfileRepository'].update(profile.id, {
        isVerified: true,
        kycVerified: true,
      });

      console.log(`   ✅ Profil créé pour ${lawyer.email}`);
    }

    // ==========================================
    // 3️⃣ CRÉER DES DISPONIBILITÉS
    // ==========================================
    console.log('\n📅 Création de disponibilités...');
    for (const lawyer of lawyers) {
      const profile = await lawyerProfileService.findByUserId(lawyer.id);

      // Créer 3 créneaux pour les 7 prochains jours
      for (let day = 1; day <= 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() + day);

        const availability = await availabilitiesService.create(
          {
            date,
            startTime: '09:00',
            endTime: '12:00',
            isAvailable: true,
          },
          { sub: lawyer.id, email: lawyer.email, role: lawyer.role },
        );

        const availability2 = await availabilitiesService.create(
          {
            date,
            startTime: '14:00',
            endTime: '18:00',
            isAvailable: true,
          },
          { sub: lawyer.id, email: lawyer.email, role: lawyer.role },
        );
      }
      console.log(`   ✅ Disponibilités créées pour ${lawyer.email}`);
    }

    // ==========================================
    // 4️⃣ CRÉER DES RENDEZ-VOUS
    // ==========================================
    console.log('\n🗓️  Création de rendez-vous...');
    for (let i = 0; i < 5; i++) {
      const client = clients[i];
      const lawyer = lawyers[i];
      const profile = await lawyerProfileService.findByUserId(lawyer.id);

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + i + 1);
      scheduledDate.setHours(10, 0, 0, 0);

      const appointment = await appointmentsService.create(
        {
          lawyerProfileId: profile.id,
          scheduledAt: scheduledDate,
          durationMinutes: 60,
          clientNotes: faker.lorem.sentence(),
        },
        { sub: client.id, email: client.email, role: client.role },
      );

      // Accepter les 3 premiers RDV
      if (i < 3) {
        await appointmentsService.updateStatus(
          appointment.id,
          { status: AppointmentStatus.ACCEPTED },
          { sub: lawyer.id, email: lawyer.email, role: lawyer.role },
        );
        console.log(
          `   ✅ RDV créé et accepté: Client ${i + 1} → Juriste ${i + 1}`,
        );
      } else {
        console.log(
          `   ✅ RDV créé (en attente): Client ${i + 1} → Juriste ${i + 1}`,
        );
      }
    }

    // ==========================================
    // 5️⃣ CRÉER DES AVIS
    // ==========================================
    console.log("\n⭐ Création d'avis...");
    for (let i = 0; i < 3; i++) {
      const client = clients[i];
      const lawyer = lawyers[i];
      const profile = await lawyerProfileService.findByUserId(lawyer.id);

      const review = await reviewsService.create(
        {
          lawyerProfileId: profile.id,
          rating: faker.number.int({ min: 4, max: 5 }),
          comment: faker.lorem.paragraph(),
        },
        { sub: client.id, email: client.email, role: client.role },
      );

      console.log(`   ✅ Avis créé par Client ${i + 1} pour Juriste ${i + 1}`);
    }

    // ==========================================
    // 6️⃣ CRÉER UN ADMIN
    // ==========================================
    console.log("\n🛡️  Création d'un compte admin...");
    const admin = await usersService.create({
      name: 'Admin Platform',
      email: 'admin@example.com',
      password: 'Pass123!',
      role: RoleEnum.Admin,
    });
    console.log(`   ✅ Admin créé: ${admin.email}`);

    console.log('\n✅ ==========================================');
    console.log('✅ SEEDING TERMINÉ AVEC SUCCÈS !');
    console.log('✅ ==========================================\n');

    console.log('📊 Résumé des données créées:');
    console.log(`   - 5 Clients (client1@example.com → client5@example.com)`);
    console.log(
      `   - 5 Juristes (juriste1@example.com → juriste5@example.com)`,
    );
    console.log(`   - 5 Profils de juristes vérifiés`);
    console.log(`   - 70 Créneaux de disponibilité`);
    console.log(`   - 5 Rendez-vous (3 acceptés, 2 en attente)`);
    console.log(`   - 3 Avis (4-5 étoiles)`);
    console.log(`   - 1 Admin (admin@example.com)`);
    console.log(`\n🔑 Mot de passe pour tous: Pass123!\n`);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    console.log('👋 Seeding terminé, fermeture...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
