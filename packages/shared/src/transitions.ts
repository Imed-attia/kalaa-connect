import { ReportStatus, UserRole } from './enums';

/**
 * Matrice des transitions autorisées dans le cycle de vie Kalaa Connect
 * Conformité stricte avec la section 3 du plan de stage
 */
export const ALLOWED_TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  [ReportStatus.NOUVEAU]: [
    ReportStatus.ACCEPTE,
    ReportStatus.REJETE,
    ReportStatus.DOUBLON,
  ],
  [ReportStatus.ACCEPTE]: [
    ReportStatus.EN_COURS,
    ReportStatus.REJETE,
    ReportStatus.DOUBLON,
  ],
  [ReportStatus.EN_COURS]: [
    ReportStatus.RESOLU,
  ],
  [ReportStatus.RESOLU]: [
    ReportStatus.CLOTURE,
    ReportStatus.EN_COURS, // Réouverture si rejeté par le citoyen lors de la confirmation
  ],
  [ReportStatus.CLOTURE]: [], // Statut terminal
  [ReportStatus.REJETE]: [],  // Statut terminal
  [ReportStatus.DOUBLON]: [], // Statut terminal
};

export interface TransitionValidationOptions {
  currentStatus: ReportStatus;
  targetStatus: ReportStatus;
  userRole: UserRole;
  photoPreuveUrl?: string | null;
  motifRejetOuDoublon?: string | null;
}

export interface TransitionValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Vérifie si une transition de statut est valide selon les règles métier et les rôles
 */
export function validateStatusTransition(options: TransitionValidationOptions): TransitionValidationResult {
  const { currentStatus, targetStatus, userRole, photoPreuveUrl, motifRejetOuDoublon } = options;

  // 1. Vérification de la transition d'état permise
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Transition invalide : impossible de passer du statut '${currentStatus}' à '${targetStatus}'.`,
    };
  }

  // 2. Vérification des permissions par rôle
  if (userRole === UserRole.CITOYEN) {
    // Un citoyen ne peut que clôturer un ticket déjà résolu (ou le contester pour repasser en cours)
    if (currentStatus !== ReportStatus.RESOLU || (targetStatus !== ReportStatus.CLOTURE && targetStatus !== ReportStatus.EN_COURS)) {
      return {
        valid: false,
        error: `Permission refusée : un citoyen ne peut intervenir que pour confirmer la clôture d'un ticket résolu.`,
      };
    }
  }

  // 3. Règle stricte : la résolution requiert obligatoirement une photo de preuve
  if (targetStatus === ReportStatus.RESOLU) {
    if (!photoPreuveUrl || photoPreuveUrl.trim().length === 0) {
      return {
        valid: false,
        error: `Règle de validation : une photo de preuve est obligatoire pour marquer un signalement comme résolu.`,
      };
    }
  }

  // 4. Règle stricte : le rejet ou marquage comme doublon requiert un motif explicite
  if (targetStatus === ReportStatus.REJETE || targetStatus === ReportStatus.DOUBLON) {
    if (!motifRejetOuDoublon || motifRejetOuDoublon.trim().length < 5) {
      return {
        valid: false,
        error: `Règle de validation : un motif détaillé (au moins 5 caractères) est obligatoire en cas de rejet ou de doublon.`,
      };
    }
  }

  return { valid: true };
}
