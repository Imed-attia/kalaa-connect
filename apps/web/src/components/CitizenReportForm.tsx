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
import { Camera, MapPin, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  lang: AppLanguage;
  onSuccess: () => void;
}

export const CitizenReportForm: React.FC<Props> = ({ lang, onSuccess }) => {
  const t = TRANSLATIONS[lang];

  const [categories, setCategories] = useState<ReportCategory[]>(DEFAULT_CATEGORIES as any);
  const [selectedCatId, setSelectedCatId] = useState<string>(DEFAULT_CATEGORIES[0].id);
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState(KALAA_SOGHRA_COORDINATES.latitude);
  const [longitude, setLongitude] = useState(KALAA_SOGHRA_COORDINATES.longitude);
  const [quartier, setQuartier] = useState(KALAA_SOGHRA_QUARTIERS[0].nom);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    apiClient.getCategories().then(setCategories);

    // Chargement du brouillon s'il existe
    const draft = localStorage.getItem('kalaa_report_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.titre) setTitre(parsed.titre);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.categorie_id) setSelectedCatId(parsed.categorie_id);
      } catch {}
    }
  }, []);

  // Détection GPS réelle ou coordonnées de Kalâa Seghira
  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          // Coordonnées par défaut Centre-Ville Kalâa Seghira
          setLatitude(KALAA_SOGHRA_COORDINATES.latitude);
          setLongitude(KALAA_SOGHRA_COORDINATES.longitude);
        },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setErrorMsg(lang === AppLanguage.FR ? 'La photo dépasse la taille maximale de 1 Mo' : 'حجم الصورة يتجاوز 1 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setErrorMsg(null);

      // Déclenchement de l'analyse IA Gemini en arrière-plan
      setAiAnalyzing(true);
      try {
        const aiRes = await apiClient.classifyWithAi(base64, selectedCatId);
        if (aiRes?.categorie_proposee_id) {
          setSelectedCatId(aiRes.categorie_proposee_id);
          const catName = lang === AppLanguage.FR ? aiRes.categorie_nom_fr : aiRes.categorie_nom_ar;
          setAiSuggestion(`${t.form.aiSuggested} : ${catName} (${Math.round((aiRes.score_confiance || 0.8) * 100)}%)`);
        }
      } catch {
      } finally {
        setAiAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoPreview) {
      setErrorMsg(lang === AppLanguage.FR ? 'Veuillez joindre une photo de l’anomalie' : 'يرجى إرفاق صورة للمشكل');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        titre: titre || (lang === AppLanguage.FR ? 'Signalement citoyen' : 'بلاغ مواطن'),
        description,
        categorie_id: selectedCatId,
        latitude,
        longitude,
        quartier,
        photo_url: photoPreview,
      };

      await apiClient.createReport(payload);
      localStorage.removeItem('kalaa_report_draft');
      setSuccessMsg(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de l’envoi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm my-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t.form.title}</h2>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
          &lt; 60 sec
        </span>
      </div>

      {successMsg ? (
        <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200 text-green-800">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold">{t.form.successTitle}</h3>
          <p className="text-sm mt-1">{t.form.successMessage}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Photo Capture */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t.form.photoLabel} <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-green-500 transition-colors">
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Aperçu"
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview('')}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md"
                  >
                    Changer
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center gap-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{t.form.takePhoto}</span>
                  <span className="text-xs text-slate-400">{t.form.photoHint}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>

            {aiAnalyzing && (
              <div className="flex items-center gap-2 text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t.form.aiDetecting}</span>
              </div>
            )}

            {aiSuggestion && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 mt-2 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{aiSuggestion}</span>
              </div>
            )}
          </div>

          {/* 2. Catégorie */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t.form.categoryLabel}
            </label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {lang === AppLanguage.FR ? cat.nom_fr : cat.nom_ar}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Titre & Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t.form.titleLabel}
            </label>
            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder={t.form.titlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t.form.descLabel}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.form.descPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* 4. Localisation & Quartier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Quartier (Kalâa Seghira)
              </label>
              <select
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-green-500"
              >
                {KALAA_SOGHRA_QUARTIERS.map((q) => (
                  <option key={q.nom} value={q.nom}>
                    {lang === AppLanguage.FR ? q.nom : q.nom_ar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t.form.locationLabel}
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-green-600" />
                <span>{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
              </button>
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 active:scale-[0.99] transition-all shadow-md shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? t.form.submitting : t.form.submit}</span>
          </button>
        </form>
      )}
    </div>
  );
};
