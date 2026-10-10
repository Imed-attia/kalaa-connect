/**
 * Rôles utilisateurs du système Kalaa Connect
 */
export enum UserRole {
  CITOYEN = 'citoyen',
  AGENT = 'agent',
  ADMIN = 'admin',
}

/**
 * Langues supportées par l'application (Français et Arabe bilingue avec RTL)
 */
export enum AppLanguage {
  FR = 'fr',
  AR = 'ar',
}

/**
 * Statuts possibles d'un signalement dans le cycle de vie
 */
export enum ReportStatus {
  NOUVEAU = 'nouveau',
  ACCEPTE = 'accepte',
  EN_COURS = 'en_cours',
  RESOLU = 'resolu',
  CLOTURE = 'cloture',
  REJETE = 'rejete',
  DOUBLON = 'doublon',
}

/**
 * Niveau de priorité d'un signalement
 */
export enum ReportPriority {
  BASSE = 'basse',
  NORMALE = 'normale',
  HAUTE = 'haute',
  URGENTE = 'urgente',
}

/**
 * Services municipaux de Kalâa Seghira
 */
export enum MunicipalServiceCode {
  VOIRIE = 'voirie',
  ECLAIRAGE = 'eclairage',
  PROPRETE = 'proprete',
  ESPACES_VERTS = 'espaces_verts',
}
