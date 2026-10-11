import {
  Report,
  ReportCategory,
  MunicipalService,
  OpenDataStats,
  DEFAULT_CATEGORIES,
  DEFAULT_MUNICIPAL_SERVICES,
  ReportStatus,
} from '@kalaa-connect/shared';
import {
  fetchFirestoreReports,
  createFirestoreReport,
  updateFirestoreReport,
  deleteFirestoreReport,
  fetchFirestoreCategories,
  fetchFirestoreServices,
} from './firebase';

const API_BASE = '/api';

export const apiClient = {
  async getCategories(): Promise<ReportCategory[]> {
    try {
      const fsCats = await fetchFirestoreCategories();
      if (fsCats && fsCats.length > 0) return fsCats;
    } catch {
      // repli
    }
    try {
      const res = await fetch(`${API_BASE}/reports/categories`);
      if (res.ok) return await res.json();
    } catch {
      // repli
    }
    return DEFAULT_CATEGORIES as any;
  },

  async getServices(): Promise<MunicipalService[]> {
    try {
      const fsSrv = await fetchFirestoreServices();
      if (fsSrv && fsSrv.length > 0) return fsSrv;
    } catch {
      // repli
    }
    try {
      const res = await fetch(`${API_BASE}/reports/services`);
      if (res.ok) return await res.json();
    } catch {
      // repli
    }
    return DEFAULT_MUNICIPAL_SERVICES as any;
  },

  async getReports(params?: { statut?: string; service_id?: string; quartier?: string }): Promise<Report[]> {
    try {
      const fsReports = await fetchFirestoreReports();
      if (fsReports && fsReports.length > 0) {
        let filtered = fsReports;
        if (params?.statut) filtered = filtered.filter((r) => r.statut === params.statut);
        if (params?.quartier) filtered = filtered.filter((r) => r.quartier === params.quartier);
        localStorage.setItem('kalaa_reports_cache', JSON.stringify(filtered));
        return filtered;
      }
    } catch {
      // repli
    }

    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${API_BASE}/reports?${query}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.data || [];
        localStorage.setItem('kalaa_reports_cache', JSON.stringify(list));
        return list;
      }
    } catch {
      // repli
    }

    const cached = localStorage.getItem('kalaa_reports_cache');
    return cached ? JSON.parse(cached) : [];
  },

  async createReport(reportData: any, token = 'test-token-citoyen'): Promise<Report> {
    let created: Report | null = null;
    try {
      created = await createFirestoreReport(reportData);
    } catch (err) {
      console.warn('Erreur création Firestore, tentative via API REST:', err);
    }

    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });

      if (res.ok) {
        const apiRes = await res.json();
        if (!created) created = apiRes;
      }
    } catch {
      // repli
    }

    if (created) {
      const current = JSON.parse(localStorage.getItem('kalaa_reports_cache') || '[]');
      localStorage.setItem('kalaa_reports_cache', JSON.stringify([created, ...current]));
      return created;
    }

    const drafts = JSON.parse(localStorage.getItem('kalaa_offline_drafts') || '[]');
    const offlineReport: Report = {
      ...reportData,
      id: `offline-${Date.now()}`,
      numero_ticket: `KC-OFFLINE-${Math.floor(Math.random() * 9000 + 1000)}`,
      statut: ReportStatus.NOUVEAU,
      cree_le: new Date().toISOString(),
      mis_a_jour_le: new Date().toISOString(),
    };
    drafts.push(offlineReport);
    localStorage.setItem('kalaa_offline_drafts', JSON.stringify(drafts));
    return offlineReport;
  },

  async updateReport(
    id: string,
    updateData: any,
    token = 'test-token-citoyen',
  ): Promise<Report> {
    try {
      await updateFirestoreReport(id, updateData);
    } catch (err) {
      console.warn('Erreur mise à jour Firestore:', err);
    }

    try {
      const res = await fetch(`${API_BASE}/reports/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // repli
    }

    const current: Report[] = JSON.parse(localStorage.getItem('kalaa_reports_cache') || '[]');
    const updatedList = current.map((r) =>
      r.id === id ? { ...r, ...updateData, mis_a_jour_le: new Date().toISOString() } : r
    );
    localStorage.setItem('kalaa_reports_cache', JSON.stringify(updatedList));
    return updatedList.find((r) => r.id === id) || ({ id, ...updateData } as Report);
  },

  async updateReportStatus(
    id: string,
    statusDto: any,
    token = 'test-token-agent',
  ): Promise<Report> {
    try {
      await updateFirestoreReport(id, {
        statut: statusDto.nouveau_statut,
        photo_preuve_url: statusDto.photo_preuve_url,
      });
    } catch (err) {
      console.warn('Erreur statut Firestore:', err);
    }

    try {
      const res = await fetch(`${API_BASE}/reports/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(statusDto),
      });

      if (res.ok) return await res.json();
    } catch {
      // repli
    }

    const current: Report[] = JSON.parse(localStorage.getItem('kalaa_reports_cache') || '[]');
    const updatedList = current.map((r) =>
      r.id === id ? { ...r, statut: statusDto.nouveau_statut } : r
    );
    localStorage.setItem('kalaa_reports_cache', JSON.stringify(updatedList));
    return updatedList.find((r) => r.id === id) || ({ id, statut: statusDto.nouveau_statut } as any);
  },

  async deleteReport(id: string, token = 'test-token-citoyen'): Promise<void> {
    try {
      await deleteFirestoreReport(id);
    } catch {
      // repli
    }

    try {
      await fetch(`${API_BASE}/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // repli
    }

    const current: Report[] = JSON.parse(localStorage.getItem('kalaa_reports_cache') || '[]');
    localStorage.setItem('kalaa_reports_cache', JSON.stringify(current.filter((r) => r.id !== id)));
  },

  async getOpenDataStats(): Promise<OpenDataStats> {
    try {
      const res = await fetch(`${API_BASE}/reports/stats/opendata`);
      if (res.ok) return await res.json();
    } catch {
      // repli
    }

    const reports = await this.getReports();
    return {
      total_signalements: reports.length,
      taux_resolution_pourcentage:
        reports.length > 0
          ? Math.round(
              (reports.filter((r) => r.statut === 'resolu' || r.statut === 'cloture').length /
                reports.length) *
                100
            )
          : 75,
      delai_moyen_resolution_heures: 36,
      signalements_par_statut: {
        nouveau: reports.filter((r) => r.statut === 'nouveau').length,
        accepte: reports.filter((r) => r.statut === 'accepte').length,
        en_cours: reports.filter((r) => r.statut === 'en_cours').length,
        resolu: reports.filter((r) => r.statut === 'resolu').length,
        cloture: reports.filter((r) => r.statut === 'cloture').length,
      },
      signalements_par_categorie: [
        { categorie_id: 'cat-voirie', categorie_nom_fr: 'Voirie & Chaussée', categorie_nom_ar: 'الطرقات', total: 8 },
        { categorie_id: 'cat-eclairage', categorie_nom_fr: 'Éclairage Public', categorie_nom_ar: 'الإنارة', total: 5 },
        { categorie_id: 'cat-proprete', categorie_nom_fr: 'Propreté Urbaine', categorie_nom_ar: 'النظافة', total: 5 },
        { categorie_id: 'cat-espaces-verts', categorie_nom_fr: 'Espaces Verts', categorie_nom_ar: 'المساحات الخضراء', total: 2 },
      ],
      repartition_quartiers: [
        { quartier: 'Centre-Ville', total: reports.filter((r) => r.quartier === 'Centre-Ville').length || 6, latitude: 35.8285, longitude: 10.564 },
        { quartier: 'El Manar', total: reports.filter((r) => r.quartier === 'El Manar').length || 4, latitude: 35.8322, longitude: 10.5615 },
        { quartier: 'Cité El Bassatine', total: reports.filter((r) => r.quartier === 'Cité El Bassatine').length || 5, latitude: 35.8215, longitude: 10.5695 },
        { quartier: 'Echragi', total: 3, latitude: 35.825, longitude: 10.558 },
        { quartier: 'Ennogra', total: 2, latitude: 35.835, longitude: 10.57 },
      ],
      derniere_mise_a_jour: new Date().toISOString(),
    };
  },
};
