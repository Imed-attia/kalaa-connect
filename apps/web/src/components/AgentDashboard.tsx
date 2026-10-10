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
import {
  ShieldAlert,
  Filter,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Camera,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface Props {
  lang: AppLanguage;
  role: UserRole;
}

export const AgentDashboard: React.FC<Props> = ({ lang, role }) => {
  const t = TRANSLATIONS[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [services, setServices] = useState<MunicipalService[]>(DEFAULT_MUNICIPAL_SERVICES as any);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modal de changement de statut
  const [activeModalReport, setActiveModalReport] = useState<Report | null>(null);
  const [targetStatus, setTargetStatus] = useState<ReportStatus>(ReportStatus.ACCEPTE);
  const [proofPhotoUrl, setProofPhotoUrl] = useState<string>('');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [agentComment, setAgentComment] = useState<string>('');
  const [modalError, setModalError] = useState<string | null>(null);

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

  const handleOpenStatusModal = (report: Report) => {
    setActiveModalReport(report);
    const allowed = ALLOWED_TRANSITIONS[report.statut] || [];
    setTargetStatus(allowed[0] || ReportStatus.EN_COURS);
    setProofPhotoUrl('');
    setRejectReason('');
    setAgentComment('');
    setModalError(null);
  };

  const handleApplyStatusChange = async () => {
    if (!activeModalReport) return;

    if (targetStatus === ReportStatus.RESOLU && !proofPhotoUrl) {
      setModalError(t.agent.proofPhotoRequired);
      return;
    }

    if ((targetStatus === ReportStatus.REJETE || targetStatus === ReportStatus.DOUBLON) && !rejectReason) {
      setModalError(t.agent.rejectReasonRequired);
      return;
    }

    try {
      await apiClient.updateReportStatus(
        activeModalReport.id,
        {
          nouveau_statut: targetStatus,
          photo_preuve_url: proofPhotoUrl || undefined,
          motif_rejet_ou_doublon: rejectReason || undefined,
          commentaire: agentComment || undefined,
        },
        'test-token-agent',
      );

      setActiveModalReport(null);
      loadDashboardData();
    } catch (err: any) {
      setModalError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-green-700" />
            <h2 className="text-2xl font-bold text-slate-900">{t.agent.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.agent.subtitle}</p>
        </div>

        {/* Bouton Export CSV */}
        <a
          href="/api/open-data/export.csv"
          download="signalements-municipaux.csv"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-sm transition-colors"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Exporter CSV</span>
        </a>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filtres :</span>
        </div>

        <select
          aria-label="Filtrer par service municipal"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-green-500"
        >
          <option value="all">{t.agent.allServices}</option>
          {services.map((srv) => (
            <option key={srv.id} value={srv.id}>
              {lang === AppLanguage.FR ? srv.nom : srv.nom_ar}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrer par statut du ticket"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-green-500"
        >
          <option value="all">{t.agent.allStatuses}</option>
          <option value={ReportStatus.NOUVEAU}>{t.status[ReportStatus.NOUVEAU]}</option>
          <option value={ReportStatus.ACCEPTE}>{t.status[ReportStatus.ACCEPTE]}</option>
          <option value={ReportStatus.EN_COURS}>{t.status[ReportStatus.EN_COURS]}</option>
          <option value={ReportStatus.RESOLU}>{t.status[ReportStatus.RESOLU]}</option>
          <option value={ReportStatus.CLOTURE}>{t.status[ReportStatus.CLOTURE]}</option>
          <option value={ReportStatus.REJETE}>{t.status[ReportStatus.REJETE]}</option>
        </select>
      </div>

      {/* Tableau des tickets */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">{t.agent.ticketNum}</th>
                <th className="px-4 py-3">{t.agent.incident}</th>
                <th className="px-4 py-3">Quartier</th>
                <th className="px-4 py-3">{t.agent.statusCol}</th>
                <th className="px-4 py-3">{t.agent.date}</th>
                <th className="px-4 py-3 text-right">{t.agent.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    #{report.numero_ticket}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{report.titre}</span>
                    <span className="text-[11px] text-slate-400">{report.description}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {report.quartier || 'Kalâa Seghira'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {t.status[report.statut] || report.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(report.cree_le).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenStatusModal(report)}
                      className="px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-md font-semibold text-xs transition-colors"
                    >
                      {t.agent.changeStatus}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de transition de statut */}
      {activeModalReport && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Modifier le statut : #{activeModalReport.numero_ticket}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{activeModalReport.titre}</p>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nouveau statut cible (Machine à états)
                </label>
                <select
                  aria-label="Sélectionner le nouveau statut"
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as ReportStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                >
                  {(ALLOWED_TRANSITIONS[activeModalReport.statut] || []).map((st) => (
                    <option key={st} value={st}>
                      {t.status[st] || st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Champ photo de preuve si statut RESOLU */}
              {targetStatus === ReportStatus.RESOLU && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Photo de preuve après intervention (Obligatoire)
                  </label>
                  <input
                    type="text"
                    value={proofPhotoUrl}
                    onChange={(e) => setProofPhotoUrl(e.target.value)}
                    placeholder="URL ou lien de la photo prise sur le terrain"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-emerald-300 bg-white"
                  />
                  <span className="text-[10px] text-emerald-600 block mt-1">
                    Les règles serveur refusent la résolution sans photo de preuve.
                  </span>
                </div>
              )}

              {/* Champ motif obligatoire si rejet ou doublon */}
              {(targetStatus === ReportStatus.REJETE || targetStatus === ReportStatus.DOUBLON) && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-800 mb-1">
                    Motif obligatoire du rejet ou doublon
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ex: Hors compétence municipale, ou doublon avec #KC-2026-0002"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-amber-300 bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note d’intervention / Commentaire
                </label>
                <textarea
                  rows={2}
                  value={agentComment}
                  onChange={(e) => setAgentComment(e.target.value)}
                  placeholder="Remarques éventuelles pour le dossier"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setActiveModalReport(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                {t.agent.cancel}
              </button>
              <button
                onClick={handleApplyStatusChange}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 shadow-sm"
              >
                {t.agent.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
