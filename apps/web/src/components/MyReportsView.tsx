import React, { useState, useEffect } from 'react';
import { Report, AppLanguage, ReportStatus } from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import { CheckCircle2, Clock, MapPin, Calendar, Check, AlertTriangle } from 'lucide-react';

interface Props {
  lang: AppLanguage;
}

export const MyReportsView: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await apiClient.getReports();
    setReports(data);
    setLoading(false);
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
      loadReports();
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la clôture');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{t.nav.myReports}</h2>
        <p className="text-sm text-slate-500">
          Suivez l’état d’avancement de vos signalements auprès de la municipalité de Kalâa Seghira
        </p>
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

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {t.status[report.statut] || report.statut}
                </span>
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

                {/* Si le ticket est résolu, le citoyen peut confirmer la clôture */}
                {report.statut === ReportStatus.RESOLU && (
                  <button
                    onClick={() => handleConfirmClose(report.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirmer la clôture du ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
