import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
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
  private storagePath: string;

  // Tables mémoire locales avec persistance fichier
  public users: Map<string, User> = new Map();
  public services: Map<string, any> = new Map();
  public categories: Map<string, any> = new Map();
  public reports: Map<string, Report> = new Map();
  public statusHistory: StatusHistory[] = [];
  public comments: ReportComment[] = [];

  constructor() {
    const candidatePath1 = path.resolve(__dirname, '../../../../data/kalaa_database.json');
    const candidatePath2 = path.resolve(process.cwd(), 'apps/api/data/kalaa_database.json');
    const candidatePath3 = path.resolve(process.cwd(), 'data/kalaa_database.json');
    
    if (fs.existsSync(candidatePath1)) {
      this.storagePath = candidatePath1;
    } else if (fs.existsSync(candidatePath2)) {
      this.storagePath = candidatePath2;
    } else {
      this.storagePath = candidatePath3;
    }
  }

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
        this.logger.warn(`Échec de connexion Supabase, repli sur le mode persistant local : ${err.message}`);
        this.mode = 'mock';
      }
    } else {
      this.mode = 'mock';
      this.logger.log('Démarrage en mode Local Persistant avec données de Kalâa Seghira');
    }

    // Charger les référentiels
    DEFAULT_MUNICIPAL_SERVICES.forEach((srv) => {
      this.services.set(srv.id, { ...srv });
    });
    DEFAULT_CATEGORIES.forEach((cat) => {
      this.categories.set(cat.id, { ...cat });
    });

    // Restaurer ou initialiser les données persistées
    this.restoreOrSeedData();
  }

  getSupabase(): SupabaseClient | null {
    return this.supabase;
  }

  public persistToDisk() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        reports: Array.from(this.reports.values()),
        statusHistory: this.statusHistory,
        comments: this.comments,
        savedAt: new Date().toISOString(),
      };
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
      this.logger.log(`Données synchronisées sur disque (${this.reports.size} signalements, ${this.users.size} utilisateurs)`);
    } catch (e: any) {
      this.logger.error(`Échec d'écriture de la persistance : ${e.message}`);
    }
  }

  private restoreOrSeedData() {
    if (fs.existsSync(this.storagePath)) {
      try {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.users)) {
          parsed.users.forEach((u: User) => this.users.set(u.id, u));
        }
        if (Array.isArray(parsed.reports)) {
          parsed.reports.forEach((r: Report) => this.reports.set(r.id, r));
        }
        if (Array.isArray(parsed.statusHistory)) {
          this.statusHistory = parsed.statusHistory;
        }
        if (Array.isArray(parsed.comments)) {
          this.comments = parsed.comments;
        }
        this.logger.log(`Base de données restaurée depuis ${this.storagePath} (${this.reports.size} signalements existants)`);
        
        // S'assurer que Nada Slama et Dalila Khlifa sont toujours présentes
        this.ensureDefaultUsers();
        return;
      } catch (err: any) {
        this.logger.warn(`Erreur lors de la lecture du fichier persistant (${err.message}), réinitialisation.`);
      }
    }

    this.seedMockData();
    this.persistToDisk();
  }

  private ensureDefaultUsers() {
    if (!this.users.has('usr-citoyen-nada')) {
      this.users.set('usr-citoyen-nada', {
        id: 'usr-citoyen-nada',
        nom: 'Nada Slama',
        email: 'nada.slama@esprit.tn',
        role: UserRole.CITOYEN,
        langue: AppLanguage.FR,
        telephone: '+21698111222',
        cree_le: new Date().toISOString(),
      });
    }
    if (!this.users.has('usr-admin-dalila')) {
      this.users.set('usr-admin-dalila', {
        id: 'usr-admin-dalila',
        nom: 'Mme Dalila Khlifa',
        email: 'dalila.khlifa@kalaa-soghra.gov.tn',
        role: UserRole.ADMIN,
        langue: AppLanguage.FR,
        service_id: null,
        telephone: '+21673000111',
        cree_le: new Date().toISOString(),
      });
    }
  }

  private seedMockData() {
    // Utilisateurs par défaut
    const defaultUsers: User[] = [
      {
        id: 'usr-citoyen-nada',
        nom: 'Nada Slama',
        email: 'nada.slama@esprit.tn',
        role: UserRole.CITOYEN,
        langue: AppLanguage.FR,
        telephone: '+21698111222',
        cree_le: new Date().toISOString(),
      },
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
        id: 'usr-admin-dalila',
        nom: 'Mme Dalila Khlifa',
        email: 'dalila.khlifa@kalaa-soghra.gov.tn',
        role: UserRole.ADMIN,
        langue: AppLanguage.FR,
        service_id: null,
        telephone: '+21673000111',
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

    defaultUsers.forEach((u) => this.users.set(u.id, u));

    // Signalements initiaux de démonstration
    const initialReports: Report[] = [
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
        auteur_id: 'usr-citoyen-nada',
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
        auteur_id: 'usr-citoyen-nada',
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
        auteur_id: 'usr-citoyen-nada',
        agent_id: 'usr-agent-proprete',
        photo_preuve_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600',
        cree_le: new Date(Date.now() - 3600000 * 72).toISOString(),
        mis_a_jour_le: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ];

    initialReports.forEach((r) => this.reports.set(r.id, r));
  }
}
