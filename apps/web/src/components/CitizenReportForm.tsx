import React, { useState, useEffect } from 'react';
import {
  AppLanguage,
  ReportCategory,
  KALAA_SOGHRA_COORDINATES,
  KALAA_SOGHRA_QUARTIERS,
  DEFAULT_CATEGORIES,
} from '@kalaa-connect/shared';
import { TRANSLATIONS } from '../i18n';
import { apiClient } from '../api';
import { UserProfile } from '../firebase';
import { Camera, MapPin, Sparkles, CheckCircle2, AlertCircle, Loader2, Navigation, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface Props {
  lang: AppLanguage;
  currentUser: UserProfile | null;
  onRequireAuth: () => void;
  onSuccess: () => void;
}

const SAMPLE_PHOTOS = [
  { label: 'Nid-de-poule', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600' },
  { label: 'Lampadaire éteint', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600' },
  { label: 'Dépôt ordures', url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600' },
  { label: 'Branche dangereuse', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600' },
];

export const CitizenReportForm: React.FC<Props> = ({ lang, currentUser, onRequireAuth, onSuccess }) => {
  const t = TRANSLATIONS[lang];

  const [categories, setCategories] = useState<ReportCategory[]>(DEFAULT_CATEGORIES as any);
  const [selectedCatId, setSelectedCatId] = useState<string>(DEFAULT_CATEGORIES[0].id);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(KALAA_SOGHRA_COORDINATES.latitude);
  const [longitude, setLongitude] = useState(KALAA_SOGHRA_COORDINATES.longitude);
  const [quartier, setQuartier] = useState(KALAA_SOGHRA_QUARTIERS[0].nom);
  const [adresse, setAdresse] = useState('Avenue Habib Bourguiba, Kalâa Seghira');
  const [photoPreview, setPhotoPreview] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    apiClient.getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setCategories(cats);
        setSelectedCatId(cats[0].id);
      }
    });

    const draft = localStorage.getItem('kalaa_report_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.titre) setTitre(parsed.titre);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.categorie_id) setSelectedCatId(parsed.categorie_id);
        if (parsed.photo_url) setPhotoPreview(parsed.photo_url);
      } catch {}
    }
  }, []);

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(5)));
          setLongitude(Number(pos.coords.longitude.toFixed(5)));
          setIsLocating(false);
        },
        () => {
          setLatitude(KALAA_SOGHRA_COORDINATES.latitude);
          setLongitude(KALAA_SOGHRA_COORDINATES.longitude);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    } else {
      setIsLocating(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('La photo dépasse la taille maximale autorisée (2 Mo).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!titre.trim()) {
      setErrorMsg('Veuillez renseigner un titre pour le signalement.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const selectedCategory = categories.find((c) => c.id === selectedCatId);
      const payload = {
        titre: titre.trim(),
        description: description.trim() || 'Signalement d’anomalie urbaine enregistré par le citoyen.',
        categorie_id: selectedCatId,
        latitude,
        longitude,
        quartier,
        adresse_approximative: adresse,
        photo_url: photoPreview || SAMPLE_PHOTOS[0].url,
        auteur_id: currentUser?.id || 'usr-citoyen-nada',
      };

      await apiClient.createReport(payload);
      localStorage.removeItem('kalaa_report_draft');
      setSuccessMsg(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      console.error('Submit report error:', err);
      setErrorMsg(err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Service Public Municipal · Kalâa Seghira
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {lang === AppLanguage.AR ? 'إيداع بلاغ بلدي جديد' : 'Signaler une anomalie urbaine'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {lang === AppLanguage.AR
                ? 'ساعد فرق البلدية في التدخل السريع بإرسال موقع وصورة العطب'
                : 'Contribuez à l’amélioration du cadre de vie en signalant un dysfonctionnement à nos services.'}
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 inline-block">
              ⚡ Traitement &lt; 48h
            </span>
          </div>
        </div>

        {successMsg ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 animate-scaleUp">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold">Signalement Enregistré avec Succès !</h3>
            <p className="text-xs text-emerald-700 mt-1">
              Votre ticket a été synchronisé dans Cloud Firestore et transmis aux services techniques municipaux.
            </p>
            <div className="mt-4 text-xs font-semibold text-emerald-800">
              Redirection automatique vers vos signalements...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Catégorie d'anomalie */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Nature de l'anomalie
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedCatId;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-3 rounded-xl text-left border text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/70 text-sky-900 shadow-xs ring-1 ring-sky-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">
                        {lang === AppLanguage.AR ? cat.nom_ar : cat.nom_fr}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Titre et Description */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  2. Titre du signalement
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Nid-de-poule profond devant la pharmacie centrale"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={3}
                  placeholder="Précisez la gravité du problème, le repère visuel dans la rue, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* 3. Localisation & Quartier */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Localisation à Kalâa Seghira
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 transition-colors disabled:opacity-60"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{isLocating ? 'Géolocalisation...' : 'Détecter ma position GPS'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Quartier municipal</label>
                  <select
                    value={quartier}
                    onChange={(e) => setQuartier(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-medium"
                  >
                    {KALAA_SOGHRA_QUARTIERS.map((q) => (
                      <option key={q.nom} value={q.nom}>
                        {q.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Rue / Adresse</label>
                  <input
                    type="text"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  Coordonnées GPS précises :
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
              </div>
            </div>

            {/* 4. Photo du problème */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                4. Photo du constat
              </label>

              {/* Upload or Sample Photo Pickers */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-sky-400 bg-sky-50 hover:bg-sky-100/70 text-sky-700 text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Choisir une photo depuis mon appareil</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-slate-400 hidden sm:inline">ou sélectionner un exemple :</span>
                </div>

                {/* Sample badges */}
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PHOTOS.map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => setPhotoPreview(sample.url)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        photoPreview === sample.url
                          ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>

                {/* Preview Image */}
                {photoPreview && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video max-h-48 bg-slate-100 shadow-inner">
                    <img
                      src={photoPreview}
                      alt="Constat de l'anomalie"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Photo prête pour transmission
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 active:scale-[0.99] text-white text-sm font-bold shadow-md hover:shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement dans Cloud Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmer et Transmettre mon Signalement</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
