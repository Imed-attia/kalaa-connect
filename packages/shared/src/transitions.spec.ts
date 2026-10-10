import test from 'node:test';
import assert from 'node:assert';
import { validateStatusTransition } from './transitions';
import { ReportStatus, UserRole } from './enums';

test('Transition Nouveau -> Accepte est autorisée pour un agent', () => {
  const result = validateStatusTransition({
    currentStatus: ReportStatus.NOUVEAU,
    targetStatus: ReportStatus.ACCEPTE,
    userRole: UserRole.AGENT,
  });
  assert.strictEqual(result.valid, true);
});

test('Transition Nouveau -> Resolu est INTERDITE (étape sautée)', () => {
  const result = validateStatusTransition({
    currentStatus: ReportStatus.NOUVEAU,
    targetStatus: ReportStatus.RESOLU,
    userRole: UserRole.AGENT,
  });
  assert.strictEqual(result.valid, false);
});

test('Transition En cours -> Resolu sans photo de preuve doit échouer', () => {
  const result = validateStatusTransition({
    currentStatus: ReportStatus.EN_COURS,
    targetStatus: ReportStatus.RESOLU,
    userRole: UserRole.AGENT,
    photoPreuveUrl: '',
  });
  assert.strictEqual(result.valid, false);
  assert.match(result.error || '', /photo de preuve/i);
});

test('Transition En cours -> Resolu avec photo de preuve est acceptée', () => {
  const result = validateStatusTransition({
    currentStatus: ReportStatus.EN_COURS,
    targetStatus: ReportStatus.RESOLU,
    userRole: UserRole.AGENT,
    photoPreuveUrl: 'https://storage.kalaa.tn/preuve123.jpg',
  });
  assert.strictEqual(result.valid, true);
});

test('Transition vers Rejeté sans motif doit échouer', () => {
  const result = validateStatusTransition({
    currentStatus: ReportStatus.NOUVEAU,
    targetStatus: ReportStatus.REJETE,
    userRole: UserRole.AGENT,
    motifRejetOuDoublon: '',
  });
  assert.strictEqual(result.valid, false);
});

test('Un citoyen ne peut pas passer un ticket en cours à résolu', () => {
  const result = validateStatusTransition({
    currentStatus: ReportStatus.EN_COURS,
    targetStatus: ReportStatus.RESOLU,
    userRole: UserRole.CITOYEN,
    photoPreuveUrl: 'https://test.tn/p.jpg',
  });
  assert.strictEqual(result.valid, false);
});
