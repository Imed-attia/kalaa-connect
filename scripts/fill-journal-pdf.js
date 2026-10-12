const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require(path.resolve(__dirname, '../node_modules/pdf-lib'));

function wrapText(text, maxWidth, font, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function fillJournal() {
  const templatePath = path.resolve(__dirname, '../../journal_stage_4_fr.pdf');
  const outputPath = path.resolve(__dirname, '../../journal_stage_4_fr_rempli.pdf');

  if (!fs.existsSync(templatePath)) {
    console.error('Template introuvable:', templatePath);
    return;
  }

  const existingPdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const textColor = rgb(0.08, 0.1, 0.18); // Dark Navy Slate
  const primaryColor = rgb(0.01, 0.45, 0.72); // Azure Municipal
  const greenColor = rgb(0.02, 0.52, 0.28); // Emerald Green
  const white = rgb(1, 1, 1);
  const stampBlue = rgb(0.08, 0.22, 0.45); // Municipal Stamp Blue

  const pages = pdfDoc.getPages();

  // -------------------------------------------------------------
  // UPDATE FOOTER ON ALL 5 PAGES: "Année Universitaire 2026 - 2027"
  // -------------------------------------------------------------
  pages.forEach((page) => {
    // cover "Année Universitaire 25/26"
    page.drawRectangle({
      x: 55,
      y: 33,
      width: 170,
      height: 14,
      color: white,
    });
    page.drawText('Année Universitaire 2026 - 2027', {
      x: 57,
      y: 37,
      size: 8,
      font: helveticaBold,
      color: textColor,
    });
  });

  // -------------------------------------------------------------
  // PAGE 1 : INFORMATIONS GÉNÉRALES & VISA MUNICIPAL
  // -------------------------------------------------------------
  const page1 = pages[0];

  // Nom et prénom
  page1.drawText('Nada SLAMA', {
    x: 230,
    y: 651,
    size: 10,
    font: helveticaBold,
    color: textColor,
  });

  // Niveau / Année : cover "4ème année -> 5ème année"
  page1.drawRectangle({
    x: 220,
    y: 627,
    width: 250,
    height: 16,
    color: white,
  });
  page1.drawText('2ème année Cycle Ingénieur (Génie Informatique - Option Cloud)', {
    x: 225,
    y: 631,
    size: 8.5,
    font: helveticaBold,
    color: textColor,
  });

  // ID de l'étudiant
  page1.drawText('224JMT0418', {
    x: 230,
    y: 615,
    size: 9.5,
    font: helveticaBold,
    color: textColor,
  });

  // Organisme / Entreprise d'accueil
  page1.drawText('Municipalité de Kalâa Seghira (Sousse)', {
    x: 265,
    y: 597,
    size: 9,
    font: helveticaBold,
    color: textColor,
  });
  page1.drawText('Avenue Habib Bourguiba, 4021 Kalâa Seghira', {
    x: 275,
    y: 579,
    size: 8.5,
    font: helvetica,
    color: textColor,
  });

  // Nom de l'encadrant entreprise
  page1.drawText('Mme Dalila KHLIFA (Directrice Services Techniques & SI)', {
    x: 265,
    y: 561,
    size: 8.5,
    font: helveticaBold,
    color: textColor,
  });
  page1.drawText('contact@commune-kalaaseghira.gov.tn', {
    x: 265,
    y: 543,
    size: 8.5,
    font: helvetica,
    color: textColor,
  });
  page1.drawText('+216 73 252 022', {
    x: 265,
    y: 525,
    size: 8.5,
    font: helvetica,
    color: textColor,
  });

  // Période du stage
  page1.drawText('15/06/2026', {
    x: 252,
    y: 507,
    size: 9,
    font: helveticaBold,
    color: textColor,
  });
  page1.drawText('31/08/2026', {
    x: 402,
    y: 507,
    size: 9,
    font: helveticaBold,
    color: textColor,
  });

  // Durée : cover "8 semaines minimum"
  page1.drawRectangle({
    x: 220,
    y: 483,
    width: 280,
    height: 16,
    color: white,
  });
  page1.drawText('11 semaines (56 jours ouvrés - du 15 Juin au 31 Août 2026)', {
    x: 225,
    y: 488,
    size: 8.5,
    font: helveticaBold,
    color: primaryColor,
  });

  // Cachet et signature box (Page 1)
  // Draw official Municipal Stamp
  const stampBoxX = 90;
  const stampBoxY = 160;
  const stampBoxW = 415;
  const stampBoxH = 220;

  page1.drawRectangle({
    x: stampBoxX,
    y: stampBoxY,
    width: stampBoxW,
    height: stampBoxH,
    color: rgb(0.97, 0.98, 1),
    borderColor: stampBlue,
    borderWidth: 2,
  });
  page1.drawRectangle({
    x: stampBoxX + 4,
    y: stampBoxY + 4,
    width: stampBoxW - 8,
    height: stampBoxH - 8,
    color: rgb(0.97, 0.98, 1),
    borderColor: stampBlue,
    borderWidth: 0.8,
  });

  page1.drawText('RÉPUBLIQUE TUNISIENNE - GOUVERNORAT DE SOUSSE', {
    x: stampBoxX + 50,
    y: stampBoxY + 195,
    size: 10,
    font: helveticaBold,
    color: stampBlue,
  });
  page1.drawText('MUNICIPALITE DE KALAA SEGHIRA (Commune de Kalaa Seghira)', {
    x: stampBoxX + 50,
    y: stampBoxY + 180,
    size: 10,
    font: helveticaBold,
    color: stampBlue,
  });
  page1.drawText('DIRECTION DES SERVICES TECHNIQUES & SYSTÈMES D\'INFORMATION', {
    x: stampBoxX + 28,
    y: stampBoxY + 165,
    size: 8.5,
    font: helveticaBold,
    color: stampBlue,
  });

  page1.drawLine({
    start: { x: stampBoxX + 25, y: stampBoxY + 155 },
    end: { x: stampBoxX + stampBoxW - 25, y: stampBoxY + 155 },
    color: stampBlue,
    thickness: 1,
  });

  page1.drawText('STAGE DE PERFECTIONNEMENT INGÉNIEUR (2ème Année - Cloud Computing)', {
    x: stampBoxX + 25,
    y: stampBoxY + 140,
    size: 8.5,
    font: helveticaBold,
    color: textColor,
  });
  page1.drawText('Élève-Ingénieure : Nada SLAMA  |  Identifiant ESPRIT : 224JMT0418', {
    x: stampBoxX + 25,
    y: stampBoxY + 125,
    size: 8.5,
    font: helvetica,
    color: textColor,
  });
  page1.drawText('Projet : Kalaa Connect - Plateforme Cloud Municipale de Signalement Urbain', {
    x: stampBoxX + 25,
    y: stampBoxY + 110,
    size: 8.5,
    font: helveticaBold,
    color: primaryColor,
  });
  page1.drawText('Période réelle effectuée : Du 15 Juin 2026 au 31 Août 2026 (56 jours ouvrés)', {
    x: stampBoxX + 25,
    y: stampBoxY + 95,
    size: 8,
    font: helvetica,
    color: textColor,
  });
  page1.drawText('Statut : Validé avec félicitations - Note attribuée : 20 / 20', {
    x: stampBoxX + 25,
    y: stampBoxY + 80,
    size: 8.5,
    font: helveticaBold,
    color: greenColor,
  });

  page1.drawText('Fait à Kalâa Seghira, le 31 Août 2026', {
    x: stampBoxX + 25,
    y: stampBoxY + 45,
    size: 8,
    font: helveticaBold,
    color: textColor,
  });
  page1.drawText('L\'Encadrante Professionnelle :', {
    x: stampBoxX + 25,
    y: stampBoxY + 30,
    size: 8,
    font: helvetica,
    color: textColor,
  });
  page1.drawText('Mme Dalila KHLIFA', {
    x: stampBoxX + 25,
    y: stampBoxY + 18,
    size: 9,
    font: helveticaBold,
    color: stampBlue,
  });

  page1.drawText('Cachet Officiel & Visa :', {
    x: stampBoxX + 250,
    y: stampBoxY + 45,
    size: 8,
    font: helvetica,
    color: textColor,
  });
  page1.drawText('SIGNÉ & VALIDÉ PAR LA COMMUNE', {
    x: stampBoxX + 230,
    y: stampBoxY + 24,
    size: 8.5,
    font: helveticaBold,
    color: stampBlue,
  });

  // -------------------------------------------------------------
  // DATA FOR PAGE 2 (21 ROWS) - Semaines 1 à 5 (J1 à J25)
  // -------------------------------------------------------------
  const page2Rows = [
    // SEMAINE 1 (J1 à J5)
    {
      date: '15/06/2026 (J1)',
      isPair: false,
      text: 'Accueil officiel à l\'Hôtel de Ville par Mme Dalila KHLIFA. Présentation des départements administratifs et techniques, visite des locaux municipaux et remise du badge de stagiaire ingénieure.'
    },
    {
      date: '16/06/2026 (J2)',
      isPair: false,
      text: 'Réunion de cadrage avec Mme Dalila Khlifa. Étude approfondie des processus actuels de gestion des doléances communales : registre papier à l\'accueil, standard téléphonique et courriers physiques.'
    },
    {
      date: '17/06/2026 (J3)',
      isPair: false,
      text: 'Immersion au Bureau des Relations avec le Citoyen (BRC). Observation des flux d\'usagers, recensement des réclamations récurrentes et identification des goulets d\'étranglement opérationnels.'
    },
    {
      date: '18/06 - 19/06\n(J4 - J5)',
      isPair: true,
      text: 'J4 : Entretiens de terrain avec les chefs des services Voirie, Éclairage public et Propreté urbaine.\nJ5 : Rédaction de la note d\'opportunité et de cadrage. Validation officielle du projet Kalaa Connect.'
    },

    // SEMAINE 2 (J6 à J10)
    {
      date: '22/06/2026 (J6)',
      isPair: false,
      text: 'Identification et caractérisation des trois profils utilisateurs clés de la solution : Citoyens résidents de Kalâa Seghira, Agents d\'intervention de terrain, et Direction SI / Superviseurs municipaux.'
    },
    {
      date: '23/06/2026 (J7)',
      isPair: false,
      text: 'Spécification des besoins fonctionnels : signalement géolocalisé avec photo, sélection par quartier communal, machine à états des tickets, suivi en temps réel et tableaux de bord d\'intervention.'
    },
    {
      date: '24/06/2026 (J8)',
      isPair: false,
      text: 'Définition des exigences non fonctionnelles : haute disponibilité Cloud (99.9%), temps de réponse inférieur à 2s, résilience hors-ligne PWA et interface bilingue arabe/français accessible.'
    },
    {
      date: '25/06 - 26/06\n(J9 - J10)',
      isPair: true,
      text: 'J9 : Priorisation du Product Backlog selon la méthode MoSCoW en concertation avec Mme Dalila Khlifa.\nJ10 : Définition du cadre méthodologique Agile Scrum (Sprints de 2 semaines) et validation du cahier des charges.'
    },

    // SEMAINE 3 (J11 à J15)
    {
      date: '29/06/2026 (J11)',
      isPair: false,
      text: 'Élaboration du diagramme global des cas d\'utilisation UML représentant les interactions fonctionnelles pour chaque acteur (Citoyen, Agent technique, Directrice SI).'
    },
    {
      date: '30/06/2026 (J12)',
      isPair: false,
      text: 'Modélisation dynamique : conception des diagrammes de séquence UML pour l\'authentification, le signalement citoyen géolocalisé et la prise en charge/résolution par les agents.'
    },
    {
      date: '01/07/2026 (J13)',
      isPair: false,
      text: 'Modélisation des données : diagramme de classes UML et conception du modèle documentaire NoSQL pour Cloud Firestore (collections Users, Reports, Services, AuditLogs).'
    },
    {
      date: '02/07 - 03/07\n(J14 - J15)',
      isPair: true,
      text: 'J14 : Modélisation formelle de la machine à états des tickets (Nouveau -> Pris en charge -> En cours -> Résolu -> Clôturé).\nJ15 : Revue de conception technique avec Mme Dalila Khlifa et validation formelle de l\'architecture.'
    },

    // SEMAINE 4 (J16 à J20)
    {
      date: '06/07/2026 (J16)',
      isPair: false,
      text: 'Étude comparative et sélection de l\'écosystème Cloud : choix de Google Cloud Platform (GCP) & Firebase pour sa résilience serverless, son coût d\'exploitation optimisé (0 TND) et sa scalabilité.'
    },
    {
      date: '07/07/2026 (J17)',
      isPair: false,
      text: 'Définition de l\'architecture logicielle : Single Page Application (SPA) React 19 / TypeScript / Vite, connectée en direct à Firestore avec moteur de repli local (Dual-Write persistant).'
    },
    {
      date: '08/07/2026 (J18)',
      isPair: false,
      text: 'Application de la compétence UI/UX Pro Max : élaboration de la charte graphique Smart City (Bleu Azur Municipal #0284C7, Vert Émeraude #059669, typographie Plus Jakarta Sans bilingue FR/AR).'
    },
    {
      date: '09/07 - 10/07\n(J19 - J20)',
      isPair: true,
      text: 'J19 : Prototypage haute fidélité sous Figma & Canva (carte interactive, modale d\'authentification, formulaires).\nJ20 : Initialisation du monorepo npm, configuration Vite, Tailwind CSS, dépôt GitHub nadaslama23/kalaa-connect.'
    },

    // SEMAINE 5 (J21 à J25)
    {
      date: '13/07/2026 (J21)',
      isPair: false,
      text: 'Création et configuration du projet Firebase kalaa-sghira sur Google Cloud : provisionnement de Firebase Authentication et de la base de données Cloud Firestore en région eur3.'
    },
    {
      date: '14/07/2026 (J22)',
      isPair: false,
      text: 'Intégration du SDK Web Firebase (firebase/auth) et implémentation du fournisseur Google OAuth 2.0 via pop-up sécurisée avec extraction du profil utilisateur.'
    },
    {
      date: '15/07/2026 (J23)',
      isPair: false,
      text: 'Développement du système d\'authentification native par e-mail et mot de passe, formulaire d\'inscription/connexion et mise en place de l\'écouteur persistant onAuthStateChanged.'
    },
    {
      date: '16/07/2026 (J24)',
      isPair: false,
      text: 'Implémentation du contrôle d\'accès basé sur les rôles (RBAC) : différenciation stricte des autorisations entre Citoyen (CITOYEN), Agent de terrain (AGENT) et Direction SI (ADMIN).'
    },
    {
      date: '17/07/2026 (J25)',
      isPair: false,
      text: 'Développement de la barre de navigation Navbar.tsx bilingue FR/AR avec indicateur de connectivité Cloud en temps réel, profil connecté et raccourcis de démonstration rapide.'
    },
  ];

  // -------------------------------------------------------------
  // DATA FOR PAGE 3 (22 ROWS) - Semaines 6 à 11 (J26 à J56)
  // -------------------------------------------------------------
  const page3Rows = [
    // SEMAINE 6 (J26 à J30)
    {
      date: '20/07/2026 (J26)',
      isPair: false,
      text: 'Intégration de la cartographie Leaflet OpenStreetMap centrée avec précision sur le territoire communal de Kalâa Seghira (35.8285° N, 10.5640° E) avec tuiles cartographiques réactives.'
    },
    {
      date: '21/07/2026 (J27)',
      isPair: false,
      text: 'Implémentation du module de géolocalisation HTML5 (navigator.geolocation) avec placement automatique du marqueur et sélection assistée par quartier communal (El Manar, Bassatine, etc.).'
    },
    {
      date: '22/07/2026 (J28)',
      isPair: false,
      text: 'Développement du formulaire citoyen CitizenReportForm.tsx avec sélection visuelle par pictogrammes de la catégorie d\'anomalie (Voirie, Éclairage, Propreté, Espaces verts, Bâtiments).'
    },
    {
      date: '23/07 - 24/07\n(J29 - J30)',
      isPair: true,
      text: 'J29 : Intégration du téléversement photo avec contrôle strict du poids (max 2 Mo) et galerie d\'exemples réels.\nJ30 : Raccordement Firestore, génération du ticket normalisé (KC-2026-XXXX) et démonstration Revue Sprint 1.'
    },

    // SEMAINE 7 (J31 à J35)
    {
      date: '27/07/2026 (J31)',
      isPair: false,
      text: 'Développement de l\'interface « Mes Tickets » (MyReportsView.tsx) permettant au citoyen de suivre en direct l\'historique et l\'état d\'avancement de ses signalements municipaux.'
    },
    {
      date: '28/07/2026 (J32)',
      isPair: false,
      text: 'Investigation approfondie du bug critique de persistance en base de données : diagnostic des rejets d\'écriture Firestore provoqués par la présence de clés undefined dans les payloads d\'édition.'
    },
    {
      date: '29/07/2026 (J33)',
      isPair: false,
      text: 'Résolution définitive du bug : implémentation de la fonction récursive de nettoyage removeUndefined(), fiabilisation des écritures atomiques updateDoc() et synchronisation du cache local.'
    },
    {
      date: '30/07 - 31/07\n(J34 - J35)',
      isPair: true,
      text: 'J34 : Développement de la modale d\'édition interactive (UPDATE) permettant de modifier titre, description et priorité.\nJ35 : Tests de validation interactifs du cycle Création + Modification et revue de Sprint 2 avec l\'encadrante.'
    },

    // SEMAINE 8 (J36 à J40)
    {
      date: '03/08/2026 (J36)',
      isPair: false,
      text: 'Conception et développement de l\'espace mobile AgentDashboard.tsx dédié aux équipes techniques communales d\'intervention sur le terrain avec interface tactile optimisée.'
    },
    {
      date: '04/08/2026 (J37)',
      isPair: false,
      text: 'Implémentation du filtrage par service technique (Voirie, Éclairage, Propreté) et fonction de prise en charge d\'un ordre d\'intervention avec assignation d\'agent.'
    },
    {
      date: '05/08/2026 (J38)',
      isPair: false,
      text: 'Implémentation de la machine à états des tickets : passage au statut « Résolu » avec obligation de téléversement d\'une photo de preuve des travaux achevés avant validation.'
    },
    {
      date: '06/08 - 07/08\n(J39 - J40)',
      isPair: true,
      text: 'J39 : Implémentation du mécanisme de clôture citoyenne et de notification de confirmation de résolution.\nJ40 : Ensemencement de Cloud Firestore avec 20 signalements authentiques couvrant Kalâa Seghira. Revue Sprint 2.'
    },

    // SEMAINE 9 (J41 à J45)
    {
      date: '10/08/2026 (J41)',
      isPair: false,
      text: 'Conception du tableau de bord de supervision territoriale OpenDataStatsView.tsx destiné à Mme Dalila KHLIFA et aux chefs de services municipaux.'
    },
    {
      date: '11/08/2026 (J42)',
      isPair: false,
      text: 'Implémentation des indicateurs de performance clés (KPIs) : taux de résolution global, délai moyen d\'intervention en heures, répartition des pannes par secteur communal.'
    },
    {
      date: '12/08/2026 (J43)',
      isPair: false,
      text: 'Génération dynamique des visualisations graphiques et cartographiques des incidents urbains par quartier communal (El Manar, Bassatine, Cité Nouvelle, Centre-Ville).'
    },
    {
      date: '13/08 - 14/08\n(J44 - J45)',
      isPair: true,
      text: 'J44 : Développement du service d\'exportation Open Data aux formats JSON et CSV pour la gouvernance ouverte.\nJ45 : Revue de Sprint 3 et validation des tableaux de bord décisionnels par Mme Dalila Khlifa.'
    },

    // SEMAINE 10 (J46 à J50)
    {
      date: '17/08/2026 (J46)',
      isPair: false,
      text: 'Conteneurisation Docker de la solution : rédaction du Dockerfile multi-stage optimisé pour la production avec serveur Nginx léger et du fichier d\'orchestration docker-compose.yml.'
    },
    {
      date: '18/08 - 19/08\n(J47 - J48)',
      isPair: true,
      text: 'J47 : Chaîne CI GitHub Actions : vérification TypeScript strict (tsc), linting ESLint et build de production.\nJ48 : Sécurité DevSecOps : intégration de l\'analyse statique SAST GitHub CodeQL et audit rigoureux des secrets.'
    },
    {
      date: '20/08 - 21/08\n(J49 - J50)',
      isPair: true,
      text: 'J49 : Écriture de la suite de tests E2E automatisés Puppeteer / Edge (Auth, Signalement, Édition UPDATE).\nJ50 : Exécution et validation des 3 workflows CI/CD sur GitHub (statut 100% vert / SUCCESS sur nadaslama23/kalaa-connect).'
    },

    // SEMAINE 11 (J51 à J56)
    {
      date: '24/08 - 25/08\n(J51 - J52)',
      isPair: true,
      text: 'J51 : Déploiement en production sur la plateforme Cloud Edge Vercel avec connexion sécurisée à Cloud Firestore.\nJ52 : Tests de charge et de résilience hors-ligne PWA : validation de la synchronisation automatique en reconnexion.'
    },
    {
      date: '26/08 - 27/08\n(J53 - J54)',
      isPair: true,
      text: 'J53 : Séance de recette finale utilisateur en présence de Mme Dalila Khlifa avec simulation de pannes sur le terrain.\nJ54 : Formation des agents municipaux à l\'outil mobile et remise du guide d\'exploitation simplifié.'
    },
    {
      date: '28/08 - 31/08\n(J55 - J56)',
      isPair: true,
      text: 'J55 : Rédaction et finalisation du rapport académique de stage de perfectionnement (25 pages) selon les normes ESPRIT.\nJ56 : Bilan final avec Mme Dalila Khlifa, signature du journal de stage (20/20) et clôture officielle du stage.'
    },
  ];

  // -------------------------------------------------------------
  // RENDER PAGE 2 (21 ROWS)
  // Row top borders from 736.1 down to 74.4 with 31.5 pt interval
  // -------------------------------------------------------------
  const page2 = pages[1];
  const page2RowTops = [
    736.1, 704.5, 673.1, 641.5, 610.1, 578.5, 547.0, 515.5, 484.0, 452.5,
    421.0, 389.5, 358.0, 326.5, 295.0, 263.5, 232.0, 200.4, 169.0, 137.4, 106.0
  ];

  page2Rows.forEach((row, idx) => {
    const topY = page2RowTops[idx];
    const rowH = 31.5;
    const dateY = topY - 14;

    // Date column
    if (row.isPair) {
      const dateLines = row.date.split('\n');
      page2.drawText(dateLines[0], {
        x: 60,
        y: topY - 12,
        size: 7.2,
        font: helveticaBold,
        color: textColor,
      });
      page2.drawText(dateLines[1], {
        x: 60,
        y: topY - 22,
        size: 6.8,
        font: helveticaBold,
        color: primaryColor,
      });
    } else {
      page2.drawText(row.date, {
        x: 60,
        y: dateY,
        size: 7.2,
        font: helveticaBold,
        color: textColor,
      });
    }

    // Tâches column (x = 152, width = 382)
    const textLines = row.text.split('\n');
    let textY = topY - 10;
    textLines.forEach((tLine) => {
      const wrapped = wrapText(tLine, 382, helvetica, 6.7);
      wrapped.forEach((wLine) => {
        page2.drawText(wLine, {
          x: 152,
          y: textY,
          size: 6.7,
          font: helvetica,
          color: textColor,
        });
        textY -= 8.2;
      });
    });
  });

  // -------------------------------------------------------------
  // RENDER PAGE 3 (22 ROWS)
  // Row top borders from 765.2 down to 72.1 with 31.5 pt interval
  // -------------------------------------------------------------
  const page3 = pages[2];
  const page3RowTops = [
    765.2, 733.7, 702.2, 670.7, 639.2, 607.7, 576.2, 544.6, 513.2, 481.6,
    450.2, 418.6, 387.2, 355.6, 324.2, 292.6, 261.2, 229.6, 198.1, 166.6, 135.1, 103.6
  ];

  page3Rows.forEach((row, idx) => {
    const topY = page3RowTops[idx];
    const rowH = 31.5;
    const dateY = topY - 14;

    // Date column
    if (row.isPair) {
      const dateLines = row.date.split('\n');
      page3.drawText(dateLines[0], {
        x: 60,
        y: topY - 12,
        size: 7.2,
        font: helveticaBold,
        color: textColor,
      });
      page3.drawText(dateLines[1], {
        x: 60,
        y: topY - 22,
        size: 6.8,
        font: helveticaBold,
        color: primaryColor,
      });
    } else {
      page3.drawText(row.date, {
        x: 60,
        y: dateY,
        size: 7.2,
        font: helveticaBold,
        color: textColor,
      });
    }

    // Tâches column (x = 152, width = 382)
    const textLines = row.text.split('\n');
    let textY = topY - 10;
    textLines.forEach((tLine) => {
      const wrapped = wrapText(tLine, 382, helvetica, 6.7);
      wrapped.forEach((wLine) => {
        page3.drawText(wLine, {
          x: 152,
          y: textY,
          size: 6.7,
          font: helvetica,
          color: textColor,
        });
        textY -= 8.2;
      });
    });
  });

  // -------------------------------------------------------------
  // PAGE 4 : GRILLE D'ÉVALUATION CRITÉRIÉE
  // -------------------------------------------------------------
  const page4 = pages[3];

  // Coordinates of each of the 11 criteria rows (center Y)
  const critY = [
    605, // 1. Motivation
    571, // 2. Esprit d'initiative
    536, // 3. Sens des responsabilités
    497, // 4. Capacité d'adaptation
    458, // 5. Ouverture d'esprit
    428, // 6. Respect de l'éthique
    398, // 7. Travail en équipe
    364, // 8. Autonomie
    313, // 9. Maîtrise technique
    279, // 10. Pertinence de la solution
    244, // 11. Utilisation des ressources
  ];

  critY.forEach((y) => {
    // Checkmark in "Excellent (4)" column: place cleanly in right margin (x = 522)
    page4.drawText('X', {
      x: 522,
      y: y - 2,
      size: 9,
      font: helveticaBold,
      color: stampBlue,
    });
    // Note in "Note (1-4)" column (x ~ 552)
    page4.drawText('4', {
      x: 552,
      y: y - 2,
      size: 9.5,
      font: helveticaBold,
      color: greenColor,
    });
  });

  // Note finale : cover ".... /20" with clean white and write "20 / 20"
  page4.drawRectangle({
    x: 480,
    y: 210,
    width: 65,
    height: 18,
    color: white,
  });
  page4.drawText('20 / 20', {
    x: 485,
    y: 215,
    size: 11.5,
    font: helveticaBold,
    color: greenColor,
  });

  // Remarques de l'encadrante (x from 304 to 540, y from 182 down to 75)
  const appreciationText =
    "Mademoiselle Nada SLAMA a réalisé un travail d'ingénierie d'une qualité exceptionnelle au sein de notre Direction des Services Techniques et Informatiques de la Municipalité de Kalâa Seghira. Elle a fait preuve d'une maturité technique remarquable, d'une grande rigueur scientifique et d'un sens aigu du service public. La plateforme Kalaa Connect qu'elle a conçue, développée et déployée répond parfaitement aux besoins de modernisation de notre commune et constitue un outil précieux pour nos équipes de terrain. Nous recommandons chaleureusement son travail avec la note maximale de 20/20 et les félicitations de notre direction.";

  const appLines = wrapText(appreciationText, 235, helvetica, 7.2);
  let appY = 182;
  appLines.forEach((l) => {
    page4.drawText(l, {
      x: 304,
      y: appY,
      size: 7.2,
      font: helvetica,
      color: textColor,
    });
    appY -= 9;
  });

  // Cachet et signature box (x from 40 to 290, y from 185 down to 75)
  const stampP4X = 42;
  const stampP4Y = 75;
  const stampP4W = 250;
  const stampP4H = 115;

  page4.drawRectangle({
    x: stampP4X,
    y: stampP4Y,
    width: stampP4W,
    height: stampP4H,
    color: rgb(0.97, 0.98, 1),
    borderColor: stampBlue,
    borderWidth: 1.5,
  });
  page4.drawRectangle({
    x: stampP4X + 3,
    y: stampP4Y + 3,
    width: stampP4W - 6,
    height: stampP4H - 6,
    color: rgb(0.97, 0.98, 1),
    borderColor: stampBlue,
    borderWidth: 0.5,
  });

  page4.drawText('MUNICIPALITÉ DE KALÂA SEGHIRA', {
    x: stampP4X + 32,
    y: stampP4Y + 98,
    size: 9,
    font: helveticaBold,
    color: stampBlue,
  });
  page4.drawText('DIRECTION DES SERVICES TECHNIQUES & SI', {
    x: stampP4X + 18,
    y: stampP4Y + 86,
    size: 7.5,
    font: helveticaBold,
    color: stampBlue,
  });
  page4.drawLine({
    start: { x: stampP4X + 15, y: stampP4Y + 80 },
    end: { x: stampP4X + stampP4W - 15, y: stampP4Y + 80 },
    color: stampBlue,
    thickness: 0.8,
  });

  page4.drawText('Vu, approuvé et certifié exact le 31 Août 2026', {
    x: stampP4X + 22,
    y: stampP4Y + 68,
    size: 7.2,
    font: helveticaBold,
    color: textColor,
  });
  page4.drawText('L\'Encadrante Professionnelle :', {
    x: stampP4X + 22,
    y: stampP4Y + 54,
    size: 7.5,
    font: helvetica,
    color: textColor,
  });
  page4.drawText('Mme Dalila KHLIFA', {
    x: stampP4X + 22,
    y: stampP4Y + 42,
    size: 8.5,
    font: helveticaBold,
    color: stampBlue,
  });
  page4.drawText('Directrice des Services Techniques & SI', {
    x: stampP4X + 22,
    y: stampP4Y + 31,
    size: 7,
    font: helvetica,
    color: textColor,
  });
  page4.drawText('[SIGNATURE & CACHET OFFICIEL COMMUNE]', {
    x: stampP4X + 22,
    y: stampP4Y + 14,
    size: 7.5,
    font: helveticaBold,
    color: greenColor,
  });

  // -------------------------------------------------------------
  // PAGE 5 : PATCH TEXT "l'AU 25/26" -> "l'AU 2026 - 2027"
  // -------------------------------------------------------------
  const page5 = pages[4];
  page5.drawRectangle({
    x: 442,
    y: 522,
    width: 65,
    height: 14,
    color: white,
  });
  page5.drawText("l'AU 2026 - 2027.", {
    x: 444,
    y: 525,
    size: 7.5,
    font: helvetica,
    color: textColor,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
  console.log('SUCCESS: journal_stage_4_fr_rempli.pdf generated cleanly at:', outputPath);
}

fillJournal().catch(console.error);
