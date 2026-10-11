import React, { useState, useEffect } from 'react';
import { Report, AppLanguage, ReportStatus, ReportPriority } from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Check,
  Edit3,
  Trash2,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
}

export const MyReportsView: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Édition d'un signalement
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<ReportPriority>(ReportPriority.NORMALE);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await apiClient.getReports();
    setReports(data);
    setLoading(false);
  };

  const handleOpenEdit = (report: Report) => {
    setEditingReport(report);
    setEditTitle(report.titre);
    setEditDescription(report.description);
    setEditPriority(report.priorite || ReportPriority.NORMALE);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;

    if (!editTitle.trim()) {
      setEditError('Le titre ne peut pas être vide.');
      return;
    }

    setIsSaving(true);
    setEditError(null);
    try {
      await apiClient.updateReport(
        editingReport.id,
        {
          titre: editTitle.trim(),
          description: editDescription.trim(),
          priorite: editPriority,
        },
        'test-token-citoyen',
      );
      setEditingReport(null);
      await loadReports();
    } catch (err: any) {
      setEditError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) return;
    try {
      await apiClient.deleteReport(reportId, 'test-token-citoyen');
      await loadReports();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleConfirmClose = async (reportId: string) => {
    try {
      await apiClient.updateReportStatus(
        reportId,
        {
          nouveau_statut: ReportStatus.CLOTURE,
          commentaire: 'Clôture confirmée par le citoyen',
        },
        'test-token-citoyen',
      );
      await loadReports();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la clôture');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.nav.myReports}</h2>
          <p className="text-sm text-slate-500">
            Suivez et mettez à jour l’état d’avancement de vos signalements — Municipalité de Kalâa Seghira
          </p>
        </div>
        <button
          onClick={loadReports}
          className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
        >
          Actualiser
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Chargement de vos signalements...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700">Aucun signalement actif</h3>
          <p className="text-xs text-slate-400 mt-1">
            Utilisez le bouton « Signaler » pour déclarer un problème urbain dans votre quartier.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    #{report.numero_ticket}
                  </span>
                  <span className="font-semibold text-slate-900 text-base">
                    {report.titre}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {t.status[report.statut] || report.statut}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {report.priorite || 'Normale'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-4">{report.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Photo initiale */}
                {report.photo_url && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">
                      Photo transmise :
                    </span>
                    <img
                      src={report.photo_url}
                      alt="Incident"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200 shadow-sm"
                    />
                  </div>
                )}

                {/* Photo de preuve si résolu */}
                {report.photo_preuve_url && (
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Preuve de résolution des agents municipaux :
                    </span>
                    <img
                      src={report.photo_preuve_url}
                      alt="Preuve"
                      className="w-full h-36 object-cover rounded-lg border border-emerald-300 shadow-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 gap-2">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {report.quartier || 'Kalâa Seghira'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.cree_le).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bouton Modifier */}
                  <button
                    onClick={() => handleOpenEdit(report)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Modifier
                  </button>

                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>

                  {/* Si le ticket est résolu, confirmation citoyenne */}
                  {report.statut === ReportStatus.RESOLU && (
                    <button
                      onClick={() => handleConfirmClose(report.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirmer la clôture
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE MODIFICATION DU SIGNALEMENT */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Modifier le signalement #{editingReport.numero_ticket}
              </h3>
              <button
                onClick={() => setEditingReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre du problème
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Priorité estimée
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as ReportPriority)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={ReportPriority.BASSE}>Basse</option>
                  <option value={ReportPriority.NORMALE}>Normale</option>
                  <option value={ReportPriority.HAUTE}>Haute</option>
                  <option value={ReportPriority.URGENTE}>Urgente</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
