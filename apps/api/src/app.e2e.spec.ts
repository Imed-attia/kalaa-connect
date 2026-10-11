import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './app.module';
import { ReportStatus, UserRole } from '@kalaa-connect/shared';

describe('Kalaa Connect API — Suite de tests End-to-End (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Tests Supervision & Santé
  describe('Supervision & Santé', () => {
    it('GET /api/health retourne le statut ok et les métriques système', async () => {
      const res = await request(app.getHttpServer()).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('kalaa-connect-api');
      expect(res.body.database.status).toBe('connected');
    });

    it('GET /api/metrics retourne un flux textuel au format Prometheus', async () => {
      const res = await request(app.getHttpServer()).get('/api/metrics');
      expect(res.status).toBe(200);
      expect(res.text).toContain('kalaa_reports_total');
      expect(res.text).toContain('kalaa_api_uptime_seconds');
    });
  });

  // 2. Références administratives et catégories
  describe('Données Référentielles', () => {
    it('GET /api/reports/services retourne les 4 services municipaux de Kalâa Seghira', async () => {
      const res = await request(app.getHttpServer()).get('/api/reports/services');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4);
    });

    it('GET /api/reports/categories retourne la liste des catégories bilingues', async () => {
      const res = await request(app.getHttpServer()).get('/api/reports/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(8);
      expect(res.body[0]).toHaveProperty('nom_fr');
      expect(res.body[0]).toHaveProperty('nom_ar');
    });
  });

  // 3. Authentification & Profils
  describe('Authentification & Sessions', () => {
    const testEmail = `citoyen.${Date.now()}@kalaa.tn`;

    it('POST /api/auth/register crée un nouveau compte citoyen avec succès', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          nom: 'Citoyen Test',
          email: testEmail,
          mot_de_passe: 'MotDePasse123!',
          role: UserRole.CITOYEN,
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testEmail);
    });

    it('POST /api/auth/login permet la connexion avec des identifiants valides', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          mot_de_passe: 'MotDePasse123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('GET /api/auth/me avec jeton Bearer retourne le profil connecté', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer test-token-citoyen');

      expect(res.status).toBe(200);
      expect(res.body.nom.toLowerCase()).toBe('nada slama');
    });
  });

  // 4. Parcours Complet : Création, Cycle de vie, Preuve et Clôture
  describe('Cycle de vie complet d’un signalement (Parcours Citoyen $\rightarrow$ Agent $\rightarrow$ Clôture)', () => {
    let createdReportId: string;

    it('1. POST /api/reports crée un incident urbain avec statut NOUVEAU', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/reports')
        .set('Authorization', 'Bearer test-token-citoyen')
        .send({
          titre: 'Nid-de-poule dangereux avenue Habib Bourguiba',
          description: 'Trou profond au milieu de la voie rapide.',
          categorie_id: 'cat-nid-de-poule',
          latitude: 35.8285,
          longitude: 10.564,
          quartier: 'Centre-Ville',
          photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        });

      expect(res.status).toBe(201);
      expect(res.body.statut).toBe(ReportStatus.NOUVEAU);
      expect(res.body.numero_ticket).toBeDefined();
      createdReportId = res.body.id;
    });

    it('2. PATCH /api/reports/:id/status passe le ticket à ACCEPTE par l’agent municipal', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/reports/${createdReportId}/status`)
        .set('Authorization', 'Bearer test-token-agent')
        .send({
          nouveau_statut: ReportStatus.ACCEPTE,
          commentaire: 'Ticket pris en charge par le service voirie',
        });

      expect(res.status).toBe(200);
      expect(res.body.statut).toBe(ReportStatus.ACCEPTE);
    });

    it('3. PATCH /api/reports/:id/status passe le ticket à EN_COURS', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/reports/${createdReportId}/status`)
        .set('Authorization', 'Bearer test-token-agent')
        .send({
          nouveau_statut: ReportStatus.EN_COURS,
        });

      expect(res.status).toBe(200);
      expect(res.body.statut).toBe(ReportStatus.EN_COURS);
    });

    it('4. Refuse la transition vers RESOLU si la photo de preuve est absente', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/reports/${createdReportId}/status`)
        .set('Authorization', 'Bearer test-token-agent')
        .send({
          nouveau_statut: ReportStatus.RESOLU,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('photo de preuve');
    });

    it('5. Valide la résolution vers RESOLU quand la photo de preuve est fournie', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/reports/${createdReportId}/status`)
        .set('Authorization', 'Bearer test-token-agent')
        .send({
          nouveau_statut: ReportStatus.RESOLU,
          photo_preuve_url: 'https://storage.kalaa.tn/preuve-reparation-voirie.jpg',
        });

      expect(res.status).toBe(200);
      expect(res.body.statut).toBe(ReportStatus.RESOLU);
      expect(res.body.photo_preuve_url).toBe('https://storage.kalaa.tn/preuve-reparation-voirie.jpg');
    });

    it('6. Le citoyen confirme et clôture le ticket (CLOTURE)', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/reports/${createdReportId}/status`)
        .set('Authorization', 'Bearer test-token-citoyen')
        .send({
          nouveau_statut: ReportStatus.CLOTURE,
          commentaire: 'Réparation constatée sur place, merci aux équipes municipales.',
        });

      expect(res.status).toBe(200);
      expect(res.body.statut).toBe(ReportStatus.CLOTURE);
    });

    it('7. GET /api/reports/:id retourne les détails complets et l’audit d’historique', async () => {
      const res = await request(app.getHttpServer()).get(`/api/reports/${createdReportId}`);
      expect(res.status).toBe(200);
      expect(res.body.report.statut).toBe(ReportStatus.CLOTURE);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeGreaterThanOrEqual(4); // Nouveau -> Accepté -> En cours -> Résolu -> Clôturé
    });
  });

  // 5. Statistiques Open Data & Export CSV
  describe('Open Data & Transparence', () => {
    it('GET /api/stats retourne les indicateurs agrégés sans aucune donnée personnelle', async () => {
      const res = await request(app.getHttpServer()).get('/api/stats');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total_signalements');
      expect(res.body).toHaveProperty('delai_moyen_resolution_heures');
      expect(res.body).toHaveProperty('repartition_quartiers');
      expect(res.body).not.toHaveProperty('email');
      expect(res.body).not.toHaveProperty('nom');
    });

    it('GET /api/open-data/export.csv retourne un fichier CSV téléchargeable valide', async () => {
      const res = await request(app.getHttpServer()).get('/api/open-data/export.csv');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('numero_ticket,titre,categorie_id,statut');
    });
  });
});
