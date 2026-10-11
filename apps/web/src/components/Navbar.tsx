import React from 'react';
import { AppLanguage, UserRole } from '@kalaa-connect/shared';
import { TRANSLATIONS } from '../i18n';
import { UserProfile } from '../firebase';
import { MapPin, PlusCircle, FileText, ShieldAlert, BarChart3, Globe, LogIn, LogOut, Wifi, WifiOff } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  currentUser,
  onOpenAuth,
  onLogout,
  isOnline,
}) => {
  const t = TRANSLATIONS[lang];

  const toggleLanguage = () => {
    const nextLang = lang === AppLanguage.FR ? AppLanguage.AR : AppLanguage.FR;
    setLang(nextLang);
    document.documentElement.setAttribute('lang', nextLang);
    document.documentElement.setAttribute('dir', nextLang === AppLanguage.AR ? 'rtl' : 'ltr');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return { label: 'Directrice SI / Admin', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case UserRole.AGENT:
        return { label: 'Agent Municipal', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: 'Citoyen', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Commune Identity */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => setCurrentTab('map')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <MapPin className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">
                  Kalaa Connect
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 uppercase tracking-wider border border-red-200">
                  ESPRIT
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {lang === AppLanguage.AR ? 'بلدية القلعة الصغرى' : 'Municipalité de Kalâa Seghira'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setCurrentTab('map')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'map'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {t.nav.map}
            </button>

            <button
              onClick={() => setCurrentTab('report')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'report'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t.nav.report}
            </button>

            <button
              onClick={() => setCurrentTab('my-reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'my-reports'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {t.nav.myReports}
            </button>

            {/* Agent / Admin Workspace Tab */}
            {currentUser && (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.ADMIN) && (
              <button
                onClick={() => setCurrentTab('agent')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'agent'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-800 hover:bg-amber-100/60'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {currentUser.role === UserRole.ADMIN ? 'Supervision Municipale' : t.nav.agentDashboard}
              </button>
            )}

            <button
              onClick={() => setCurrentTab('stats')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'stats'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {t.nav.stats}
            </button>
          </nav>

          {/* Right Controls: Online Status, Lang Toggle, Auth */}
          <div className="flex items-center gap-2.5">
            {/* Online/Offline indicator */}
            <div
              className={`hidden lg:flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full border ${
                isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={isOnline ? 'En ligne avec synchronisation Cloud Firestore' : 'Mode hors-ligne'}
            >
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
              <span>{isOnline ? 'Cloud Synced' : 'Hors-ligne'}</span>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
              title="Changer de langue / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === AppLanguage.FR ? 'AR (عربي)' : 'FR (Français)'}</span>
            </button>

            {/* Authentication state */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                    {currentUser.nom.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                      {currentUser.nom}
                    </div>
                    <span className={`text-[10px] font-semibold px-1 rounded border inline-block ${getRoleBadge(currentUser.role).bg}`}>
                      {getRoleBadge(currentUser.role).label}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold shadow-sm hover:shadow-sky-500/20 transition-all active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Connexion</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (PWA Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium ${
            currentTab === 'map' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Carte</span>
        </button>

        <button
          onClick={() => setCurrentTab('report')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium ${
            currentTab === 'report' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Signaler</span>
        </button>

        <button
          onClick={() => setCurrentTab('my-reports')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium ${
            currentTab === 'my-reports' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Mes tickets</span>
        </button>

        {currentUser && (currentUser.role === UserRole.AGENT || currentUser.role === UserRole.ADMIN) && (
          <button
            onClick={() => setCurrentTab('agent')}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium ${
              currentTab === 'agent' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Agent</span>
          </button>
        )}

        <button
          onClick={() => setCurrentTab('stats')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium ${
            currentTab === 'stats' ? 'text-sky-600 font-bold' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Stats</span>
        </button>
      </div>
    </header>
  );
};
