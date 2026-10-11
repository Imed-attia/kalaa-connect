import {
  Report,
  ReportCategory,
  MunicipalService,
  OpenDataStats,
  DEFAULT_CATEGORIES,
  DEFAULT_MUNICIPAL_SERVICES,
  ReportStatus,
} from '@kalaa-connect/shared';

const API_BASE = '/api';

export const apiClient = {
  async getCategories(): Promise<ReportCategory[]> {
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
      const res = await fetch(`${API_BASE}/reports/services`);
      if (res.ok) return await res.json();
    } catch {
      // repli
    }
    return DEFAULT_MUNICIPAL_SERVICES as any;
  },

  async getReports(params?: { statut?: string; service_id?: string; quartier?: string }): Promise<Report[]> {
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
    // Fallback depuis le stockage local
    const cached = localStorage.getItem('kalaa_reports_cache');
    return cached ? JSON.parse(cached) : [];
  },

  async createReport(reportData: any, token = 'test-token-citoyen'): Promise<Report> {
    try {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de la création');
      }

      const created = await res.json();
      return created;
    } catch (err) {
      // Sauvegarde du brouillon hors-ligne dans IndexedDB / LocalStorage
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
    }
  },

  async updateReport(
    id: string,
    updateData: any,
    token = 'test-token-citoyen',
  ): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erreur lors de la mise à jour du signalement');
    }

    return await res.json();
  },

  async deleteReport(id: string, token = 'test-token-admin'): Promise<boolean> {
    const res = await fetch(`${API_BASE}/reports/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erreur lors de la suppression');
    }

    return true;
  },

  async updateReportStatus(
    id: string,
    statusData: any,
    token = 'test-token-agent',
  ): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(statusData),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erreur lors du changement de statut');
    }

    return await res.json();
  },

  async classifyWithAi(photoUrl: string, categorieId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/ai/classify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-citoyen',
        },
        body: JSON.stringify({ photoUrl, categorieId }),
      });
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },

  async getOpenDataStats(): Promise<OpenDataStats | null> {
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (res.ok) return await res.json();
    } catch {}
    return null;
  },
};
