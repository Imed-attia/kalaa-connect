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
  const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const textColor = rgb(0.12, 0.16, 0.24); // Dark Slate #1E293B
  const primaryColor = rgb(0.01, 0.45, 0.72); // Azure Municipal #0284C7
  const darkNavy = rgb(0.06, 0.14, 0.32); // Deep Navy #0F2352
  const greenColor = rgb(0.02, 0.52, 0.28); // Emerald Green
  const white = rgb(1, 1, 1);
  const stampBlue = rgb(0.08, 0.22, 0.45); // Municipal Stamp Blue
  const tableBorderColor = rgb(0.75, 0.82, 0.90); // Table border soft slate
  const rowDividerColor = rgb(0.80, 0.86, 0.92); // Week row divider
  const innerLineColor = rgb(0.90, 0.93, 0.96); // Subtle header line
  const dateColBg = rgb(0.97, 0.985, 1); // Soft calm tint for date column

  const pages = pdfDoc.getPages();

  // -------------------------------------------------------------
  // UPDATE FOOTER ON ALL 5 PAGES: "Année Universitaire 2026 - 2027"
  // -------------------------------------------------------------
  pages.forEach((page) => {
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

  // =============================================================
  // 11 WEEKS / 56 WORKING DAYS (CONCISE, AERATED & CLEAR)
  // =============================================================
  const weeksData = [
    // SEMAINE 1
    {
      weekNum: 1,
      title: "Cadrage, Immersion & Étude de l'Existant",
      dateRange: "15/06 - 19/06",
      page: 2,
      days: [
        { day: "Lun. 15/06", task: "Accueil officiel à l'Hôtel de Ville par Mme Dalila Khlifa et visite des locaux." },
        { day: "Mar. 16/06", task: "Analyse du circuit actuel de traitement des doléances communales." },
        { day: "Mer. 17/06", task: "Immersion au Bureau des Relations avec le Citoyen (BRC) et recueil des besoins." },
        { day: "Jeu. 18/06", task: "Entretiens de terrain avec les chefs des services Voirie, Éclairage et Propreté." },
        { day: "Ven. 19/06", task: "Rédaction de la note d'opportunité et validation du projet Kalaa Connect." },
      ]
    },

    // SEMAINE 2
    {
      weekNum: 2,
      title: "Spécification des Besoins & Backlog Agile",
      dateRange: "22/06 - 26/06",
      page: 2,
      days: [
        { day: "Lun. 22/06", task: "Modélisation des acteurs clés : Citoyen, Agent de terrain et Direction SI." },
        { day: "Mar. 23/06", task: "Spécification fonctionnelle : signalement géolocalisé, photo et suivi en direct." },
        { day: "Mer. 24/06", task: "Exigences non fonctionnelles : haute disponibilité, temps de réponse < 2s, PWA." },
        { day: "Jeu. 25/06", task: "Rédaction et hiérarchisation du Product Backlog selon la méthode MoSCoW." },
        { day: "Ven. 26/06", task: "Découpage en 3 Sprints Agile Scrum et validation du cahier des charges." },
      ]
    },

    // SEMAINE 3
    {
      weekNum: 3,
      title: "Conception UML & Schéma Documentaire NoSQL",
      dateRange: "29/06 - 03/07",
      page: 2,
      days: [
        { day: "Lun. 29/06", task: "Élaboration du diagramme global des cas d'utilisation UML de la plateforme." },
        { day: "Mar. 30/06", task: "Modélisation des diagrammes de séquence (authentification, signalement)." },
        { day: "Mer. 01/07", task: "Conception du modèle de données documentaire NoSQL sous Cloud Firestore." },
        { day: "Jeu. 02/07", task: "Modélisation de la machine à états des tickets d'intervention municipaux." },
        { day: "Ven. 03/07", task: "Revue de conception technique avec l'encadrante et validation architecturale." },
      ]
    },

    // SEMAINE 4
    {
      weekNum: 4,
      title: "Architecture Cloud Serverless & Prototypage UI/UX",
      dateRange: "06/07 - 10/07",
      page: 2,
      days: [
        { day: "Lun. 06/07", task: "Benchmark Cloud : sélection de GCP, Firebase et Vercel Edge Serverless." },
        { day: "Mar. 07/07", task: "Définition de l'architecture logicielle SPA React 19 / TypeScript / Vite." },
        { day: "Mer. 08/07", task: "Charte graphique Smart City UI/UX Pro Max : palette azur et bilinguisme FR/AR." },
        { day: "Jeu. 09/07", task: "Prototypage interactif haute fidélité sous Figma (carte, formulaire, métriques)." },
        { day: "Ven. 10/07", task: "Initialisation du monorepo npm, configuration Vite, Tailwind CSS et GitHub." },
      ]
    },

    // SEMAINE 5
    {
      weekNum: 5,
      title: "Configuration Firebase & Authentification RBAC",
      dateRange: "13/07 - 17/07",
      page: 2,
      days: [
        { day: "Lun. 13/07", task: "Création du projet Firebase kalaa-sghira sur GCP (Firestore & Storage eur3)." },
        { day: "Mar. 14/07", task: "Intégration de Firebase Auth et connexion Google OAuth 2.0 sécurisée." },
        { day: "Mer. 15/07", task: "Développement du module d'authentification e-mail/mot de passe et sessions." },
        { day: "Jeu. 16/07", task: "Mise en place du contrôle d'accès RBAC (Citoyen, Agent technique, Superviseur)." },
        { day: "Ven. 17/07", task: "Développement de la barre de navigation Navbar.tsx avec statut Cloud temps réel." },
      ]
    },

    // SEMAINE 6 -> PAGE 3
    {
      weekNum: 6,
      title: "Cartographie Interactive & Formulaire Citoyen",
      dateRange: "20/07 - 24/07",
      page: 3,
      days: [
        { day: "Lun. 20/07", task: "Intégration de Leaflet OpenStreetMap centrée sur le territoire communal." },
        { day: "Mar. 21/07", task: "Géolocalisation GPS HTML5, marqueur draggable et sélecteur de quartiers." },
        { day: "Mer. 22/07", task: "Développement du formulaire citoyen de signalement par catégorie d'incident." },
        { day: "Jeu. 23/07", task: "Module de téléversement photo avec compression client et prévisualisation." },
        { day: "Ven. 24/07", task: "Raccordement Firestore, génération du ticket KC-2026 et démo Sprint 1." },
      ]
    },

    // SEMAINE 7 -> PAGE 3
    {
      weekNum: 7,
      title: "Espace Citoyen & Résolution Bug Firestore",
      dateRange: "27/07 - 31/07",
      page: 3,
      days: [
        { day: "Lun. 27/07", task: "Développement de l'espace « Mes Tickets » avec suivi des statuts en direct." },
        { day: "Mar. 28/07", task: "Diagnostic du bug critique Firestore lié aux clés undefined dans les payloads." },
        { day: "Mer. 29/07", task: "Résolution avec removeUndefined() récursif et fiabilisation de updateDoc()." },
        { day: "Jeu. 30/07", task: "Développement de la modale d'édition interactive (UPDATE) et annulation." },
        { day: "Ven. 31/07", task: "Tests complets du cycle création/mise à jour et validation avec l'encadrante." },
      ]
    },

    // SEMAINE 8 -> PAGE 3
    {
      weekNum: 8,
      title: "Espace Agent Mobile & Gestion du Terrain",
      dateRange: "03/08 - 07/08",
      page: 3,
      days: [
        { day: "Lun. 03/08", task: "Développement du dashboard mobile tactile pour les agents communaux." },
        { day: "Mar. 04/08", task: "Filtrage des interventions par service (Voirie, Éclairage, Propreté) et prise en charge." },
        { day: "Mer. 05/08", task: "Statut « Résolu » avec obligation de téléverser la photo de preuve après travaux." },
        { day: "Jeu. 06/08", task: "Notification citoyenne de résolution et mécanisme de clôture définitive." },
        { day: "Ven. 07/08", task: "Ensemencement Firestore avec 20 signalements réels et démo Sprint 2." },
      ]
    },

    // SEMAINE 9 -> PAGE 3
    {
      weekNum: 9,
      title: "Tableaux de Bord Décisionnels & Open Data",
      dateRange: "10/08 - 14/08",
      page: 3,
      days: [
        { day: "Lun. 10/08", task: "Conception du dashboard de supervision pour la Direction des Services Techniques." },
        { day: "Mar. 11/08", task: "Calcul automatique des KPIs : taux de résolution et délais moyens de traitement." },
        { day: "Mer. 12/08", task: "Graphiques analytiques interactifs et répartition des pannes par quartier." },
        { day: "Jeu. 13/08", task: "Développement de l'exportation Open Data aux formats JSON et CSV pour la mairie." },
        { day: "Ven. 14/08", task: "Revue de Sprint 3 et validation des indicateurs de pilotage avec l'encadrante." },
      ]
    },

    // SEMAINE 10 -> PAGE 3
    {
      weekNum: 10,
      title: "Conteneurisation, DevSecOps & CI/CD",
      dateRange: "17/08 - 21/08",
      page: 3,
      days: [
        { day: "Lun. 17/08", task: "Conteneurisation Docker multi-stage de production avec serveur Nginx léger." },
        { day: "Mar. 18/08", task: "Pipeline CI GitHub Actions : automatisation de la compilation tsc et ESLint." },
        { day: "Mer. 19/08", task: "Sécurité DevSecOps : audit npm audit, scan SAST CodeQL et détection de secrets." },
        { day: "Jeu. 20/08", task: "Rédaction des suites de tests E2E automatisés sous Puppeteer / Edge." },
        { day: "Ven. 21/08", task: "Validation des 3 workflows CI/CD sur GitHub avec statut vert (100% SUCCESS)." },
      ]
    },

    // SEMAINE 11 -> PAGE 3 (6 JOURS)
    {
      weekNum: 11,
      title: "Déploiement Cloud Edge, Recette & Clôture",
      dateRange: "24/08 - 31/08",
      page: 3,
      days: [
        { day: "Lun. 24/08", task: "Déploiement en production sur Vercel Edge Network avec certificat SSL/TLS." },
        { day: "Mar. 25/08", task: "Tests de charge et validation de la résilience hors-ligne Progressive Web App." },
        { day: "Mer. 26/08", task: "Séance de recette finale avec Mme Dalila Khlifa et simulation sur le terrain." },
        { day: "Jeu. 27/08", task: "Formation des agents techniques communaux et remise du guide d'utilisation." },
        { day: "Ven. 28/08", task: "Finalisation de la rédaction du rapport académique de stage (25 pages)." },
        { day: "Lun. 31/08", task: "Bilan final du stage avec l'encadrante, signature du journal et validation (20/20)." },
      ]
    }
  ];

  // =============================================================
  // CLEAN & AERATED WEEK-BY-WEEK RENDERER
  // =============================================================
  const tableX = 56.5;
  const tableW = 482.0;
  const colDateW = 92.0;
  const colTasksX = tableX + colDateW; // 148.5
  const colTasksW = tableW - colDateW; // 390.0

  function renderAeratedTable(targetPage, weeksForPage, startY, endY, rowHeights, fontSizeDay, fontSizeText, lineSpacing) {
    const totalH = startY - endY;

    // 1. Wipe out existing pre-printed table body with clean white
    targetPage.drawRectangle({
      x: tableX,
      y: endY,
      width: tableW,
      height: totalH,
      color: white,
    });

    // 2. Outer border
    targetPage.drawRectangle({
      x: tableX,
      y: endY,
      width: tableW,
      height: totalH,
      borderColor: tableBorderColor,
      borderWidth: 1,
    });

    // 3. Vertical divider between Date and Tasks
    targetPage.drawLine({
      start: { x: colTasksX, y: startY },
      end: { x: colTasksX, y: endY },
      color: tableBorderColor,
      thickness: 0.8,
    });

    let currentY = startY;

    weeksForPage.forEach((week, wIdx) => {
      const rowH = rowHeights[wIdx];
      const rowTopY = currentY;
      const rowBottomY = rowTopY - rowH;

      // Soft alternating background for the Date Column to anchor the week
      targetPage.drawRectangle({
        x: tableX + 0.5,
        y: rowBottomY + 0.5,
        width: colDateW - 1,
        height: rowH - 1,
        color: dateColBg,
      });

      // Accent color pill on the left of each week row
      targetPage.drawRectangle({
        x: tableX + 0.5,
        y: rowBottomY + 0.5,
        width: 3.5,
        height: rowH - 1,
        color: primaryColor,
      });

      // DATE COLUMN CONTENT (Vertically centered)
      const numDays = week.days.length;
      const dateBlockH = 34; // approximate height of week badge block
      const dateBlockTopY = rowTopY - (rowH - dateBlockH) / 2;

      // Week Label (e.g. "SEMAINE 1")
      targetPage.drawText(`SEMAINE ${week.weekNum}`, {
        x: tableX + 11,
        y: dateBlockTopY - 10,
        size: 9.2,
        font: helveticaBold,
        color: darkNavy,
      });

      // Date Range (e.g. "15/06 - 19/06")
      targetPage.drawText(week.dateRange, {
        x: tableX + 11,
        y: dateBlockTopY - 21,
        size: 7.8,
        font: helveticaBold,
        color: primaryColor,
      });

      // Days count badge (e.g. "(5 jours ouvrés)")
      targetPage.drawText(`(${numDays} jours ouvrés)`, {
        x: tableX + 11,
        y: dateBlockTopY - 31,
        size: 6.8,
        font: helveticaOblique,
        color: rgb(0.40, 0.48, 0.58),
      });

      // TÂCHES COLUMN CONTENT
      // Week Theme Title Header
      const contentPaddingTop = (rowH - (16 + numDays * lineSpacing)) / 2;
      const themeTitleY = rowTopY - Math.max(contentPaddingTop, 8) - 9;

      targetPage.drawText(week.title, {
        x: colTasksX + 10,
        y: themeTitleY,
        size: 8.5,
        font: helveticaBold,
        color: darkNavy,
      });

      // Subtle thin underline under the theme title
      targetPage.drawLine({
        start: { x: colTasksX + 10, y: themeTitleY - 3 },
        end: { x: tableX + tableW - 12, y: themeTitleY - 3 },
        color: innerLineColor,
        thickness: 0.6,
      });

      // Days bullet points
      let bulletY = themeTitleY - 13;

      week.days.forEach((dayItem) => {
        // Bullet symbol
        targetPage.drawText('•', {
          x: colTasksX + 10,
          y: bulletY,
          size: fontSizeDay + 1,
          font: helveticaBold,
          color: primaryColor,
        });

        // Day label (e.g. "Lun. 15/06 :")
        const dayLabel = `${dayItem.day} : `;
        targetPage.drawText(dayLabel, {
          x: colTasksX + 18,
          y: bulletY,
          size: fontSizeDay,
          font: helveticaBold,
          color: darkNavy,
        });

        // Task description (regular font, perfectly aligned)
        const dayLabelWidth = helveticaBold.widthOfTextAtSize(dayLabel, fontSizeDay);
        targetPage.drawText(dayItem.task, {
          x: colTasksX + 18 + dayLabelWidth,
          y: bulletY,
          size: fontSizeText,
          font: helvetica,
          color: textColor,
        });

        bulletY -= lineSpacing;
      });

      // Horizontal week divider line
      if (wIdx < weeksForPage.length - 1) {
        targetPage.drawLine({
          start: { x: tableX, y: rowBottomY },
          end: { x: tableX + tableW, y: rowBottomY },
          color: rowDividerColor,
          thickness: 0.8,
        });
      }

      currentY = rowBottomY;
    });
  }

  // -------------------------------------------------------------
  // RENDER PAGE 2 : SEMAINES 1 À 5 (5 SEMAINES ÉQUILIBRÉES)
  // Available height: 736.1 - 76.1 = 660 pt -> 132 pt per week!
  // -------------------------------------------------------------
  const page2 = pages[1];
  const page2Weeks = weeksData.filter((w) => w.page === 2);
  const page2RowHeights = [132, 132, 132, 132, 132];

  renderAeratedTable(
    page2,
    page2Weeks,
    736.1, // startY
    76.1,  // endY
    page2RowHeights,
    7.3,   // fontSizeDay
    7.0,   // fontSizeText
    14.5   // lineSpacing (very comfortable!)
  );

  // -------------------------------------------------------------
  // RENDER PAGE 3 : SEMAINES 6 À 11 (6 SEMAINES ÉQUILIBRÉES)
  // Available height: 765.2 - 73.7 = 691.5 pt
  // 5 weeks * 114 pt + 1 week (6 days) * 121.5 pt = 691.5 pt!
  // -------------------------------------------------------------
  const page3 = pages[2];
  const page3Weeks = weeksData.filter((w) => w.page === 3);
  const page3RowHeights = [114, 114, 114, 114, 114, 121.5];

  renderAeratedTable(
    page3,
    page3Weeks,
    765.2, // startY
    73.7,  // endY
    page3RowHeights,
    7.0,   // fontSizeDay
    6.7,   // fontSizeText
    12.2   // lineSpacing
  );

  // -------------------------------------------------------------
  // PAGE 4 : GRILLE D'ÉVALUATION CRITÉRIÉE
  // -------------------------------------------------------------
  const page4 = pages[3];

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
    // Checkmark in "Excellent (4)" column
    page4.drawText('X', {
      x: 522,
      y: y - 2,
      size: 9,
      font: helveticaBold,
      color: stampBlue,
    });
    // Note in "Note (1-4)" column
    page4.drawText('4', {
      x: 552,
      y: y - 2,
      size: 9.5,
      font: helveticaBold,
      color: greenColor,
    });
  });

  // Note finale : 20 / 20
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

  // Remarques de l'encadrante
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

  // Cachet et signature box
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
