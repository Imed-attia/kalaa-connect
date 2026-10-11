import React, { useState, useEffect } from 'react';
import { AppLanguage, UserRole } from '@kalaa-connect/shared';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { CitizenReportForm } from './components/CitizenReportForm';
import { MyReportsView } from './components/MyReportsView';
import { AgentDashboard } from './components/AgentDashboard';
import { OpenDataStatsView } from './components/OpenDataStatsView';
import { AuthModal } from './components/AuthModal';
import { auth, onAuthStateChanged, UserProfile, logoutUser, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('map');
  const [lang, setLang] = useState<AppLanguage>(AppLanguage.FR);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kalaa_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Écouteur d'état d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: any) => {
      if (fbUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (userSnap.exists()) {
            const profile = userSnap.data() as UserProfile;
            setCurrentUser(profile);
            localStorage.setItem('kalaa_auth_user', JSON.stringify(profile));
          } else {
            const fallback: UserProfile = {
              id: fbUser.uid,
              nom: fbUser.displayName || 'Citoyen Kalâa',
              email: fbUser.email || '',
              role: UserRole.CITOYEN,
            };
            setCurrentUser(fallback);
            localStorage.setItem('kalaa_auth_user', JSON.stringify(fallback));
          }
        } catch {
          // Hors-ligne ou fallback
        }
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('kalaa_auth_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    localStorage.removeItem('kalaa_auth_user');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0 font-sans antialiased text-slate-800">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'map' && (
          <MapView
            lang={lang}
            onSelectReport={() => {}}
            onNewReportClick={() => setCurrentTab('report')}
          />
        )}

        {currentTab === 'report' && (
          <CitizenReportForm
            lang={lang}
            currentUser={currentUser}
            onRequireAuth={() => setIsAuthModalOpen(true)}
            onSuccess={() => setCurrentTab('my-reports')}
          />
        )}

        {currentTab === 'my-reports' && (
          <MyReportsView 
            lang={lang} 
            currentUser={currentUser} 
            onRequireAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'agent' && (
          <AgentDashboard 
            lang={lang} 
            role={currentUser?.role || UserRole.AGENT} 
            currentUser={currentUser}
          />
        )}

        {currentTab === 'stats' && (
          <OpenDataStatsView lang={lang} />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        lang={lang}
      />

      {/* Footer Informative Bar */}
      <footer className="bg-white border-t border-slate-200/80 py-5 px-4 text-center text-xs text-slate-500 mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">© 2026 Kalaa Connect</span>
            <span>·</span>
            <span>Municipalité de Kalâa Seghira (Gouvernorat de Sousse)</span>
          </div>
          <div className="text-slate-400 text-[11px] flex items-center gap-2">
            <span className="bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded border border-sky-100">
              Cloud & DevSecOps
            </span>
            <span>Projet Ingénieur ESPRIT · Nada SLAMA · Encadré par Mme Dalila KHLIFA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
