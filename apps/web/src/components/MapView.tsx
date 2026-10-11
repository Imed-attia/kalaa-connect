import React, { useState, useEffect } from 'react';
import {
  Report,
  AppLanguage,
  ReportStatus,
  KALAA_SOGHRA_COORDINATES,
} from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import { MapPin, Filter, Calendar, CheckCircle, Navigation, PlusCircle, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onSelectReport?: (report: Report) => void;
  onNewReportClick?: () => void;
}

export const MapView: React.FC<Props> = ({ lang, onSelectReport, onNewReportClick }) => {
  const t = TRANSLATIONS[lang];
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const loadReports = async () => {
    setLoading(true);
    const params = selectedStatus !== 'all' ? { statut: selectedStatus } : undefined;
    const data = await apiClient.getReports(params);
    setReports(data);
    if (data.length > 0 && !activeReport) {
      setActiveReport(data[0]);
    }
    setLoading(false);
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
        return { label: 'Résolu', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case ReportStatus.CLOTURE:
        return { label: 'Clôturé', bg: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-sky-700/50">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            Plateforme Municipale Intelligente · Kalâa Seghira
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Cartographie Citoyenne des Interventions Urbaines
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed mb-6">
            Visualisez en temps réel l'ensemble des anomalies urbaines signalées par les habitants et suivies par les équipes techniques de la Municipalité de Kalâa Seghira.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {onNewReportClick && (
              <button
                onClick={onNewReportClick}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-sky-50 text-sky-900 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 text-sky-700" />
                Signaler un incident
              </button>
            )}
            <div className="text-xs text-sky-200 font-medium flex items-center gap-1.5 pl-2">
              <Navigation className="w-3.5 h-3.5 text-teal-300" />
              <span>Centre-Ville : 35.8285° N, 10.5640° E</span>
            </div>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filter and stats bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtrer par état :</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tous' },
            { id: ReportStatus.NOUVEAU, label: 'Nouveaux' },
            { id: ReportStatus.EN_COURS, label: 'En cours' },
            { id: ReportStatus.RESOLU, label: 'Résolus' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedStatus === f.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive OpenStreetMap Leaflet Container */}
        <div className="lg:col-span-2 bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md relative min-h-[460px] flex flex-col">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              Carte Interactive de Kalâa Seghira (OpenStreetMap)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {reports.length} incidents géolocalisés
            </span>
          </div>

          <div className="flex-1 relative bg-slate-100">
            {/* OpenStreetMap iframe */}
            <iframe
              title="Carte Kalâa Seghira"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px' }}
              loading="lazy"
              src="https://www.openstreetmap.org/export/embed.html?bbox=10.5350%2C35.8100%2C10.5850%2C35.8500&layer=mapnik&marker=35.8285%2C10.5640"
            />

            {/* Floating Quick Markers Panel on Map */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1.5">
                <Navigation className="w-3.5 h-3.5 text-sky-600" />
                Sélection rapide des incidents sur le terrain :
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {reports.slice(0, 4).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveReport(r)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left shrink-0 transition-all ${
                      activeReport?.id === r.id
                        ? 'bg-sky-50 border-sky-500 text-sky-900 font-semibold ring-1 ring-sky-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[11px] truncate max-w-[120px]">{r.titre}</div>
                    <div className="text-[10px] text-slate-500">{r.quartier || 'Centre'}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Report Inspector Sidebar */}
        <div className="space-y-4">
          {activeReport ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {activeReport.numero_ticket}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      getStatusBadge(activeReport.statut).bg
                    }`}
                  >
                    {getStatusBadge(activeReport.statut).label}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">
                  {activeReport.titre}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {activeReport.description}
                </p>

                {/* Details grid */}
                <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-500">Quartier :</span>
                    <span className="font-bold text-slate-800">{activeReport.quartier || 'Centre-Ville'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-500">Adresse :</span>
                    <span className="truncate max-w-[180px] font-medium text-slate-800">
                      {activeReport.adresse_approximative || 'Kalâa Seghira'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold text-slate-500">Coordonnées GPS :</span>
                    <span className="font-mono text-[11px] font-semibold text-slate-800">
                      {activeReport.latitude.toFixed(4)}°, {activeReport.longitude.toFixed(4)}°
                    </span>
                  </div>
                </div>

                {/* Photo Preview */}
                {activeReport.photo_url && (
                  <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 mb-4">
                    <img
                      src={activeReport.photo_url}
                      alt={activeReport.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeReport.latitude},${activeReport.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ouvrir l'itinéraire GPS Google Maps</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md text-center py-20">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Sélectionnez un signalement sur la carte pour voir ses détails.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
