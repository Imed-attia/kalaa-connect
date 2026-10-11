import React, { useState } from 'react';
import { UserRole } from '@kalaa-connect/shared';
import { loginWithGoogle, loginWithEmail, registerWithEmail, UserProfile } from '../firebase';
import { X, Mail, Lock, User, Phone, ShieldCheck, CheckCircle2, AlertCircle, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  lang: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, lang }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CITOYEN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err.message || 'Échec de la connexion via Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (tab === 'login') {
        const user = await loginWithEmail(email, password);
        onSuccess(user);
      } else {
        if (!nom.trim()) {
          setError('Veuillez renseigner votre nom complet.');
          setIsLoading(false);
          return;
        }
        const user = await registerWithEmail(email, password, nom, role, telephone);
        onSuccess(user);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth Error:', err);
      let msg = err.message || 'Une erreur est survenue lors de l’authentification.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Identifiants invalides. Vérifiez votre email et mot de passe.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Cette adresse e-mail est déjà associée à un compte.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Le mot de passe doit comporter au moins 6 caractères.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Profiles
  const quickLoginAs = (demoProfile: UserProfile) => {
    onSuccess(demoProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden relative flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Kalaa Connect Auth</h2>
              <p className="text-xs text-sky-100">Municipalité de Kalâa Seghira</p>
            </div>
          </div>
          <p className="text-xs text-sky-50 mt-1">
            Connectez-vous pour signaler des incidents urbains et suivre les interventions en direct.
          </p>

          {/* Tab Selector */}
          <div className="flex rounded-lg bg-black/20 p-1 mt-4">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                tab === 'login' ? 'bg-white text-sky-900 shadow-sm' : 'text-sky-100 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Connexion
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                tab === 'register' ? 'bg-white text-sky-900 shadow-sm' : 'text-sky-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Inscription
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continuer avec Google (Firebase Auth)
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">ou par email</span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {tab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Nada SLAMA"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle au sein de la commune</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 transition-all font-medium"
                  >
                    <option value={UserRole.CITOYEN}>Citoyen résident de Kalâa Seghira</option>
                    <option value={UserRole.AGENT}>Agent technique de terrain (Interventions)</option>
                    <option value={UserRole.ADMIN}>Direction & Supervision (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone (optionnel)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+216 98 123 456"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="nom@exemple.tn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-xs font-semibold transition-all shadow-md hover:shadow-sky-500/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : tab === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Se connecter
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Créer mon compte citoyen
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡ Connexion Rapide de Test (Rôles Démo) :</span>
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickLoginAs({
                  id: 'usr-citoyen-nada',
                  nom: 'Nada SLAMA',
                  email: 'nada.slama@esprit.tn',
                  role: UserRole.CITOYEN,
                  telephone: '+216 98 123 456'
                })}
                className="p-2 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition-colors"
              >
                <div className="font-semibold text-sky-900">Nada SLAMA</div>
                <div className="text-[10px] text-sky-700">Citoyenne ESPRIT</div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs({
                  id: 'usr-admin-dalila',
                  nom: 'Mme Dalila KHLIFA',
                  email: 'dalila.khlifa@commune-kalaaseghira.gov.tn',
                  role: UserRole.ADMIN,
                  titre_poste: 'Directrice Services Techniques & SI'
                })}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors"
              >
                <div className="font-semibold text-emerald-900">Mme Dalila KHLIFA</div>
                <div className="text-[10px] text-emerald-700">Directrice SI (Admin)</div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs({
                  id: 'usr-agent-ali',
                  nom: 'Ali Mansour',
                  email: 'ali.mansour@commune-kalaaseghira.gov.tn',
                  role: UserRole.AGENT,
                  service_id: 'srv-voirie',
                  titre_poste: 'Chef d’équipe Voirie'
                })}
                className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors"
              >
                <div className="font-semibold text-amber-900">Ali Mansour</div>
                <div className="text-[10px] text-amber-700">Agent Voirie & Chaussée</div>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs({
                  id: 'usr-agent-sami',
                  nom: 'Sami Mansour',
                  email: 'sami.mansour@commune-kalaaseghira.gov.tn',
                  role: UserRole.AGENT,
                  service_id: 'srv-proprete',
                  titre_poste: 'Agent Propreté Urbaine'
                })}
                className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-colors"
              >
                <div className="font-semibold text-purple-900">Sami Mansour</div>
                <div className="text-[10px] text-purple-700">Agent Propreté Urbaine</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
