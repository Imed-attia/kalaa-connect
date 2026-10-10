import React, { useState, useEffect } from 'react';
import {
  Report,
  AppLanguage,
  ReportStatus,
  KALAA_SOGHRA_COORDINATES,
} from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import { MapPin, Filter, Calendar, CheckCircle } from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onSelectReport?: (report: Report) => void;
}

export const MapView: React.FC<Props> = ({ lang, onSelectReport }) => {
  const t = TRANSLATIONS[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const loadReports = async () => {
    const params = selectedStatus !== 'all' ? { statut: selectedStatus } : undefined;
    const data = await apiClient.getReports(params);
    setReports(data);
    if (data.length > 0 && !activeReport) {
      setActiveReport(data[0]);
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.NOUVEAU:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ReportStatus.ACCEPTE:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case ReportStatus.EN_COURS:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case ReportStatus.RESOLU:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case ReportStatus.CLOTURE:
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Barre de filtres supérieurs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-500" />
          <span className="font-semibold text-slate-800 text-sm">{t.nav.map}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {reports.length} incidents
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            aria-label="Filtrer par état"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tous les statuts / كل الحالات</option>
            <option value={ReportStatus.NOUVEAU}>{t.status[ReportStatus.NOUVEAU]}</option>
            <option value={ReportStatus.ACCEPTE}>{t.status[ReportStatus.ACCEPTE]}</option>
            <option value={ReportStatus.EN_COURS}>{t.status[ReportStatus.EN_COURS]}</option>
            <option value={ReportStatus.RESOLU}>{t.status[ReportStatus.RESOLU]}</option>
            <option value={ReportStatus.CLOTURE}>{t.status[ReportStatus.CLOTURE]}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vue Carte Interactive OpenStreetMap (Iframe OSM centré sur Kalâa Seghira) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[520px]">
          <div className="relative flex-1 w-full h-full bg-slate-100">
            {/* Embed cartographique OpenStreetMap direct et sans token externe */}
            <iframe
              title="Carte OpenStreetMap Kalâa Seghira"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=10.5300%2C35.8100%2C10.5900%2C35.8500&amp;layer=mapnik&amp;marker=${activeReport ? activeReport.latitude : KALAA_SOGHRA_COORDINATES.latitude}%2C${activeReport ? activeReport.longitude : KALAA_SOGHRA_COORDINATES.longitude}`}
            />
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>© Contributeurs OpenStreetMap · Tuiles libres</span>
            <span className="font-semibold text-green-700">Kalâa Seghira, Sousse</span>
          </div>
        </div>

        {/* Liste latérale des signalements cliquables */}
        <div className="space-y-3 h-[520px] overflow-y-auto pr-1">
          {reports.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200 text-slate-500">
              Aucun incident trouvé pour ce filtre.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  setActiveReport(report);
                  if (onSelectReport) onSelectReport(report);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-smooth bg-white ${
                  activeReport?.id === report.id
                    ? 'border-green-500 ring-2 ring-green-100 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-600">
                    #{report.numero_ticket}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getStatusColor(
                      report.statut,
                    )}`}
                  >
                    {t.status[report.statut] || report.statut}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">
                  {report.titre}
                </h4>

                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {report.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {report.quartier || 'Kalâa Seghira'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.cree_le).toLocaleDateString(
                      lang === AppLanguage.FR ? 'fr-FR' : 'ar-TN',
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
