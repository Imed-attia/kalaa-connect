import { UserRole, AppLanguage, ReportStatus, ReportPriority } from './enums';

/**
 * Utilisateur de la plateforme
 */
export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  langue: AppLanguage;
  service_id?: string | null;
  telephone?: string | null;
  cree_le: string;
}

/**
 * Service technique municipal
 */
export interface MunicipalService {
  id: string;
  code: string;
  nom: string;
  nom_ar: string;
  description?: string;
  actif: boolean;
}

/**
 * Catégorie d'anomalie urbaine rattachée à un service
 */
export interface ReportCategory {
  id: string;
  nom_fr: string;
  nom_ar: string;
  service_id: string;
  icone?: string;
  couleur?: string;
  delai_moyen_jours?: number;
}

/**
 * Signalement citoyen (Ticket d'incident)
 */
export interface Report {
  id: string;
  numero_ticket: string; // Ex: KC-2026-0042
  titre: string;
  description: string;
  categorie_id: string;
  categorie?: ReportCategory;
  service_id?: string;
  service?: MunicipalService;
  latitude: number;
  longitude: number;
  adresse_approximative?: string;
  quartier?: string;
  photo_url: string;
  statut: ReportStatus;
  priorite: ReportPriority;
  auteur_id: string;
  auteur?: Pick<User, 'id' | 'nom' | 'email'>;
  agent_id?: string | null;
  agent?: Pick<User, 'id' | 'nom' | 'email'>;
  photo_preuve_url?: string | null;
  motif_rejet_ou_doublon?: string | null;
  ticket_origine_id?: string | null;
  cree_le: string;
  mis_a_jour_le: string;
}

/**
 * Entrée d'audit pour l'historique des changements de statut
 */
export interface StatusHistory {
  id: string;
  signalement_id: string;
  ancien_statut: ReportStatus | null;
  nouveau_statut: ReportStatus;
  acteur_id: string;
  acteur_nom?: string;
  commentaire?: string;
  photo_preuve_url?: string;
  date: string;
}

/**
 * Commentaire interne ou échange sur un signalement
 */
export interface ReportComment {
  id: string;
  signalement_id: string;
  auteur_id: string;
  auteur_nom?: string;
  auteur_role: UserRole;
  texte: string;
  photo_preuve_url?: string;
  est_interne: boolean;
  cree_le: string;
}

/**
 * Résultat de classification automatique par l'IA Gemini
 */
export interface AiClassificationResult {
  categorie_proposee_id: string;
  categorie_nom_fr: string;
  categorie_nom_ar: string;
  score_confiance: number; // 0.0 à 1.0
  justification_fr: string;
  justification_ar: string;
  valide_par_agent?: boolean;
}

/**
 * Données statistiques agrégées (Open Data - sans données personnelles)
 */
export interface OpenDataStats {
  total_signalements: number;
  signalements_par_statut: Record<string, number>;
  signalements_par_categorie: Array<{
    categorie_id: string;
    categorie_nom_fr: string;
    categorie_nom_ar: string;
    total: number;
  }>;
  delai_moyen_resolution_heures: number;
  taux_resolution_pourcentage: number;
  repartition_quartiers: Array<{
    quartier: string;
    total: number;
    latitude: number;
    longitude: number;
  }>;
  derniere_mise_a_jour: string;
}
