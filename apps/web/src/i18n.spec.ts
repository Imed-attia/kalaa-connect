import { test, expect } from 'vitest';
import { TRANSLATIONS } from './i18n';
import { AppLanguage, ReportStatus } from '@kalaa-connect/shared';

test('Les dictionnaires de langues FR et AR contiennent tous les statuts requis', () => {
  const frStatuses = TRANSLATIONS[AppLanguage.FR].status;
  const arStatuses = TRANSLATIONS[AppLanguage.AR].status;

  expect(frStatuses[ReportStatus.NOUVEAU]).toBe('Nouveau');
  expect(arStatuses[ReportStatus.NOUVEAU]).toBe('جديد');

  expect(frStatuses[ReportStatus.RESOLU]).toBe('Résolu');
  expect(arStatuses[ReportStatus.RESOLU]).toBe('تم الحل');

  expect(frStatuses[ReportStatus.CLOTURE]).toBe('Clôturé');
  expect(arStatuses[ReportStatus.CLOTURE]).toBe('مغلق');
});

test('Le formulaire contient les labels nécessaires pour les consignes citoyennes', () => {
  expect(TRANSLATIONS[AppLanguage.FR].form.photoHint).toContain('1 Mo');
  expect(TRANSLATIONS[AppLanguage.AR].form.photoHint).toContain('1 ميغابايت');
});
