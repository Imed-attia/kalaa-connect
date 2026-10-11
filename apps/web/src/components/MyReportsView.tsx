import React, { useState, useEffect } from 'react';
import { Report, AppLanguage, ReportStatus, ReportPriority } from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import { UserProfile } from '../firebase';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Edit3,
  Trash2,
  X,
  Save,
  AlertCircle,
  ShieldCheck,
  Check,
  ArrowRight,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
}

export const MyReportsView: React.FC<Props> = ({ lang, currentUser, onRequireAuth }) => {
  const t = TRANSLATIONS[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Interactive Edit Modal State
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<ReportPriority>(ReportPriority.NORMALE);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getReports();
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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
      const updated = await apiClient.updateReport(
        editingReport.id,
        {
          titre: editTitle.trim(),
          description: editDescription.trim(),
          priorite: editPriority,
        },
        'test-token-citoyen',
      );

      // Met à jour la liste locale immédiatement
      setReports((prev) =>
        prev.map((r) => (r.id === editingReport.id ? { ...r, ...updated, titre: editTitle, description: editDescription, priorite: editPriority } : r))
      );
      setEditingReport(null);
      showToast('Signalement mis à jour avec succès dans Firestore !');
    } catch (err: any) {
      console.error('Update error:', err);
      setEditError(err.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Voulez-vous supprimer définitivement ce signalement ?')) return;
    try {
      await apiClient.deleteReport(reportId, 'test-token-citoyen');
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      showToast('Signalement supprimé de la base de données.');
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
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, statut: ReportStatus.CLOTURE } : r))
      );
      showToast('Ticket clôturé avec succès.');
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la clôture');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.statut === filterStatus;
  });

  const getStatusBadge = (statut: ReportStatus) => {
    switch (statut) {
      case ReportStatus.NOUVEAU:
        return { label: 'Nouveau', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case ReportStatus.ACCEPTE:
        return { label: 'Pris en charge', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case ReportStatus.EN_COURS:
        return { label: 'Intervention en cours', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case ReportStatus.RESOLU:
        return { label: 'Résolu (Travaux finis)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case ReportStatus.CLOTURE:
        return { label: 'Clôturé & Validé', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: statut, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {lang === AppLanguage.AR ? 'متابعة البلاغات البلدية' : 'Suivi des Signalements Municipaux'}
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
              {reports.length} tickets
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Consultez, modifiez et suivez l’avancement des interventions techniques en direct sur le territoire de Kalâa Seghira.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tous ({reports.length})
          </button>
          <button
            onClick={() => setFilterStatus(ReportStatus.NOUVEAU)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === ReportStatus.NOUVEAU
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Nouveaux
          </button>
          <button
            onClick={() => setFilterStatus(ReportStatus.EN_COURS)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === ReportStatus.EN_COURS
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            En cours
          </button>
          <button
            onClick={() => setFilterStatus(ReportStatus.RESOLU)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === ReportStatus.RESOLU
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Résolus
          </button>
          <button
            onClick={loadReports}
            className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
            title="Rafraîchir depuis Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Chargement des signalements depuis Cloud Firestore...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Aucun signalement trouvé</h3>
          <p className="text-xs text-slate-500 mt-1">Vous n’avez aucun ticket pour ce filtre actuellement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const badge = getStatusBadge(report.statut);
            return (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Ticket Number & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {report.numero_ticket}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors mb-1">
                    {report.titre}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{report.adresse_approximative || report.quartier || 'Kalâa Seghira'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(report.cree_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Photo Preview Thumbnail */}
                  {report.photo_url && (
                    <div className="mt-3 rounded-xl overflow-hidden aspect-video max-h-36 bg-slate-100 border border-slate-200">
                      <img
                        src={report.photo_url}
                        alt={report.titre}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Photo de Preuve si Résolu */}
                  {report.photo_preuve_url && (
                    <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                      <span className="font-bold block mb-1">📷 Preuve de résolution municipale :</span>
                      <img
                        src={report.photo_preuve_url}
                        alt="Preuve"
                        className="w-full max-h-28 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Bouton Éditer (Update) */}
                    <button
                      onClick={() => handleOpenEdit(report)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Modifier les détails du signalement"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Modifier</span>
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Supprimer ce signalement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bouton Clôturer par le citoyen si RESOLU */}
                  {report.statut === ReportStatus.RESOLU && (
                    <button
                      onClick={() => handleConfirmClose(report.id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirmer clôture</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal (Modification Interactive) */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Modifier le Signalement
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {editingReport.numero_ticket}
                </p>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre du signalement
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Niveau de priorité estimé
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as ReportPriority)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                >
                  <option value={ReportPriority.BASSE}>Basse</option>
                  <option value={ReportPriority.NORMALE}>Normale</option>
                  <option value={ReportPriority.HAUTE}>Haute</option>
                  <option value={ReportPriority.URGENTE}>Urgente (Danger immédiat)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
