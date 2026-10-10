import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateReportDto,
  UpdateReportStatusDto,
  AddCommentDto,
  FilterReportsDto,
} from './reports.dto';
import {
  Report,
  ReportStatus,
  ReportPriority,
  User,
  UserRole,
  StatusHistory,
  ReportComment,
  validateStatusTransition,
  KALAA_SOGHRA_QUARTIERS,
  DEFAULT_CATEGORIES,
} from '@kalaa-connect/shared';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Création d'un nouveau signalement citoyen
   */
  async createReport(dto: CreateReportDto, user: User): Promise<Report> {
    // 1. Détection du quartier le plus proche si non fourni
    const quartier = dto.quartier || this.detectQuartier(dto.latitude, dto.longitude);

    // 2. Récupération de la catégorie et du service associé
    const categorie =
      this.db.categories.get(dto.categorie_id) ||
      DEFAULT_CATEGORIES.find((c) => c.id === dto.categorie_id);

    if (!categorie) {
      throw new BadRequestException(`Catégorie introuvable : ${dto.categorie_id}`);
    }

    const ticketNumber = `KC-${new Date().getFullYear()}-${String(this.db.reports.size + 1).padStart(4, '0')}`;
    const reportId = `rep-${Date.now()}`;
    const now = new Date().toISOString();

    const report: Report = {
      id: reportId,
      numero_ticket: ticketNumber,
      titre: dto.titre,
      description: dto.description,
      categorie_id: dto.categorie_id,
      categorie,
      service_id: categorie.service_id,
      latitude: dto.latitude,
      longitude: dto.longitude,
      adresse_approximative: dto.adresse_approximative || quartier,
      quartier,
      photo_url: dto.photo_url,
      statut: ReportStatus.NOUVEAU,
      priorite: dto.priorite || ReportPriority.NORMALE,
      auteur_id: user.id,
      auteur: { id: user.id, nom: user.nom, email: user.email },
      cree_le: now,
      mis_a_jour_le: now,
    };

    // Mode Supabase
    const supabase = this.db.getSupabase();
    if (supabase && this.db.mode === 'supabase') {
      try {
        await supabase.from('signalements').insert(report);
      } catch (err: any) {
        this.logger.warn(`Erreur insertion Supabase : ${err.message}`);
      }
    }

    // Sauvegarde mémoire
    this.db.reports.set(reportId, report);

    // Enregistrement dans l'historique d'audit
    const historyEntry: StatusHistory = {
      id: `hist-${Date.now()}`,
      signalement_id: reportId,
      ancien_statut: null,
      nouveau_statut: ReportStatus.NOUVEAU,
      acteur_id: user.id,
      acteur_nom: user.nom,
      commentaire: 'Création du signalement par le citoyen',
      date: now,
    };
    this.db.statusHistory.push(historyEntry);

    this.logger.log(`Nouveau signalement créé : ${ticketNumber} (${report.titre}) par ${user.nom}`);

    // Notification citoyen
    this.notifications.sendBilingualNotification(user.email, report, ReportStatus.NOUVEAU, user.langue);

    return report;
  }

  /**
   * Liste des signalements filtrée selon le rôle et les critères
   */
  async findAll(filters: FilterReportsDto, user?: User): Promise<{ data: Report[]; total: number; page: number }> {
    let reports = Array.from(this.db.reports.values());

    // Filtrage selon le rôle (Row Level Security au niveau applicatif)
    if (user) {
      if (user.role === UserRole.CITOYEN) {
        // Le citoyen voit ses signalements ou tous les signalements publics (sans PII des autres)
        // Ici on filtre ou on anonymise
      } else if (user.role === UserRole.AGENT) {
        // L'agent voit en priorité les tickets de son service municipal
        if (user.service_id) {
          reports = reports.filter((r) => !r.service_id || r.service_id === user.service_id);
        }
      }
    }

    // Filtres par statut, catégorie, quartier
    if (filters.statut) {
      reports = reports.filter((r) => r.statut === filters.statut);
    }
    if (filters.categorie_id) {
      reports = reports.filter((r) => r.categorie_id === filters.categorie_id);
    }
    if (filters.service_id) {
      reports = reports.filter((r) => r.service_id === filters.service_id);
    }
    if (filters.quartier) {
      reports = reports.filter((r) => r.quartier === filters.quartier);
    }

    // Tri par date décroissante
    reports.sort((a, b) => new Date(b.cree_le).getTime() - new Date(a.cree_le).getTime());

    const total = reports.length;
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 20);
    const paginated = reports.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      total,
      page,
    };
  }

  /**
   * Consultation détaillée d'un signalement
   */
  async findOne(id: string, user?: User): Promise<{
    report: Report;
    history: StatusHistory[];
    comments: ReportComment[];
  }> {
    const report = this.db.reports.get(id);
    if (!report) {
      throw new NotFoundException(`Signalement introuvable (${id})`);
    }

    const history = this.db.statusHistory.filter((h) => h.signalement_id === id);
    let comments = this.db.comments.filter((c) => c.signalement_id === id);

    // Masquage des commentaires internes si citoyen
    if (user && user.role === UserRole.CITOYEN) {
      comments = comments.filter((c) => !c.est_interne);
    }

    return { report, history, comments };
  }

  /**
   * Changement de statut selon la machine à états stricte (Section 3 du plan)
   */
  async updateStatus(
    id: string,
    dto: UpdateReportStatusDto,
    user: User,
  ): Promise<Report> {
    const report = this.db.reports.get(id);
    if (!report) {
      throw new NotFoundException(`Signalement introuvable (${id})`);
    }

    // Validation stricte des règles de transition de statut
    const validation = validateStatusTransition({
      currentStatus: report.statut,
      targetStatus: dto.nouveau_statut,
      userRole: user.role,
      photoPreuveUrl: dto.photo_preuve_url,
      motifRejetOuDoublon: dto.motif_rejet_ou_doublon,
    });

    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const previousStatus = report.statut;
    report.statut = dto.nouveau_statut;
    report.mis_a_jour_le = new Date().toISOString();

    if (dto.photo_preuve_url) {
      report.photo_preuve_url = dto.photo_preuve_url;
    }
    if (dto.motif_rejet_ou_doublon) {
      report.motif_rejet_ou_doublon = dto.motif_rejet_ou_doublon;
    }
    if (dto.agent_id) {
      report.agent_id = dto.agent_id;
    } else if (user.role === UserRole.AGENT && !report.agent_id) {
      report.agent_id = user.id;
    }

    // Ajout à l'historique d'audit
    const historyEntry: StatusHistory = {
      id: `hist-${Date.now()}`,
      signalement_id: id,
      ancien_statut: previousStatus,
      nouveau_statut: dto.nouveau_statut,
      acteur_id: user.id,
      acteur_nom: user.nom,
      commentaire: dto.commentaire || dto.motif_rejet_ou_doublon || `Passage au statut ${dto.nouveau_statut}`,
      photo_preuve_url: dto.photo_preuve_url,
      date: new Date().toISOString(),
    };
    this.db.statusHistory.push(historyEntry);

    this.logger.log(`Statut du ticket #${report.numero_ticket} modifié : ${previousStatus} -> ${dto.nouveau_statut}`);

    // Notification par email
    if (report.auteur?.email) {
      this.notifications.sendBilingualNotification(report.auteur.email, report, dto.nouveau_statut);
    }

    return report;
  }

  /**
   * Ajout d'un commentaire sur un ticket
   */
  async addComment(id: string, dto: AddCommentDto, user: User): Promise<ReportComment> {
    const report = this.db.reports.get(id);
    if (!report) {
      throw new NotFoundException(`Signalement introuvable (${id})`);
    }

    if (dto.est_interne && user.role === UserRole.CITOYEN) {
      throw new ForbiddenException('Seuls les agents municipaux peuvent publier des commentaires internes');
    }

    const comment: ReportComment = {
      id: `cmt-${Date.now()}`,
      signalement_id: id,
      auteur_id: user.id,
      auteur_nom: user.nom,
      auteur_role: user.role,
      texte: dto.texte,
      photo_preuve_url: dto.photo_preuve_url,
      est_interne: !!dto.est_interne,
      cree_le: new Date().toISOString(),
    };

    this.db.comments.push(comment);
    return comment;
  }

  /**
   * Calcul du quartier le plus proche à Kalâa Seghira par distance euclidienne
   */
  private detectQuartier(lat: number, lng: number): string {
    let nearest = KALAA_SOGHRA_QUARTIERS[0];
    let minDistance = Number.MAX_VALUE;

    KALAA_SOGHRA_QUARTIERS.forEach((q) => {
      const dist = Math.hypot(lat - q.lat, lng - q.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = q;
      }
    });

    return nearest.nom;
  }
}
