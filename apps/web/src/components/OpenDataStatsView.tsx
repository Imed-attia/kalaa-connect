import React, { useState, useEffect } from 'react';
import { OpenDataStats, AppLanguage } from '@kalaa-connect/shared';
import { apiClient } from '../api';
import { TRANSLATIONS } from '../i18n';
import { BarChart3, Clock, CheckCircle2, MapPin, FileSpreadsheet, ShieldCheck, Activity, Award, TrendingUp } from 'lucide-react';

interface Props {
  lang: AppLanguage;
}

export const OpenDataStatsView: React.FC<Props> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [stats, setStats] = useState<OpenDataStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getOpenDataStats().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Chargement des indicateurs Open Data municipaux...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Transparence Municipale · Données Ouvertes Publiques (Zéro PII)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lang === AppLanguage.AR ? 'المؤشرات والبيانات المفتوحة للبلدية' : 'Observatoire & Indicateurs Open Data'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Indicateurs de performance municipale, taux de résolution et cartographie analytique de Kalâa Seghira.
          </p>
        </div>

        <a
          href="/api/open-data/export.csv"
          download="kalaa-connect-opendata.csv"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto active:scale-[0.98]"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exporter le jeu de données CSV</span>
        </a>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Total des signalements
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats.total_signalements}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              Territoire communal couvert à 100%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Taux de résolution
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {stats.taux_resolution_pourcentage}%
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Tickets résolus ou clôturés
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
              Délai moyen d'intervention
            </span>
            <span className="text-2xl font-black text-slate-900">
              {stats.delai_moyen_resolution_heures}h
            </span>
            <span className="text-[10px] text-sky-600 font-semibold block mt-0.5">
              Prise en charge rapide garantie
            </span>
          </div>
        </div>
      </div>

      {/* Progress & Breakdown Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statut Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              État d’avancement des interventions
            </h3>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {[
              { label: 'Nouveaux signalements', count: stats.signalements_par_statut?.nouveau || 0, color: 'bg-blue-500' },
              { label: 'Pris en charge & Acceptés', count: stats.signalements_par_statut?.accepte || 0, color: 'bg-indigo-500' },
              { label: 'Interventions en cours sur le terrain', count: stats.signalements_par_statut?.en_cours || 0, color: 'bg-amber-500' },
              { label: 'Travaux résolus & confirmés', count: (stats.signalements_par_statut?.resolu || 0) + (stats.signalements_par_statut?.cloture || 0), color: 'bg-emerald-500' },
            ].map((item) => {
              const pct = stats.total_signalements > 0 ? Math.round((item.count / stats.total_signalements) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-500 font-mono">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quartier Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Répartition par secteur municipal (Kalâa Seghira)
            </h3>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {(stats.repartition_quartiers || []).map((q: any) => {
              const maxCount = Math.max(...(stats.repartition_quartiers || []).map((x: any) => x.total), 1);
              const pct = Math.round((q.total / maxCount) * 100);
              return (
                <div key={q.quartier}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{q.quartier}</span>
                    <span className="text-slate-500 font-mono">{q.total} incidents</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
