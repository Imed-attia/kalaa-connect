import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { StructuredLoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Chargement des variables d'environnement (.env racine ou local)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Préfixe global
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Journalisation structurée
  app.useGlobalInterceptors(new StructuredLoggingInterceptor());

  // Configuration Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Kalaa Connect API')
    .setDescription(
      'Documentation officielle de l’API de signalement citoyen — Municipalité de Kalâa Seghira (Tunisie). Conforme au projet de stage ingénieur ESPRIT.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentification', 'Gestion des comptes et sessions JWT')
    .addTag('Signalements Urbains', 'Gestion des tickets d’incidents et cycle de vie')
    .addTag('Téléversement Photos', 'Upload sécurisé avec suppression EXIF')
    .addTag('Intelligence Artificielle', 'Classification assistée par Google Gemini')
    .addTag('Open Data & Statistiques Publiques', 'Données ouvertes anonymisées sans PII')
    .addTag('Supervision & Santé', 'Contrôles de santé et métriques Grafana')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Kalaa Connect API démarrée sur http://localhost:${port}/api`);
  logger.log(`📚 Documentation Swagger accessible sur http://localhost:${port}/api/docs`);
}

bootstrap();
