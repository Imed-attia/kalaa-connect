import { MunicipalServiceCode } from './enums';

/**
 * Coordonnées géographiques de la municipalité de Kalâa Seghira (Sousse, Tunisie)
 */
export const KALAA_SOGHRA_COORDINATES = {
  latitude: 35.8278,
  longitude: 10.5647,
  zoomParDefaut: 14,
  bounds: {
    minLat: 35.8000,
    maxLat: 35.8600,
    minLng: 10.5200,
    maxLng: 10.6100,
  },
};

/**
 * Liste des quartiers de Kalâa Seghira
 */
export const KALAA_SOGHRA_QUARTIERS = [
  { nom: 'Centre-Ville', nom_ar: 'وسط المدينة', lat: 35.8278, lng: 10.5647 },
  { nom: 'El Manar', nom_ar: 'المنار', lat: 35.8320, lng: 10.5610 },
  { nom: 'Cité El Bassatine', nom_ar: 'حي البساتين', lat: 35.8210, lng: 10.5690 },
  { nom: 'Cité Ennour', nom_ar: 'حي النور', lat: 35.8350, lng: 10.5580 },
  { nom: 'Route de Sousse', nom_ar: 'طريق سوسة', lat: 35.8300, lng: 10.5750 },
  { nom: 'Zone Industrielle', nom_ar: 'المنطقة الصناعية', lat: 35.8180, lng: 10.5520 },
  { nom: 'Oued Laya', nom_ar: 'وادي لاية', lat: 35.8400, lng: 10.5650 },
];

/**
 * Services municipaux référencés
 */
export const DEFAULT_MUNICIPAL_SERVICES = [
  {
    id: 'srv-voirie',
    code: MunicipalServiceCode.VOIRIE,
    nom: 'Voirie & Chaussée',
    nom_ar: 'الطرقات والمسالك',
    description: 'Entretien des routes, trottoirs, nids-de-poule et signalisation routière',
    actif: true,
  },
  {
    id: 'srv-eclairage',
    code: MunicipalServiceCode.ECLAIRAGE,
    nom: 'Éclairage Public',
    nom_ar: 'الإنارة العمومية',
    description: 'Pannes de réverbères, câbles apparents, coupures d’éclairage nocturne',
    actif: true,
  },
  {
    id: 'srv-proprete',
    code: MunicipalServiceCode.PROPRETE,
    nom: 'Propreté & Gestion des Déchets',
    nom_ar: 'النظافة والتصرف في الفضلات',
    description: 'Bennes pleines, dépôts sauvages d’ordures, débris de chantiers',
    actif: true,
  },
  {
    id: 'srv-espaces-verts',
    code: MunicipalServiceCode.ESPACES_VERTS,
    nom: 'Espaces Verts & Environnement',
    nom_ar: 'المساحات الخضراء والبيئة',
    description: 'Arbres dangereux, entretien des jardins publics, terrains vagues',
    actif: true,
  },
];

/**
 * Catégories par défaut bilingues
 */
export const DEFAULT_CATEGORIES = [
  {
    id: 'cat-nid-de-poule',
    service_id: 'srv-voirie',
    nom_fr: 'Nid-de-poule ou chaussée dégradée',
    nom_ar: 'حفرة أو طريق متضرر',
    delai_moyen_jours: 3,
  },
  {
    id: 'cat-trottoir-endommage',
    service_id: 'srv-voirie',
    nom_fr: 'Trottoir cassé ou impraticable',
    nom_ar: 'رصيف مكسور أو غير صالح للمرور',
    delai_moyen_jours: 5,
  },
  {
    id: 'cat-reverbere-eteint',
    service_id: 'srv-eclairage',
    nom_fr: 'Lampadaire éteint ou clignotant',
    nom_ar: 'فانوس إنارة معطل أو يومض',
    delai_moyen_jours: 2,
  },
  {
    id: 'cat-cable-dangereux',
    service_id: 'srv-eclairage',
    nom_fr: 'Câble électrique à découvert',
    nom_ar: 'سلك كهربائي مكشوف وخطر',
    delai_moyen_jours: 1,
  },
  {
    id: 'cat-depot-sauvage',
    service_id: 'srv-proprete',
    nom_fr: 'Dépôt sauvage d’ordures',
    nom_ar: 'مصب فضلات عشوائي',
    delai_moyen_jours: 1,
  },
  {
    id: 'cat-poubelle-debordante',
    service_id: 'srv-proprete',
    nom_fr: 'Conteneur à ordures débordant',
    nom_ar: 'حاوية فضلات ممتلئة تتطلب تفريغ',
    delai_moyen_jours: 1,
  },
  {
    id: 'cat-arbre-dangereux',
    service_id: 'srv-espaces-verts',
    nom_fr: 'Branche menaçant de tomber',
    nom_ar: 'غصن شجرة آيل للسقوط',
    delai_moyen_jours: 2,
  },
  {
    id: 'cat-terrain-vague',
    service_id: 'srv-espaces-verts',
    nom_fr: 'Herbes sèches et risque d’incendie',
    nom_ar: 'أعشاب يابسة وخطر حريق',
    delai_moyen_jours: 4,
  },
];

/**
 * Limites techniques
 */
export const UPLOAD_LIMITS = {
  maxSizeBytes: 1024 * 1024, // 1 Mo
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};
