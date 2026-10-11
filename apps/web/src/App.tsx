import React, { useState, useEffect } from 'react';
import { AppLanguage, UserRole } from '@kalaa-connect/shared';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { CitizenReportForm } from './components/CitizenReportForm';
import { MyReportsView } from './components/MyReportsView';
import { AgentDashboard } from './components/AgentDashboard';
import { OpenDataStatsView } from './components/OpenDataStatsView';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('map');
  const [lang, setLang] = useState<AppLanguage>(AppLanguage.FR);
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.CITOYEN);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        isOnline={isOnline}
      />

      <main className="flex-1">
        {currentTab === 'map' && (
          <MapView
            lang={lang}
            onSelectReport={() => {}}
          />
        )}

        {currentTab === 'report' && (
          <CitizenReportForm
            lang={lang}
            onSuccess={() => setCurrentTab('my-reports')}
          />
        )}

        {currentTab === 'my-reports' && (
          <MyReportsView lang={lang} />
        )}

        {currentTab === 'agent' && (
          <AgentDashboard lang={lang} role={activeRole} />
        )}

        {currentTab === 'stats' && (
          <OpenDataStatsView lang={lang} />
        )}
      </main>

      {/* Footer informatif */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Kalaa Connect — Plateforme Citoyenne de la Municipalité de Kalâa Seghira.
          </span>
          <span className="text-slate-400">
            Projet de stage ingénieur ESPRIT · Option Cloud & DevSecOps · Développé par Nada SLAMA · Encadré par Mme Dalila KHLIFA
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
