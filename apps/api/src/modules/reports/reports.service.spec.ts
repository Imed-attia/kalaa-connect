import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { DatabaseService } from '../../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ReportStatus, UserRole, AppLanguage, User } from '@kalaa-connect/shared';
import { BadRequestException } from '@nestjs/common';

describe('ReportsService', () => {
  let service: ReportsService;
  let db: DatabaseService;

  const mockUserCitoyen: User = {
    id: 'usr-citoyen-imed',
    nom: 'Imed Attia',
    email: 'imedattia1032@gmail.com',
    role: UserRole.CITOYEN,
    langue: AppLanguage.FR,
    cree_le: new Date().toISOString(),
  };

  const mockUserAgent: User = {
    id: 'usr-agent-voirie',
    nom: 'Ahmed Ben Salah',
    email: 'agent@kalaa.tn',
    role: UserRole.AGENT,
    langue: AppLanguage.FR,
    service_id: 'srv-voirie',
    cree_le: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        DatabaseService,
        {
          provide: NotificationsService,
          useValue: {
            sendBilingualNotification: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    db = module.get<DatabaseService>(DatabaseService);
    db.onModuleInit();
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it('doit créer un nouveau signalement avec le statut NOUVEAU et attribuer un numéro de ticket', async () => {
    const report = await service.createReport(
      {
        titre: 'Nid-de-poule test',
        description: 'Test description',
        categorie_id: 'cat-nid-de-poule',
        latitude: 35.8285,
        longitude: 10.564,
        photo_url: 'https://test.tn/photo.jpg',
      },
      mockUserCitoyen,
    );

    expect(report).toBeDefined();
    expect(report.statut).toBe(ReportStatus.NOUVEAU);
    expect(report.numero_ticket).toMatch(/^KC-202[0-9]-[0-9]{4}$/);
  });

  it('doit permettre le passage de NOUVEAU à ACCEPTE par un agent municipal', async () => {
    const report = await service.createReport(
      {
        titre: 'Signalement à accepter',
        description: 'Description',
        categorie_id: 'cat-nid-de-poule',
        latitude: 35.8285,
        longitude: 10.564,
        photo_url: 'https://test.tn/photo.jpg',
      },
      mockUserCitoyen,
    );

    const updated = await service.updateStatus(
      report.id,
      {
        nouveau_statut: ReportStatus.ACCEPTE,
        agent_id: mockUserAgent.id,
      },
      mockUserAgent,
    );

    expect(updated.statut).toBe(ReportStatus.ACCEPTE);
    expect(updated.agent_id).toBe(mockUserAgent.id);
  });

  it('doit refuser la résolution si la photo de preuve est absente', async () => {
    const report = await service.createReport(
      {
        titre: 'Signalement en cours',
        description: 'Description',
        categorie_id: 'cat-nid-de-poule',
        latitude: 35.8285,
        longitude: 10.564,
        photo_url: 'https://test.tn/photo.jpg',
      },
      mockUserCitoyen,
    );

    // Passage à Accepté puis En cours
    await service.updateStatus(report.id, { nouveau_statut: ReportStatus.ACCEPTE }, mockUserAgent);
    await service.updateStatus(report.id, { nouveau_statut: ReportStatus.EN_COURS }, mockUserAgent);

    // Tentative de résolution sans photo de preuve
    await expect(
      service.updateStatus(
        report.id,
        {
          nouveau_statut: ReportStatus.RESOLU,
          photo_preuve_url: '',
        },
        mockUserAgent,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('doit accepter la résolution si la photo de preuve est fournie', async () => {
    const report = await service.createReport(
      {
        titre: 'Signalement prêt à résoudre',
        description: 'Description',
        categorie_id: 'cat-nid-de-poule',
        latitude: 35.8285,
        longitude: 10.564,
        photo_url: 'https://test.tn/photo.jpg',
      },
      mockUserCitoyen,
    );

    await service.updateStatus(report.id, { nouveau_statut: ReportStatus.ACCEPTE }, mockUserAgent);
    await service.updateStatus(report.id, { nouveau_statut: ReportStatus.EN_COURS }, mockUserAgent);

    const resolu = await service.updateStatus(
      report.id,
      {
        nouveau_statut: ReportStatus.RESOLU,
        photo_preuve_url: 'https://storage.tn/preuve.jpg',
      },
      mockUserAgent,
    );

    expect(resolu.statut).toBe(ReportStatus.RESOLU);
    expect(resolu.photo_preuve_url).toBe('https://storage.tn/preuve.jpg');
  });

  it('doit refuser une transition illégale (ex: NOUVEAU -> RESOLU sans étapes intermédiaires)', async () => {
    const report = await service.createReport(
      {
        titre: 'Test saut d’étape',
        description: 'Description',
        categorie_id: 'cat-nid-de-poule',
        latitude: 35.8285,
        longitude: 10.564,
        photo_url: 'https://test.tn/photo.jpg',
      },
      mockUserCitoyen,
    );

    await expect(
      service.updateStatus(
        report.id,
        {
          nouveau_statut: ReportStatus.RESOLU,
          photo_preuve_url: 'https://photo.tn/p.jpg',
        },
        mockUserAgent,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
