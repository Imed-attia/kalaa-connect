import React, { useState, useEffect } from 'react';
import { OpenDataStats, AppLanguage } from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import { BarChart3, Clock, CheckCircle2, MapPin, FileSpreadsheet, ShieldCheck } from 'lucide-react';

interface Props {
  lang: AppLanguage;
}

export const OpenDataStatsView: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [stats, setStats] = useState<OpenDataStats | null>(null);

  useEffect(() => {
    apiClient.getOpenDataStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400">
        Chargement des indicateurs Open Data...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-slate-900">{t.stats.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t.stats.subtitle}</p>
        </div>

        <a
          href="/api/open-data/export.csv"
          download="kalaa-connect-opendata.csv"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-green-600/20 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{t.stats.exportCsv}</span>
        </a>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {t.stats.totalIncidents}
            </span>
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.total_signalements}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {t.stats.avgDelay}
            </span>
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.delai_moyen_resolution_heures} h
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">
              {t.stats.resolutionRate}
            </span>
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.taux_resolution_pourcentage} %
            </span>
          </div>
        </div>
      </div>

      {/* Détails par catégorie & par quartier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Par Catégorie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            {t.stats.byCategory}
          </h3>
          <div className="space-y-3">
            {stats.signalements_par_categorie.map((cat) => (
              <div key={cat.categorie_id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">
                    {lang === AppLanguage.FR ? cat.categorie_nom_fr : cat.categorie_nom_ar}
                  </span>
                  <span className="font-bold text-slate-900">{cat.total}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${stats.total_signalements ? (cat.total / stats.total_signalements) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Par Quartier (Carte thermique agrégée) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">
            {t.stats.byNeighborhood}
          </h3>
          <div className="space-y-3">
            {stats.repartition_quartiers.map((q) => (
              <div key={q.quartier} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{q.quartier}</span>
                  <span className="font-bold text-slate-900">{q.total} incidents</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: `${stats.total_signalements ? (q.total / stats.total_signalements) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notice de conformité et respect de la vie privée */}
      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3 text-emerald-800 text-xs">
        <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
        <span>
          Données conformes à la loi organique tunisienne n° 2004-63 et aux recommandations de l'INPDP. Aucune donnée à caractère personnel (nom, coordonnées, métadonnées privées) n’est divulguée.
        </span>
      </div>
    </div>
  );
};
