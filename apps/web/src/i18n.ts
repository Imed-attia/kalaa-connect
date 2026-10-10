import { AppLanguage, ReportStatus } from '@kalaa-connect/shared';

export interface Translations {
  appName: string;
  subtitle: string;
  municipality: string;
  nav: {
    home: string;
    map: string;
    report: string;
    myReports: string;
    agentDashboard: string;
    stats: string;
    switchLang: string;
    offlineMode: string;
  };
  status: Record<ReportStatus, string>;
  form: {
    title: string;
    step1: string;
    step2: string;
    step3: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    photoLabel: string;
    photoHint: string;
    takePhoto: string;
    locationLabel: string;
    detectGps: string;
    gpsDetected: string;
    descLabel: string;
    descPlaceholder: string;
    titleLabel: string;
    titlePlaceholder: string;
    submit: string;
    submitting: string;
    draftSaved: string;
    successTitle: string;
    successMessage: string;
    aiDetecting: string;
    aiSuggested: string;
  };
  agent: {
    title: string;
    subtitle: string;
    allServices: string;
    allStatuses: string;
    filterByService: string;
    filterByStatus: string;
    ticketNum: string;
    date: string;
    incident: string;
    statusCol: string;
    actions: string;
    changeStatus: string;
    assignToMe: string;
    proofPhotoRequired: string;
    rejectReasonRequired: string;
    resolveModalTitle: string;
    uploadProof: string;
    confirm: string;
    cancel: string;
  };
  stats: {
    title: string;
    subtitle: string;
    totalIncidents: string;
    avgDelay: string;
    resolutionRate: string;
    byCategory: string;
    byNeighborhood: string;
    exportCsv: string;
  };
}

