import { Test, TestingModule } from '@nestjs/testing';
import { AiClassificationService } from './ai.service';
import { DatabaseService } from '../../database/database.service';

describe('AiClassificationService', () => {
  let service: AiClassificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiClassificationService, DatabaseService],
    }).compile();

    service = module.get<AiClassificationService>(AiClassificationService);
  });

  it('doit être défini', () => {
    expect(service).toBeDefined();
  });

  it('doit utiliser la solution de repli (choix citoyen) lorsque la clé API est absente', async () => {
    const result = await service.classifyPhoto('https://test.tn/photo.jpg', 'cat-nid-de-poule');

    expect(result).toBeDefined();
    expect(result.categorie_proposee_id).toBe('cat-nid-de-poule');
    expect(result.score_confiance).toBeGreaterThan(0.6);
  });

  it('doit calculer le taux de bonne classification sur un dataset de test', () => {
    const sampleDataset = [
      { expectedCategoryId: 'cat-nid-de-poule', predictedCategoryId: 'cat-nid-de-poule' },
      { expectedCategoryId: 'cat-nid-de-poule', predictedCategoryId: 'cat-nid-de-poule' },
      { expectedCategoryId: 'cat-reverbere-eteint', predictedCategoryId: 'cat-reverbere-eteint' },
      { expectedCategoryId: 'cat-depot-sauvage', predictedCategoryId: 'cat-depot-sauvage' },
      { expectedCategoryId: 'cat-arbre-dangereux', predictedCategoryId: 'cat-trottoir-endommage' }, // erreur
    ];

    const evaluation = service.evaluateAccuracy(sampleDataset);
    expect(evaluation.total).toBe(5);
    expect(evaluation.correct).toBe(4);
    expect(evaluation.accuracyPercent).toBe(80);
  });
});
