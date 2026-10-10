import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { OpenDataStats, ReportStatus, DEFAULT_CATEGORIES, KALAA_SOGHRA_QUARTIERS } from '@kalaa-connect/shared';

@Injectable()
export class OpenDataService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Retourne les statistiques Open Data publiques (anonymisées sans données personnelles)
   */
  getStats(): OpenDataStats {
    const reports = Array.from(this.db.reports.values());

    // 1. Décompte par statut
    const byStatus: Record<string, number> = {
      [ReportStatus.NOUVEAU]: 0,
      [ReportStatus.ACCEPTE]: 0,
      [ReportStatus.EN_COURS]: 0,
      [ReportStatus.RESOLU]: 0,
      [ReportStatus.CLOTURE]: 0,
      [ReportStatus.REJETE]: 0,
      [ReportStatus.DOUBLON]: 0,
    };

    reports.forEach((r) => {
      byStatus[r.statut] = (byStatus[r.statut] || 0) + 1;
    });

    // 2. Décompte par catégorie
    const byCategory = DEFAULT_CATEGORIES.map((cat) => {
      const total = reports.filter((r) => r.categorie_id === cat.id).length;
      return {
        categorie_id: cat.id,
        categorie_nom_fr: cat.nom_fr,
        categorie_nom_ar: cat.nom_ar,
        total,
      };
    });

    // 3. Délai moyen de résolution
    const resolvedReports = reports.filter(
      (r) => r.statut === ReportStatus.RESOLU || r.statut === ReportStatus.CLOTURE,
    );

    let totalDelayHours = 0;
    resolvedReports.forEach((r) => {
      const created = new Date(r.cree_le).getTime();
      const updated = new Date(r.mis_a_jour_le).getTime();
      const diffHours = Math.max(1, (updated - created) / (1000 * 3600));
      totalDelayHours += diffHours;
    });

    const avgDelay = resolvedReports.length > 0 ? Math.round((totalDelayHours / resolvedReports.length) * 10) / 10 : 24.0;
    const resolvedCount = (byStatus[ReportStatus.RESOLU] || 0) + (byStatus[ReportStatus.CLOTURE] || 0);
    const resolutionRate = reports.length > 0 ? Math.round((resolvedCount / reports.length) * 100) : 100;

    // 4. Répartition par quartier
    const byNeighborhood = KALAA_SOGHRA_QUARTIERS.map((q) => {
      const total = reports.filter((r) => r.quartier === q.nom).length;
      return {
        quartier: q.nom,
        total,
        latitude: q.lat,
        longitude: q.lng,
      };
    });

    return {
      total_signalements: reports.length,
      signalements_par_statut: byStatus,
      signalements_par_categorie: byCategory,
      delai_moyen_resolution_heures: avgDelay,
      taux_resolution_pourcentage: resolutionRate,
      repartition_quartiers: byNeighborhood,
      derniere_mise_a_jour: new Date().toISOString(),
    };
  }

  /**
   * Exporte les signalements publics sous forme de tableau CSV conforme Open Data
   */
  generateCsvExport(): string {
    const reports = Array.from(this.db.reports.values()).filter(
      (r) => r.statut !== ReportStatus.REJETE && r.statut !== ReportStatus.DOUBLON,
    );

    const headers = [
      'numero_ticket',
      'titre',
      'categorie_id',
      'statut',
      'priorite',
      'latitude',
      'longitude',
      'quartier',
      'date_creation',
      'date_mise_a_jour',
    ];

    const rows = reports.map((r) => [
      `"${r.numero_ticket}"`,
      `"${r.titre.replace(/"/g, '""')}"`,
      `"${r.categorie_id}"`,
      `"${r.statut}"`,
      `"${r.priorite}"`,
      r.latitude.toFixed(6),
      r.longitude.toFixed(6),
      `"${r.quartier || 'Kalâa Seghira'}"`,
      `"${r.cree_le}"`,
      `"${r.mis_a_jour_le}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