export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  [AppLanguage.FR]: {
    appName: 'Kalaa Connect',
    subtitle: 'Signalez un problème urbain en moins d’une minute',
    municipality: 'Municipalité de Kalâa Seghira',
    nav: {
      home: 'Accueil',
      map: 'Carte des incidents',
      report: 'Signaler',
      myReports: 'Mes signalements',
      agentDashboard: 'Espace Agent',
      stats: 'Statistiques & Open Data',
      switchLang: 'العربية',
      offlineMode: 'Mode Hors-Ligne Actif',
    },
    status: {
      [ReportStatus.NOUVEAU]: 'Nouveau',
      [ReportStatus.ACCEPTE]: 'Accepté',
      [ReportStatus.EN_COURS]: 'En cours',
      [ReportStatus.RESOLU]: 'Résolu',
      [ReportStatus.CLOTURE]: 'Clôturé',
      [ReportStatus.REJETE]: 'Rejeté',
      [ReportStatus.DOUBLON]: 'Doublon',
    },
    form: {
      title: 'Nouveau Signalement',
      step1: '1. Photo',
      step2: '2. Catégorie & Lieu',
      step3: '3. Description',
      categoryLabel: 'Type d’anomalie',
      categoryPlaceholder: 'Sélectionnez une catégorie...',
      photoLabel: 'Photo de l’incident',
      photoHint: 'Max 1 Mo. Pas de visages ni de plaques d’immatriculation.',
      takePhoto: 'Prendre une photo / Téléverser',
      locationLabel: 'Localisation GPS',
      detectGps: 'Me géolocaliser automatiquement',
      gpsDetected: 'Coordonnées GPS capturées avec succès',
      descLabel: 'Description du problème',
      descPlaceholder: 'Précisez les détails utiles (taille du trou, repères)...',
      titleLabel: 'Titre du signalement',
      titlePlaceholder: 'Ex: Nid-de-poule dangereux devant la poste',
      submit: 'Envoyer le signalement',
      submitting: 'Envoi en cours...',
      draftSaved: 'Brouillon sauvegardé localement (hors-ligne)',
      successTitle: 'Signalement envoyé avec succès !',
      successMessage: 'Votre ticket a été transmis aux services municipaux de Kalâa Seghira.',
      aiDetecting: 'Analyse de l’image par IA...',
      aiSuggested: 'Catégorie suggérée par IA Gemini',
    },
    agent: {
      title: 'Tableau de bord municipal',
      subtitle: 'Traitement des interventions techniques',
      allServices: 'Tous les services',
      allStatuses: 'Tous les statuts',
      filterByService: 'Filtrer par service',
      filterByStatus: 'Filtrer par statut',
      ticketNum: 'N° Ticket',
      date: 'Date',
      incident: 'Incident & Lieu',
      statusCol: 'Statut',
      actions: 'Actions',
      changeStatus: 'Changer le statut',
      assignToMe: 'M’assigner',
      proofPhotoRequired: 'Une photo de preuve est obligatoire pour valider la résolution.',
      rejectReasonRequired: 'Motif de rejet ou doublon requis.',
      resolveModalTitle: 'Résolution de l’intervention',
      uploadProof: 'Téléverser la photo de preuve après travaux',
      confirm: 'Confirmer',
      cancel: 'Annuler',
    },
    stats: {
      title: 'Transparence & Open Data',
      subtitle: 'Données publiques d’intervention de Kalâa Seghira (Zéro donnée personnelle)',
      totalIncidents: 'Total des signalements',
      avgDelay: 'Délai moyen de résolution',
      resolutionRate: 'Taux de résolution',
      byCategory: 'Incidents par catégorie',
      byNeighborhood: 'Incidents par quartier',
      exportCsv: 'Télécharger les données (CSV)',
    },
  },
  [AppLanguage.AR]: {
    appName: 'قلعة كونكت',
    subtitle: 'أبلغ عن أي مشكل بلدي في أقل من دقيقة',
    municipality: 'بلدية القلعة الصغرى',
    nav: {
      home: 'الرئيسية',
      map: 'خريطة البلاغات',
      report: 'إبلاغ جديد',
      myReports: 'بلاغاتي',
      agentDashboard: 'فضاء الأعوان',
      stats: 'إحصائيات وبيانات مفتوحة',
      switchLang: 'Français',
      offlineMode: 'وضع غير متصل بالإنترنت',
    },
    status: {
      [ReportStatus.NOUVEAU]: 'جديد',
      [ReportStatus.ACCEPTE]: 'مقبول',
      [ReportStatus.EN_COURS]: 'قيد الإنجاز',
      [ReportStatus.RESOLU]: 'تم الحل',
      [ReportStatus.CLOTURE]: 'مغلق',
      [ReportStatus.REJETE]: 'مرفوض',
      [ReportStatus.DOUBLON]: 'مكرر',
    },
    form: {
      title: 'تسجيل بلاغ جديد',
      step1: '1. الصورة',
      step2: '2. الصنف والموقع',
      step3: '3. التفاصيل',
      categoryLabel: 'نوع المشكل',
      categoryPlaceholder: 'اختر نوع المشكل...',
      photoLabel: 'صورة المشكل',
      photoHint: 'الحجم الأقصى 1 ميغابايت. يرجى تجنب تصوير الأشخاص أو أرقام السيارات.',
      takePhoto: 'التقاط صورة / تحميل ملف',
      locationLabel: 'الموقع الجغرافي GPS',
      detectGps: 'تحديد موقعي الحالي تلقائياً',
      gpsDetected: 'تم تحديد الإحداثيات بنجاح',
      descLabel: 'وصف المشكل',
      descPlaceholder: 'أدخل تفاصيل إضافية لتسهيل تدخل الفرقة البلدية...',
      titleLabel: 'عنوان البلاغ',
      titlePlaceholder: 'مثال: حفرة عميقة بالطريق الرئيسي',
      submit: 'إرسال البلاغ',
      submitting: 'جارٍ الإرسال...',
      draftSaved: 'تم حفظ المسودة محلياً في الهاتف',
      successTitle: 'تم إرسال البلاغ بنجاح !',
      successMessage: 'تم توجيه تذكرتك إلى المصالح الفنية المختصة ببلدية القلعة الصغرى.',
      aiDetecting: 'تحليل الصورة بالذكاء الاصطناعي...',
      aiSuggested: 'اقتراح الذكاء الاصطناعي (Gemini)',
    },
    agent: {
      title: 'لوحة قيادة العمليات البلدية',
      subtitle: 'متابعة ومعالجة البلاغات الفنية',
      allServices: 'كل المصالح',
      allStatuses: 'كل الحالات',
      filterByService: 'تصفية حسب المصلحة',
      filterByStatus: 'تصفية حسب الحالة',
      ticketNum: 'رقم التذكرة',
      date: 'التاريخ',
      incident: 'المشكل والمكان',
      statusCol: 'الحالة',
      actions: 'إجراءات',
      changeStatus: 'تغيير الحالة',
      assignToMe: 'تكليف ذاتي',
      proofPhotoRequired: 'صورة الإثبات إجبارية لتأكيد حل المشكل.',
      rejectReasonRequired: 'سبب الرفض أو التكرار إجباري.',
      resolveModalTitle: 'إنهاء التدخل وحل المشكل',
      uploadProof: 'تحميل صورة الإثبات بعد الأشغال',
      confirm: 'تأكيد',
      cancel: 'إلغاء',
    },
    stats: {
      title: 'الشفافية والبيانات المفتوحة',
      subtitle: 'إحصائيات بلدية القلعة الصغرى (بدون أي معطيات شخصية)',
      totalIncidents: 'إجمالي البلاغات',
      avgDelay: 'معدل مدة التدخل',
      resolutionRate: 'نسبة الإنجاز',
      byCategory: 'البلاغات حسب الصنف',
      byNeighborhood: 'البلاغات حسب الأحياء',
      exportCsv: 'تحميل البيانات (CSV)',
    },
  },
};
