import React, { useState, useEffect } from 'react';
import {
  Report,
  AppLanguage,
  ReportStatus,
  UserRole,
  MunicipalService,
  DEFAULT_MUNICIPAL_SERVICES,
  ALLOWED_TRANSITIONS,
} from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import { UserProfile } from '../firebase';
import {
  ShieldAlert,
  Filter,
  CheckCircle,
  XCircle,
  Camera,
  AlertCircle,
  ArrowRight,
  UserCheck,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  Send,
  Building2,
  HardHat,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  role: UserRole;
  currentUser: UserProfile | null;
}

const PROOF_PHOTOS = [
  { label: 'Enrobé posé / Trou rebouché', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600' },
  { label: 'Ampoule LED remplacée', url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600' },
  { label: 'Benne vidée & zone nettoyée', url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600' },
  { label: 'Arbre élagué & sécurisé', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600' },
];

export const AgentDashboard: React.FC<Props> = ({ lang, role, currentUser }) => {
  const t = TRANSLATIONS[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Status transition modal
  const [activeModalReport, setActiveModalReport] = useState<Report | null>(null);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>(ReportStatus.ACCEPTE);
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string>(PROOF_PHOTOS[0].url);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [agentComment, setAgentComment] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedService, selectedStatus]);

  const loadDashboardData = async () => {
    setLoading(true);
    const params: any = {};
    if (selectedService !== 'all') params.service_id = selectedService;
    if (selectedStatus !== 'all') params.statut = selectedStatus;

    const data = await apiClient.getReports(params);
    setReports(data);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenStatusModal = (report: Report) => {
    setActiveModalReport(report);
    const allowed = ALLOWED_TRANSITIONS[report.statut] || [];
    setTargetStatus(allowed[0] || ReportStatus.EN_COURS);
    setProofPhotoUrl(PROOF_PHOTOS[0].url);
    setRejectReason('');
    setAgentComment('Intervention réalisée selon les normes techniques municipales.');
    setModalError(null);
  };

  const handleApplyStatusChange = async () => {
    if (!activeModalReport) return;

    if (targetStatus === ReportStatus.RESOLU && !proofPhotoUrl) {
      setModalError('Une photo de preuve est obligatoire pour attester la résolution des travaux.');
      return;
    }

    if ((targetStatus === ReportStatus.REJETE || targetStatus === ReportStatus.DOUBLON) && !rejectReason.trim()) {
      setModalError('Veuillez motiver la raison du rejet ou du doublon.');
      return;
    }

    setIsSubmitting(true);
    setModalError(null);

    try {
      const dto = {
        nouveau_statut: targetStatus,
        photo_preuve_url: targetStatus === ReportStatus.RESOLU ? proofPhotoUrl : undefined,
        motif_rejet_ou_doublon: rejectReason || undefined,
        commentaire: agentComment || `Statut passé à ${targetStatus} par ${currentUser?.nom || 'l’agent municipal'}`,
        agent_id: currentUser?.id || 'usr-agent-ali',
      };

      await apiClient.updateReportStatus(activeModalReport.id, dto, 'test-token-agent');
      setReports((prev) =>
        prev.map((r) =>
          r.id === activeModalReport.id
            ? { ...r, statut: targetStatus, photo_preuve_url: dto.photo_preuve_url }
            : r
        )
      );
      setActiveModalReport(null);
      showToast(`Statut du ticket mis à jour vers [${targetStatus}] dans Cloud Firestore.`);
    } catch (err: any) {
      console.error('Status transition error:', err);
      setModalError(err.message || 'Erreur lors du changement de statut');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.NOUVEAU:
        return { label: 'Nouveau', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case ReportStatus.ACCEPTE:
        return { label: 'Pris en charge', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case ReportStatus.EN_COURS:
        return { label: 'En cours', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case ReportStatus.RESOLU:
        return { label: 'Résolu (Travaux terminés)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case ReportStatus.CLOTURE:
        return { label: 'Clôturé', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/20 mb-3">
              <HardHat className="w-4 h-4" />
              Direction des Services Techniques & SI · Kalâa Seghira
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tableau de Bord des Interventions de Terrain
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Supervisé par <strong className="text-white">Mme Dalila KHLIFA</strong> · Connecté en tant que{' '}
              <strong className="text-amber-300">{currentUser?.nom || 'Ali Mansour (Chef Voirie)'}</strong>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-right">
            <div className="text-2xl font-black text-amber-400">{reports.length}</div>
            <div className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">
              Tickets à traiter
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Service technique :</span>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          >
            <option value="all">Tous les services municipaux</option>
            <option value="srv-voirie">Voirie & Chaussée (Ali Mansour)</option>
            <option value="srv-eclairage">Éclairage Public (Ridha Ben Amor)</option>
            <option value="srv-proprete">Propreté Urbaine (Sami Mansour)</option>
            <option value="srv-espaces-verts">Espaces Verts (Sonia Jlassi)</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tous' },
            { id: ReportStatus.NOUVEAU, label: 'Nouveaux' },
            { id: ReportStatus.ACCEPTE, label: 'Acceptés' },
            { id: ReportStatus.EN_COURS, label: 'En cours' },
            { id: ReportStatus.RESOLU, label: 'Résolus' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === s.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Chargement des ordres d'intervention...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Aucun ticket en attente</h3>
          <p className="text-xs text-slate-500 mt-1">Tous les signalements pour ce filtre ont été traités avec succès !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => {
            const badge = getStatusBadge(report.statut);
            const allowed = ALLOWED_TRANSITIONS[report.statut] || [];
            return (
              <div
                key={report.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {report.numero_ticket}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {report.titre}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {report.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{report.adresse_approximative || report.quartier || 'Kalâa Seghira'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(report.cree_le).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {report.photo_url && (
                    <div className="mt-3 rounded-2xl overflow-hidden aspect-video max-h-36 bg-slate-100 border border-slate-200">
                      <img
                        src={report.photo_url}
                        alt={report.titre}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-slate-400">
                    Priorité : <strong className="text-slate-700 capitalize">{report.priorite || 'Normale'}</strong>
                  </span>

                  {allowed.length > 0 && (
                    <button
                      onClick={() => handleOpenStatusModal(report)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      <span>Traiter ticket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Transition Modal */}
      {activeModalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Mise à Jour de l’Intervention
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {activeModalReport.numero_ticket} · {activeModalReport.titre}
                </p>
              </div>
              <button
                onClick={() => setActiveModalReport(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nouveau statut de l'intervention
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white font-semibold text-slate-800"
                >
                  {(ALLOWED_TRANSITIONS[activeModalReport.statut] || []).map((st) => (
                    <option key={st} value={st}>
                      {st === ReportStatus.ACCEPTE && 'Accepter le ticket (Pris en charge)'}
                      {st === ReportStatus.EN_COURS && 'Passer en intervention terrain (En cours)'}
                      {st === ReportStatus.RESOLU && 'Déclarer les travaux terminés (Résolu)'}
                      {st === ReportStatus.REJETE && 'Rejeter le signalement'}
                      {st === ReportStatus.DOUBLON && 'Marquer comme doublon'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Si Résolu : Photo de preuve obligatoire */}
              {targetStatus === ReportStatus.RESOLU && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Photo de preuve de fin de travaux (Obligatoire)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PROOF_PHOTOS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setProofPhotoUrl(p.url)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                          proofPhotoUrl === p.url
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {proofPhotoUrl && (
                    <img
                      src={proofPhotoUrl}
                      alt="Preuve"
                      className="w-full h-24 object-cover rounded-xl mt-2 border border-emerald-200"
                    />
                  )}
                </div>
              )}

              {/* Si Rejeté ou Doublon : Motif */}
              {(targetStatus === ReportStatus.REJETE || targetStatus === ReportStatus.DOUBLON) && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motif du rejet ou du doublon
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Domaine privé hors compétence municipale"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Commentaire technique interne de l'agent
                </label>
                <textarea
                  rows={2}
                  value={agentComment}
                  onChange={(e) => setAgentComment(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleApplyStatusChange}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mise à jour...' : 'Appliquer et synchroniser'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
