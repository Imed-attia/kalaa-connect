import React from 'react';
import { AppLanguage, UserRole } from '@kalaa-connect/shared';
import { TRANSLATIONS } from '../i18n';
import { MapPin, PlusCircle, FileText, ShieldAlert, BarChart3, Globe, User } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  activeRole,
  setActiveRole,
  isOnline,
}) => {
  const t = TRANSLATIONS[lang];

  const toggleLanguage = () => {
    const nextLang = lang === AppLanguage.FR ? AppLanguage.AR : AppLanguage.FR;
    setLang(nextLang);
    document.documentElement.setAttribute('lang', nextLang);
    document.documentElement.setAttribute('dir', nextLang === AppLanguage.AR ? 'rtl' : 'ltr');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et Nom de l'application */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('map')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-500/20">
              <MapPin className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                {t.appName}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t.municipality}
              </span>
            </div>
          </div>

          {/* Navigation Principale Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                currentTab === 'map'
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {t.nav.map}
            </button>

            <button
              onClick={() => setCurrentTab('report')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                currentTab === 'report'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              {t.nav.report}
            </button>

            <button
              onClick={() => setCurrentTab('my-reports')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                currentTab === 'my-reports'
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              {t.nav.myReports}
            </button>

            <button
              onClick={() => setCurrentTab('agent')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                currentTab === 'agent'
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              {t.nav.agentDashboard}
            </button>

            <button
              onClick={() => setCurrentTab('stats')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-smooth ${
                currentTab === 'stats'
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              {t.nav.stats}
            </button>
          </nav>

          {/* Sélecteurs Rôle & Langue & État Réseau */}
          <div className="flex items-center gap-2">
            {!isOnline && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                {t.nav.offlineMode}
              </span>
            )}

            {/* Sélecteur de Persona / Rôle de test */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <User className="w-3.5 h-3.5 text-slate-500 mr-1 ml-1" />
              <select
                aria-label="Rôle utilisateur de test"
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-transparent border-0 text-slate-700 font-medium focus:ring-0 cursor-pointer text-xs pr-2"
              >
                <option value={UserRole.CITOYEN}>Citoyen</option>
                <option value={UserRole.AGENT}>Agent Municipal</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>

            {/* Bouton de bascule de langue */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Changer de langue / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{t.nav.switchLang}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Mobile en bas d'écran (PWA App Bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex justify-around py-2 px-1 shadow-lg">
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${
            currentTab === 'map' ? 'text-green-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>{t.nav.map}</span>
        </button>

        <button
          onClick={() => setCurrentTab('report')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${
            currentTab === 'report' ? 'text-green-600 font-bold' : 'text-slate-500'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>{t.nav.report}</span>
        </button>

        <button
          onClick={() => setCurrentTab('my-reports')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${
            currentTab === 'my-reports' ? 'text-green-600 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>{t.nav.myReports}</span>
        </button>

        <button
          onClick={() => setCurrentTab('agent')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${
            currentTab === 'agent' ? 'text-green-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span>{t.nav.agentDashboard}</span>
        </button>

        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium ${
            currentTab === 'stats' ? 'text-green-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>{t.nav.stats}</span>
        </button>
      </div>
    </header>
  );
};
