import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_MUNICIPAL_SERVICES,
  DEFAULT_CATEGORIES,
  Report,
  ReportStatus,
  ReportPriority,
  User,
  UserRole,
  AppLanguage,
  StatusHistory,
  ReportComment,
} from '@kalaa-connect/shared';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private supabase: SupabaseClient | null = null;
  public mode: 'supabase' | 'mock' = 'mock';

  // Tables mémoire locales pour le mode hors-ligne et les tests
  public users: Map<string, User> = new Map();
  public services: Map<string, any> = new Map();
  public categories: Map<string, any> = new Map();
  public reports: Map<string, Report> = new Map();
  public statusHistory: StatusHistory[] = [];
  public comments: ReportComment[] = [];

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const configMode = process.env.DATABASE_MODE || 'mock';

    if (configMode === 'supabase' && supabaseUrl && supabaseKey && !supabaseUrl.includes('example')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.mode = 'supabase';
        this.logger.log(`Connecté à Supabase en mode production (${supabaseUrl})`);
      } catch (err: any) {
        this.logger.warn(`Échec de connexion Supabase, repli sur le mode mémoire : ${err.message}`);
        this.mode = 'mock';
      }
    } else {
      this.mode = 'mock';
      this.logger.log('Démarrage en mode Local/Mock avec données de test de Kalâa Seghira');
    }

    this.seedMockData();
  }

  getSupabase(): SupabaseClient | null {
    return this.supabase;
  }

  private seedMockData() {
    // 1. Services
    DEFAULT_MUNICIPAL_SERVICES.forEach((srv) => {
      this.services.set(srv.id, { ...srv });
    });

    // 2. Catégories
    DEFAULT_CATEGORIES.forEach((cat) => {
      this.categories.set(cat.id, { ...cat });
    });

    // 3. Utilisateurs de démonstration
    const testUsers: User[] = [
      {
        id: 'usr-citoyen-imed',
        nom: 'Imed Attia',
        email: 'imedattia1032@gmail.com',
        role: UserRole.CITOYEN,
        langue: AppLanguage.FR,
        telephone: '+21698000111',
        cree_le: new Date().toISOString(),
      },
      {
        id: 'usr-agent-voirie',
        nom: 'Ahmed Ben Salah',
        email: 'agent.voirie@kalaa-soghra.gov.tn',
        role: UserRole.AGENT,
        langue: AppLanguage.FR,
        service_id: 'srv-voirie',
        telephone: '+21698000222',
        cree_le: new Date().toISOString(),
      },
      {
        id: 'usr-agent-proprete',
        nom: 'Sami Mansour',
        email: 'agent.proprete@kalaa-soghra.gov.tn',
        role: UserRole.AGENT,
        langue: AppLanguage.AR,
        service_id: 'srv-proprete',
        telephone: '+21698000333',
        cree_le: new Date().toISOString(),
      },
      {
        id: 'usr-admin-municipal',
        nom: 'Administrateur Municipal',
        email: 'admin@kalaa-soghra.gov.tn',
        role: UserRole.ADMIN,
        langue: AppLanguage.FR,
        service_id: null,
        telephone: '+21673000000',
        cree_le: new Date().toISOString(),
      },
    ];

    testUsers.forEach((u) => this.users.set(u.id, u));

    // 4. Signalements de démonstration
    const testReports: Report[] = [
      {
        id: 'rep-001',
        numero_ticket: 'KC-2026-0001',
        titre: 'Nid-de-poule dangereux devant la poste',
        description: 'Trou profond au milieu de la chaussée risquant de provoquer un accident.',
        categorie_id: 'cat-nid-de-poule',
        service_id: 'srv-voirie',
        latitude: 35.8285,
        longitude: 10.564,
        adresse_approximative: 'Avenue Habib Bourguiba',
        quartier: 'Centre-Ville',
        photo_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
        statut: ReportStatus.NOUVEAU,
        priorite: ReportPriority.HAUTE,
        auteur_id: 'usr-citoyen-imed',
        cree_le: new Date(Date.now() - 3600000 * 24).toISOString(),
        mis_a_jour_le: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'rep-002',
        numero_ticket: 'KC-2026-0002',
        titre: 'Éclairage éteint depuis 3 nuits',
        description: 'La rue est complètement sombre, sentiment d’insécurité pour les piétons.',
        categorie_id: 'cat-reverbere-eteint',
        service_id: 'srv-eclairage',
        latitude: 35.8322,
        longitude: 10.5615,
        adresse_approximative: 'Rue Ibn Khaldoun',
        quartier: 'El Manar',
        photo_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
        statut: ReportStatus.ACCEPTE,
        priorite: ReportPriority.NORMALE,
        auteur_id: 'usr-citoyen-imed',
        agent_id: 'usr-agent-voirie',
        cree_le: new Date(Date.now() - 3600000 * 48).toISOString(),
        mis_a_jour_le: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: 'rep-003',
        numero_ticket: 'KC-2026-0003',
        titre: 'Dépôt sauvage d’ordures à côté de l’école',
        description: 'Déchets de plastique et encombrants non ramassés.',
        categorie_id: 'cat-depot-sauvage',
        service_id: 'srv-proprete',
        latitude: 35.8215,
        longitude: 10.5695,
        adresse_approximative: 'Rue des Jardins',
        quartier: 'Cité El Bassatine',
        photo_url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600',
        statut: ReportStatus.RESOLU,
        priorite: ReportPriority.URGENTE,
        auteur_id: 'usr-citoyen-imed',
        agent_id: 'usr-agent-proprete',
        photo_preuve_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
        cree_le: new Date(Date.now() - 3600000 * 72).toISOString(),
        mis_a_jour_le: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];

    testReports.forEach((r) => this.reports.set(r.id, r));
  }
}
