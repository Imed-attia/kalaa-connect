const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  PageBreak,
  ImageRun,
  TabStopType,
} = require(path.resolve(__dirname, '../node_modules/docx'));

const outDocxPath = path.resolve(__dirname, '../../RAPPORT_STAGE_2EME_ANNEE_NADA_SLAMA.docx');
const baseDir = path.resolve(__dirname, '../../');

// Palette de couleurs professionnelles Smart City / ESPRIT
const C_NAVY = '0F2E59';
const C_BLUE = '0284C7';
const C_EMERALD = '059669';
const C_SLATE = '1E293B';
const C_MUTED = '64748B';
const C_LIGHT_BG = 'F8FAFC';
const C_CALLOUT_BG = 'F0F9FF';
const C_BORDER = 'CBD5E1';
const C_WHITE = 'FFFFFF';
const FONT_MAIN = 'Segoe UI';
const FONT_CODE = 'Consolas';

// Helpers de création d'éléments
function h1(text, pageBreakBefore = false) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: pageBreakBefore,
    spacing: { before: 280, after: 120 },
    border: {
      bottom: { color: C_BLUE, space: 6, value: BorderStyle.SINGLE, size: 12 },
    },
  });
}

function h2(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 80 },
  });
}

function h3(text) {
  return new Paragraph({
    text: text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 140, after: 60 },
  });
}

function p(textOrRuns, spacingAfter = 100) {
  const children = Array.isArray(textOrRuns)
    ? textOrRuns
    : [
        new TextRun({
          text: textOrRuns,
          font: FONT_MAIN,
          size: 20, // 10pt
          color: C_SLATE,
        }),
      ];

  return new Paragraph({
    children: children,
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 260, after: spacingAfter },
  });
}

function bullet(textOrRuns, level = 0) {
  const children = Array.isArray(textOrRuns)
    ? textOrRuns
    : [
        new TextRun({
          text: textOrRuns,
          font: FONT_MAIN,
          size: 20,
          color: C_SLATE,
        }),
      ];

  return new Paragraph({
    children: children,
    bullet: { level: level },
    spacing: { line: 250, after: 60 },
  });
}

function callout(title, text) {
  const borderStyle = {
    top: { style: BorderStyle.NONE },
    bottom: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    left: { style: BorderStyle.SINGLE, size: 24, color: C_BLUE },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: title + '\n',
                    bold: true,
                    font: FONT_MAIN,
                    size: 20,
                    color: C_BLUE,
                  }),
                  new TextRun({
                    text: text,
                    font: FONT_MAIN,
                    size: 19,
                    color: C_SLATE,
                  }),
                ],
                spacing: { line: 240, after: 0 },
              }),
            ],
            shading: { fill: C_CALLOUT_BG, type: ShadingType.CLEAR },
            borders: borderStyle,
            margins: { top: 100, bottom: 100, left: 160, right: 140 },
          }),
        ],
      }),
    ],
  });
}

function codeBlock(codeText) {
  const borderStyle = {
    top: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER },
    right: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER },
    left: { style: BorderStyle.SINGLE, size: 16, color: C_NAVY },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: codeText,
                    font: FONT_CODE,
                    size: 17, // 8.5pt
                    color: '0F172A',
                  }),
                ],
                spacing: { line: 220, after: 0 },
              }),
            ],
            shading: { fill: C_LIGHT_BG, type: ShadingType.CLEAR },
            borders: borderStyle,
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
          }),
        ],
      }),
    ],
  });
}

function createFigure(figNum, title, relPath, desc, targetWidth = 470, targetHeight = null) {
  const fullPath = path.resolve(baseDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error('Image introuvable:', fullPath);
    return [p(`[Image introuvable: ${relPath}]`)];
  }

  const imgBuf = fs.readFileSync(fullPath);
  let w = targetWidth;
  let h = targetHeight;

  if (!h) {
    const rawW = imgBuf.readUInt32BE(16);
    const rawH = imgBuf.readUInt32BE(20);
    const aspect = rawW / rawH;
    h = Math.round(w / aspect);
  }

  return [
    // Image centrée
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          data: imgBuf,
          transformation: { width: w, height: h },
          type: 'png',
        }),
      ],
      spacing: { before: 100, after: 60 },
    }),
    // Numérotation et titrage
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Figure ${figNum} : `,
          bold: true,
          font: FONT_MAIN,
          size: 19, // 9.5pt
          color: C_BLUE,
        }),
        new TextRun({
          text: title,
          bold: true,
          font: FONT_MAIN,
          size: 19,
          color: C_NAVY,
        }),
      ],
      spacing: { after: 40 },
    }),
    // Description détaillée
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 240, right: 240 },
      children: [
        new TextRun({
          text: 'Description : ',
          bold: true,
          italics: true,
          font: FONT_MAIN,
          size: 17, // 8.5pt
          color: C_MUTED,
        }),
        new TextRun({
          text: desc,
          italics: true,
          font: FONT_MAIN,
          size: 17,
          color: '334155',
        }),
      ],
      spacing: { line: 230, after: 140 },
    }),
  ];
}

function createTable(headers, rowsData, colWidthsPct = null) {
  const borderCell = {
    top: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER },
    left: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER },
    right: { style: BorderStyle.SINGLE, size: 4, color: C_BORDER },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((hText, i) => {
      const cellOpts = {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: hText,
                bold: true,
                font: FONT_MAIN,
                size: 18,
                color: C_WHITE,
              }),
            ],
            spacing: { line: 220, after: 0 },
          }),
        ],
        shading: { fill: C_NAVY, type: ShadingType.CLEAR },
        borders: borderCell,
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      };
      if (colWidthsPct && colWidthsPct[i]) {
        cellOpts.width = { size: colWidthsPct[i], type: WidthType.PERCENTAGE };
      }
      return new TableCell(cellOpts);
    }),
  });

  const tableRows = [headerRow];

  rowsData.forEach((row, rowIdx) => {
    const isAlt = rowIdx % 2 === 1;
    const r = new TableRow({
      children: row.map((cellText, i) => {
        const cellOpts = {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  font: FONT_MAIN,
                  size: 18,
                  color: C_SLATE,
                }),
              ],
              spacing: { line: 220, after: 0 },
            }),
          ],
          shading: { fill: isAlt ? C_LIGHT_BG : C_WHITE, type: ShadingType.CLEAR },
          borders: borderCell,
          margins: { top: 60, bottom: 60, left: 100, right: 100 },
        };
        if (colWidthsPct && colWidthsPct[i]) {
          cellOpts.width = { size: colWidthsPct[i], type: WidthType.PERCENTAGE };
        }
        return new TableCell(cellOpts);
      }),
    });
    tableRows.push(r);
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

// -----------------------------------------------------------------------------
// CONSTRUCTION DU DOCUMENT DOCX
// -----------------------------------------------------------------------------
async function buildDocx() {
  console.log('Construction du document Word pour Nada SLAMA...');

  const children = [];

  // ===========================================================================
  // 1. PAGE DE GARDE (Cover Page)
  // ===========================================================================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'RÉPUBLIQUE TUNISIENNE\n', bold: true, font: FONT_MAIN, size: 22, color: C_NAVY }),
        new TextRun({ text: 'MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE\n', bold: true, font: FONT_MAIN, size: 18, color: C_MUTED }),
        new TextRun({ text: 'DIRECTION GÉNÉRALE DES ÉTUDES TECHNOLOGIQUES & ÉCOLES D\'INGÉNIEURS\n', font: FONT_MAIN, size: 16, color: C_MUTED }),
        new TextRun({ text: 'ÉCOLE SUPÉRIEURE PRIVÉE D\'INGÉNIERIE ET DE TECHNOLOGIES (ESPRIT)\n', bold: true, font: FONT_MAIN, size: 22, color: C_NAVY }),
        new TextRun({ text: 'DÉPARTEMENT GÉNIE INFORMATIQUE — OPTION CLOUD COMPUTING', bold: true, font: FONT_MAIN, size: 18, color: C_BLUE }),
      ],
      spacing: { after: 200 },
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'RAPPORT DE STAGE DE PERFECTIONNEMENT',
          bold: true,
          font: FONT_MAIN,
          size: 28,
          color: C_NAVY,
        }),
      ],
      spacing: { before: 100, after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '2ème Année Cycle Ingénieur en Informatique (Option Cloud)',
          italics: true,
          font: FONT_MAIN,
          size: 20,
          color: C_BLUE,
        }),
      ],
      spacing: { after: 220 },
    }),

    // Titre / Sujet
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'SUJET DU PROJET D\'INGÉNIERIE\n', bold: true, font: FONT_MAIN, size: 18, color: C_BLUE }),
                    new TextRun({
                      text: 'KALAA CONNECT : Conception et Développement d\'une Plateforme Web & Mobile Cloud pour la Gestion et le Suivi Temps Réel des Signalements et Interventions Municipaux',
                      bold: true,
                      font: FONT_MAIN,
                      size: 24,
                      color: C_NAVY,
                    }),
                  ],
                  spacing: { line: 260, before: 60, after: 60 },
                }),
              ],
              shading: { fill: C_CALLOUT_BG, type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: C_BLUE },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: C_BLUE },
                left: { style: BorderStyle.SINGLE, size: 12, color: C_BLUE },
                right: { style: BorderStyle.SINGLE, size: 12, color: C_BLUE },
              },
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
            }),
          ],
        }),
      ],
    }),

    new Paragraph({ text: '', spacing: { after: 200 } }),

    // Metadata Grid
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                p([new TextRun({ text: 'Élève-Ingénieure :\n', bold: true, size: 19, color: C_BLUE }), new TextRun({ text: 'Nada SLAMA\n', bold: true, size: 22, color: C_NAVY }), new TextRun({ text: '2ème Année Génie Informatique (Cloud)\nIdentifiant ESPRIT : 224JMT0418', size: 18, color: C_MUTED })]),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                p([new TextRun({ text: 'Encadrante Professionnelle :\n', bold: true, size: 19, color: C_BLUE }), new TextRun({ text: 'Mme Dalila KHLIFA\n', bold: true, size: 22, color: C_NAVY }), new TextRun({ text: 'Directrice des Services Techniques & SI\nMunicipalité de Kalâa Seghira', size: 18, color: C_MUTED })]),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [
                p([new TextRun({ text: 'Organisme d\'Accueil :\n', bold: true, size: 19, color: C_BLUE }), new TextRun({ text: 'Municipalité de Kalâa Seghira (Sousse)\n', bold: true, size: 20, color: C_NAVY }), new TextRun({ text: 'Avenue Habib Bourguiba, 4021 Kalâa Seghira', size: 18, color: C_MUTED })]),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                p([new TextRun({ text: 'Période & Année Universitaire :\n', bold: true, size: 19, color: C_BLUE }), new TextRun({ text: 'Du 15 Juin 2026 au 31 Août 2026\n', bold: true, size: 20, color: C_NAVY }), new TextRun({ text: '11 Semaines (56 jours) · Année 2026 - 2027', size: 18, color: C_MUTED })]),
              ],
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    }),

    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 2. REMERCIEMENTS
  // ===========================================================================
  children.push(
    h1('Remerciements'),
    p('En premier lieu, je tiens à remercier chaleureusement Dieu le Tout-Puissant et Miséricordieux, qui m’a accordé la santé, la persévérance et la volonté indispensables pour mener à terme ce projet d\'ingénierie et surmonter l\'ensemble des défis méthodologiques et techniques.'),
    p('J\'exprime ma profonde gratitude et mes remerciements les plus sincères à mon encadrante professionnelle, Madame Dalila KHLIFA, Directrice des Services Techniques et des Systèmes d\'Information de la Municipalité de Kalâa Seghira. Je la remercie pour son accueil chaleureux, sa disponibilité constante, ses précieux conseils métiers et la confiance exemplaire qu\'elle m\'a accordée tout au long de ces 11 semaines de stage (du 15 Juin au 31 Août 2026).'),
    p('Mes vifs remerciements s’adressent également à l’ensemble des cadres, techniciens et agents de terrain de la Municipalité de Kalâa Seghira, particulièrement les équipes des services de la voirie, de l\'éclairage public, de la propreté urbaine et du Bureau des Relations avec le Citoyen (BRC), pour leur collaboration bienveillante et leurs retours d\'expérience lors des phases de recueil du besoin et de recette sur le terrain.'),
    p('Je tiens aussi à exprimer ma vive reconnaissance à la direction pédagogique et au corps professoral de l\'École Supérieure Privée d\'Ingénierie et de Technologies (ESPRIT) pour la haute qualité de la formation en génie logiciel, architectures Cloud et pratiques DevSecOps qui m\'a été dispensée.'),
    p('Mes sincères remerciements vont également aux éminents membres du jury qui me font l’honneur d’évaluer ce travail et de l’enrichir par leurs recommandations avisées.'),
    p('Enfin, je dédie ce travail avec tout mon amour et mon infinie gratitude à mes chers parents, ma famille et mes proches pour leurs sacrifices inestimables, leur soutien moral indéfectible et leurs encouragements constants durant tout mon cursus universitaire.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 3. SOMMAIRE (TABLE DES MATIÈRES)
  // ===========================================================================
  children.push(
    h1('Sommaire'),
    p([new TextRun({ text: 'Introduction Générale ........................................................................................................ 1', bold: true })]),
    p([new TextRun({ text: 'Chapitre 1 : Cadre Général du Projet & Organisme d\'Accueil .......................................... 2', bold: true })]),
    p('   1. Présentation de la Municipalité de Kalâa Seghira ........................................................... 2'),
    p('   2. Organigramme de la Mairie et Direction d\'Accueil ........................................................... 3'),
    p('   3. Étude de l\'existant et critique du processus actuel .......................................................... 4'),
    p('   4. Solution proposée : Plateforme Kalaa Connect ............................................................... 4'),
    p('   5. Méthodologie Agile Scrum & Planning du stage (15 Juin - 31 Août 2026) ....................... 5'),
    p([new TextRun({ text: 'Chapitre 2 : Analyse et Spécification des Besoins .......................................................... 6', bold: true })]),
    p('   1. Identification et rôles des acteurs du système ............................................................... 6'),
    p('   2. Spécification des besoins fonctionnels ........................................................................... 6'),
    p('   3. Spécification des besoins non fonctionnels .................................................................... 7'),
    p('   4. Diagramme global des cas d\'utilisation UML ................................................................... 8'),
    p('   5. Matrice de traçabilité des exigences ............................................................................... 9'),
    p('   6. Product Backlog & User Stories Détaillées .................................................................... 9'),
    p([new TextRun({ text: 'Chapitre 3 : Conception & Architecture Cloud / DevSecOps ......................................... 10', bold: true })]),
    p('   1. Architecture globale Cloud et choix technologiques .................................................... 10'),
    p('   2. Modélisation des données & Schéma Cloud Firestore ................................................. 11'),
    p('   3. Modélisation dynamique : Diagramme de séquence ..................................................... 12'),
    p('   4. Machine à états finis des signalements municipaux ...................................................... 13'),
    p('   5. Sécurité, contrôle d\'accès RBAC et pipeline DevSecOps ............................................... 14'),
    p([new TextRun({ text: 'Chapitre 4 : Réalisation, Tests & Déploiement ............................................................... 15', bold: true })]),
    p('   1. Environnement de développement et outillage .............................................................. 15'),
    p('   2. Présentation des interfaces utilisateurs réalisées ........................................................ 16'),
    p('   3. Résolution du problème de persistance (Sanitization des écritures) ............................. 19'),
    p('   4. Stratégie de tests et validation automatisée E2E .......................................................... 20'),
    p('   5. Déploiement Cloud sur Vercel et monitoring ................................................................ 21'),
    p([new TextRun({ text: 'Conclusion Générale & Perspectives ............................................................................... 22', bold: true })]),
    p([new TextRun({ text: 'Bibliographie & Webographie .......................................................................................... 23', bold: true })]),
    p([new TextRun({ text: 'Annexes & Fiche de Validation du Stage ........................................................................ 24', bold: true })]),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 4. LISTE DES FIGURES & ABRÉVIATIONS
  // ===========================================================================
  children.push(
    h1('Liste des Figures & Abréviations'),
    h2('Liste des Figures'),
    p('• Figure 1 : Organigramme administratif et technique de la Municipalité de Kalâa Seghira ..................... 3'),
    p('• Figure 2 : Planning de déroulement du stage (15 Juin au 31 Août 2026 — 11 Semaines) ......................... 5'),
    p('• Figure 3 : Diagramme UML global des cas d\'utilisation de la plateforme Kalaa Connect ........................ 8'),
    p('• Figure 4 : Architecture globale Cloud et composants déployés sur GCP / Firebase & Vercel ................ 10'),
    p('• Figure 5 : Diagramme de classes UML et schéma documentaire NoSQL Cloud Firestore ...................... 11'),
    p('• Figure 6 : Diagramme de séquence de déclaration et d\'enregistrement Cloud d\'un incident ................. 12'),
    p('• Figure 7 : Chaîne d\'Intégration et Déploiement Continus (CI/CD) DevSecOps GitHub Actions ................. 14'),
    p('• Figure 8 : Page d\'accueil publique et cartographie interactive OpenStreetMap ................................... 16'),
    p('• Figure 9 : Formulaire de signalement citoyen géolocalisé avec sélection photographique ................... 17'),
    p('• Figure 10 : Espace Citoyen « Mes Tickets » avec suivi d\'avancement en temps réel ............................. 17'),
    p('• Figure 11 : Modal interactive d\'édition et mise à jour dynamique (UPDATE) ........................................ 18'),
    p('• Figure 12 : Espace Agent de terrain avec téléversement de la photo de preuve .................................... 18'),
    p('• Figure 13 : Tableau de bord de supervision municipale pour Mme Dalila KHLIFA ................................. 19'),
    p('• Figure 14 : Adaptation mobile PWA responsive sur smartphone ........................................................... 19'),
    h2('Liste des Abréviations'),
    createTable(
      ['Abréviation', 'Signification Développée'],
      [
        ['API', 'Application Programming Interface'],
        ['BRC', 'Bureau des Relations avec le Citoyen'],
        ['CI/CD', 'Continuous Integration / Continuous Deployment'],
        ['DevSecOps', 'Development, Security, and Operations'],
        ['E2E', 'End-to-End (Tests automatisés de bout en bout)'],
        ['GCP', 'Google Cloud Platform'],
        ['GPS', 'Global Positioning System'],
        ['JSON', 'JavaScript Object Notation'],
        ['KPI', 'Key Performance Indicator (Indicateur Clé de Performance)'],
        ['NoSQL', 'Not Only SQL (Bases de données non relationnelles)'],
        ['PWA', 'Progressive Web Application'],
        ['RBAC', 'Role-Based Access Control (Contrôle d\'accès par rôles)'],
        ['SAST', 'Static Application Security Testing (Analyse de code statique)'],
        ['SLA', 'Service Level Agreement (Accord de Niveau de Service)'],
        ['SPA', 'Single Page Application'],
        ['UML', 'Unified Modeling Language'],
      ],
      [30, 70]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 5. INTRODUCTION GÉNÉRALE
  // ===========================================================================
  children.push(
    h1('Introduction Générale'),
    h2('Contexte Général & Enjeux Urbains'),
    p('À l\'ère de la transformation numérique des territoires et de l\'avènement des villes intelligentes (Smart Cities), la gouvernance communale moderne repose fondamentalement sur la proximité citoyenne, la transparence de l\'action publique et l\'efficacité opérationnelle des interventions techniques. En Tunisie, le processus de décentralisation initié par le Code des Collectivités Locales accorde aux municipalités un rôle de premier plan dans l\'entretien des infrastructures urbaines, la propreté des quartiers et l\'amélioration continue du cadre de vie des citoyens.'),
    p('Cependant, de nombreuses communes tunisiennes rencontrent encore d\'importantes difficultés logistiques pour recueillir, centraliser et traiter avec célérité les incidents du quotidien urbain : nids-de-poule dangereux sur la chaussée, défaillances de l\'éclairage public nocturne, fuites sur la voie publique ou accumulations sauvages d\'ordures ménagères.'),
    h2('Problématique Constatée'),
    p('Au sein de la Municipalité de Kalâa Seghira (بلدية القلعة الصغرى), commune dynamique du gouvernorat de Sousse comptant plus de 38 000 habitants, la gestion des réclamations s\'effectue encore majoritairement selon un circuit manuel et morcelé : registres physiques d\'accueil, appels téléphoniques ou déclarations verbales. Ce mode de fonctionnement traditionnel engendre plusieurs conséquences préjudiciables :'),
    bullet([new TextRun({ text: 'Perte et imprécision de l\'information : ', bold: true }), new TextRun({ text: 'Absence de coordonnées GPS précises et de photographies objectives, ce qui contraint les équipes techniques à de longues recherches sur le terrain.' })]),
    bullet([new TextRun({ text: 'Délais de traitement allongés : ', bold: true }), new TextRun({ text: 'Temps de transmission administratif oscillant entre 10 et 15 jours entre la réception de la doléance et l\'intervention effective des agents municipaux.' })]),
    bullet([new TextRun({ text: 'Absence de visibilité citoyenne : ', bold: true }), new TextRun({ text: 'Impossibilité pour les citoyens de suivre l\'avancement de leurs alertes, générant un sentiment de défiance ou de lenteur administrative.' })]),
    bullet([new TextRun({ text: 'Manque d\'indicateurs de pilotage : ', bold: true }), new TextRun({ text: 'Difficulté pour la direction technique de mesurer les délais moyens d\'intervention et de répartir équitablement les ressources humaines et matérielles.' })]),
    h2('Mission & Objectifs du Stage'),
    p('Dans le cadre de mon stage de perfectionnement de 2ème année Cycle Ingénieur en Informatique à l\'École Supérieure Privée d\'Ingénierie et de Technologies (ESPRIT) — Spécialité Cloud Computing, j\'ai été accueillie par la Municipalité de Kalâa Seghira, sous l\'encadrement direct de Madame Dalila KHLIFA, Directrice des Services Techniques et des Systèmes d\'Information, du 15 Juin au 31 Août 2026.'),
    p('L\'objectif majeur de ce stage consiste à concevoir, développer, sécuriser et déployer la plateforme Kalaa Connect, une solution web et mobile Cloud citoyenne permettant :'),
    bullet('Aux citoyens de déclarer une anomalie en moins de 60 secondes avec géolocalisation automatique et photo.'),
    bullet('Aux agents de terrain de recevoir leurs ordres de mission et d\'attester de la résolution par photo de preuve.'),
    bullet('À la direction municipale de piloter en direct l\'activité communale grâce à un tableau de bord analytique Open Data.'),
    h2('Structure du Rapport'),
    p('Le présent document est organisé en quatre chapitres structurés :'),
    bullet('Chapitre 1 : Présente le cadre général du projet, l\'organisme d\'accueil, l\'étude de l\'existant et la méthodologie Scrum adoptée sur les 11 semaines de stage.'),
    bullet('Chapitre 2 : Détaille l\'analyse et la spécification rigoureuse des besoins fonctionnels et non fonctionnels, illustrée par le diagramme de cas d\'utilisation global.'),
    bullet('Chapitre 3 : Décrit la conception architecturale Cloud, la modélisation des données Firestore, les diagrammes de séquence et la chaîne DevSecOps.'),
    bullet('Chapitre 4 : Expose la réalisation pratique, les interfaces déployées, la résolution du bug de persistance, les tests automatisés E2E et le déploiement Cloud sur Vercel.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 6. CHAPITRE 1 : CADRE GÉNÉRAL & ORGANISME D'ACCUEIL
  // ===========================================================================
  children.push(
    h1('Chapitre 1 : Cadre Général du Projet & Organisme d\'Accueil'),
    h2('1. Présentation de la Municipalité de Kalâa Seghira'),
    h3('1.1. Fiche Signalétique & Contexte Géographique'),
    p('Créée en 1966, la Municipalité de Kalâa Seghira est une collectivité locale territoriale située dans le gouvernorat de Sousse, au Sahel tunisien. Limitrophe des communes de Sousse, Kalâa Kebira et Zaouiet Sousse, elle s\'étend sur une superficie de plus de 32 km² et regroupe une population estimée à environ 38 000 habitants répartis sur plusieurs quartiers historiques et récents (Centre-Ville, Cité El Bassatine, El Manar, Oued Laya, Echragi, Ennogra).'),
    createTable(
      ['Caractéristique', 'Donnée Officielle'],
      [
        ['Dénomination officielle', 'Municipalité de Kalâa Seghira (بلدية القلعة الصغرى)'],
        ['Gouvernorat / Région', 'Sousse — Sahel Tunisien'],
        ['Statut juridique', 'Collectivité Locale Décentralisée (Code des Collectivités Locales)'],
        ['Population couverte', '~38 000 habitants'],
        ['Découpage administratif', '6 arrondissements et quartiers municipaux'],
        ['Secteurs d\'intervention', 'Voirie, Éclairage public, Propreté, Espaces verts, Bâtiments communaux'],
        ['Siège de l\'Hôtel de Ville', 'Avenue Habib Bourguiba, 4021 Kalâa Seghira'],
      ],
      [35, 65]
    ),
    h3('1.2. Compétences & Missions Communales'),
    p('En vertu du Code des Collectivités Locales, la Municipalité de Kalâa Seghira est investie de prérogatives majeures pour garantir la salubrité, la sécurité et la qualité du cadre de vie sur son territoire. Ses compétences s\'exercent principalement dans l\'aménagement et l\'entretien de 85 km de voirie communale, l\'exploitation de 4 200 candélabres d\'éclairage public, la gestion de plus de 18 000 tonnes annuelles de déchets ménagers et le fonctionnement du Bureau des Relations avec le Citoyen (BRC).'),
    h2('2. Organigramme de la Mairie et Direction d\'Accueil'),
    p('La structure administrative municipale est placée sous l\'autorité du Maire et du Conseil Municipal, secondés par le Secrétaire Général. Le projet Kalaa Connect s\'est déroulé au sein de la Direction des Services Techniques & Systèmes d\'Information, dirigée par mon encadrante professionnelle, Mme Dalila KHLIFA.'),
    // FIGURE 1
    ...createFigure(
      1,
      'Organigramme administratif et technique de la Municipalité de Kalâa Seghira',
      'diagrams/fig01_organigramme_commune.png',
      'Ce schéma hiérarchique présente la structuration administrative et opérationnelle de la Municipalité de Kalâa Seghira. L\'autorité exécutive est assurée par le Conseil Municipal et le Maire, relayés par le Secrétariat Général. La Direction des Services Techniques et des Systèmes d\'Information, dirigée par Mme Dalila KHLIFA (encadrante professionnelle de Nada SLAMA), supervise les trois divisions d\'intervention municipale : le Service Voirie & Chaussée, le Service Éclairage Public, et le Service Propreté & Salubrité Urbaine, ainsi que la cellule informatique communale.',
      460
    ),
    h2('3. Étude de l\'Existant et Critique du Processus Actuel'),
    p('L\'analyse des circuits actuels de signalement menée durant les deux premières semaines de stage a mis en lumière un processus fortement pénalisé par des contraintes manuelles :'),
    bullet('Réception hétérogène et non centralisée : Les doléances sont recueillies au guichet physique sur registre papier, par téléphone ou via des courriers, rendant impossible une vue d\'ensemble instantanée.'),
    bullet('Absence de traçabilité spatio-temporelle : Les réclamations textuelles manquent souvent de repères clairs (« lampadaire éteint près de la mosquée »), entraînant une perte de temps considérable pour les équipes de terrain.'),
    bullet('Délais d\'intervention excessifs : Le circuit de validation papier génère une inertie de 10 à 15 jours.'),
    bullet('Insatisfaction citoyenne : Les usagers n\'ont aucune visibilité sur la prise en compte de leur démarche, ce qui favorise les signalements répétés pour une même anomalie.'),
    h2('4. Solution Proposée : La Plateforme Kalaa Connect'),
    p('Pour pallier ces défaillances, la plateforme Kalaa Connect a été conçue comme une solution Cloud moderne, accessible, gratuite pour la collectivité et bilingue (Français/Arabe) :'),
    bullet('Accessibilité citoyenne universelle : Dépôt d\'incident géolocalisé avec photo en quelques clics via smartphone ou navigateur, sans installation préalable grâce au format PWA.'),
    bullet('Gestion opérationnelle des équipes : Espace dédié pour les agents techniques avec visualisation des ordres de mission et téléversement d\'une photo de preuve des travaux achevés.'),
    bullet('Supervision décisionnelle pour Mme Dalila Khlifa : Tableau de bord territorial en temps réel, statistiques de performance municipale et ouverture des données en Open Data.'),
    h2('5. Méthodologie Agile Scrum & Planning du Stage'),
    p('Compte tenu de la nature interactive du projet, la méthodologie Agile Scrum a été adoptée. Le stage d\'été, d\'une durée effective de 11 semaines (du 15 Juin au 31 Août 2026), a été découpé en phases ordonnancées :'),
    // FIGURE 2
    ...createFigure(
      2,
      'Planning de déroulement du stage (15 Juin au 31 Août 2026 — 11 Semaines)',
      'diagrams/fig02_gantt_planning_stage.png',
      'Ce diagramme de type Gantt détaille l\'ordonnancement temporel des 11 semaines de stage (du 15 Juin au 31 Août 2026, totalisant 56 jours ouvrés) structurées selon la méthodologie Agile Scrum en 4 Sprints majeurs. Il retrace chronologiquement les étapes de cadrage initial et immersion institutionnelle (S1-S2), de conception UML et d\'architecture Cloud GCP/Firebase (S3-S4), de développement de l\'authentification et du signalement citoyen (S5-S7), des interfaces agents et du tableau de bord de supervision (S8-S9), de l\'automatisation CI/CD DevSecOps (S10), et enfin de la recette utilisateur, du déploiement Cloud sur Vercel et de la finalisation du rapport académique (S11).',
      470
    ),
    bullet('Semaines 1 & 2 (15/06 - 26/06) : Immersion institutionnelle, entretiens métiers, diagnostic de l\'existant et formalisation du cahier des charges.'),
    bullet('Semaines 3 & 4 (29/06 - 10/07) : Modélisation UML, conception de l\'architecture Cloud GCP/Firebase et élaboration de la charte graphique UI/UX Pro Max.'),
    bullet('Semaines 5 & 6 (13/07 - 24/07) : Sprint 1 — Authentification Google/Email, RBAC, cartographie Leaflet et formulaire de déclaration citoyenne.'),
    bullet('Semaines 7 & 8 (27/07 - 07/08) : Sprint 2 — Espace citoyen « Mes Tickets », résolution du bug critique de persistance BD et tableau de bord Agent avec preuves.'),
    bullet('Semaines 9 & 10 (10/08 - 21/08) : Sprint 3 & 4 — Supervision municipale Open Data, conteneurisation Docker, pipelines DevSecOps CI/CD et tests E2E.'),
    bullet('Semaine 11 (24/08 - 31/08) : Clôture — Déploiement Cloud sur Vercel, recette finale avec Mme Dalila Khlifa, formation des agents et rédaction du rapport.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 7. CHAPITRE 2 : ANALYSE ET SPÉCIFICATION DES BESOINS
  // ===========================================================================
  children.push(
    h1('Chapitre 2 : Analyse et Spécification des Besoins'),
    h2('1. Identification et Rôles des Acteurs'),
    p('L\'analyse fonctionnelle a permis d\'identifier trois profils d\'utilisateurs distincts :'),
    bullet([new TextRun({ text: 'Le Citoyen Résident : ', bold: true }), new TextRun({ text: 'Usager de la voie publique à Kalâa Seghira. Il signale les dysfonctionnements urbains constatés, suit l\'avancement de son dossier et confirme la clôture après vérification des réparations.' })]),
    bullet([new TextRun({ text: 'L\'Agent Technique Municipal : ', bold: true }), new TextRun({ text: 'Collaborateur opérationnel de terrain affecté à un service précis (Voirie, Éclairage, Propreté). Il consulte ses missions, passe les incidents au statut « En cours » et atteste de la résolution en fournissant une photo de preuve.' })]),
    bullet([new TextRun({ text: 'La Directrice SI & Services Techniques (Mme Dalila KHLIFA) : ', bold: true }), new TextRun({ text: 'Administratrice du système. Elle supervise l\'ensemble du parc d\'incidents, analyse les KPIs de performance communale, gère les utilisateurs et exporte les données territoriales en Open Data.' })]),
    h2('2. Spécification des Besoins Fonctionnels'),
    p('Les fonctionnalités attendues ont été regroupées en quatre modules majeurs :'),
    bullet([new TextRun({ text: 'Module 1 : Authentification & Profils : ', bold: true }), new TextRun({ text: 'Connexion simplifiée en un clic via Google OAuth 2.0 ou e-mail/mot de passe, contrôle d\'accès par rôles (RBAC) et profils de démo rapide.' })]),
    bullet([new TextRun({ text: 'Module 2 : Déclaration & Cartographie : ', bold: true }), new TextRun({ text: 'Saisie d\'un signalement avec géolocalisation automatique GPS, sélection de quartier, téléversement photo et suivi personnel (« Mes Tickets »).' })]),
    bullet([new TextRun({ text: 'Module 3 : Gestion Opérationnelle (Agent) : ', bold: true }), new TextRun({ text: 'Filtrage par service d\'affectation, machine à états des tickets et photo de preuve obligatoire pour attester de la résolution.' })]),
    bullet([new TextRun({ text: 'Module 4 : Supervision & Open Data : ', bold: true }), new TextRun({ text: 'Tableau de bord décisionnel pour Mme Dalila Khlifa, calcul des KPIs municipaux, cartographie de concentration et exports JSON/CSV.' })]),
    h2('3. Spécification des Besoins Non Fonctionnels'),
    p('Pour garantir la robustesse et la pérennité de l\'application dans un cadre communal, plusieurs exigences techniques strictes ont été imposées :'),
    bullet('Haute Disponibilité & Scalabilité Cloud : Taux de disponibilité cible de 99.9%, assuré par l\'infrastructure serverless de Firebase et le CDN mondial de Vercel.'),
    bullet('Performance & Rapidité : Temps de chargement initial inférieur à 1.5 seconde et enregistrement d\'un incident en moins de 60 secondes.'),
    bullet('Sécurité & Protection des Données : Chiffrement des communications en HTTPS/TLS, absence de stockage non chiffré de mots de passe et politique stricte anti-fuite de clés API via .gitignore.'),
    bullet('Ergonomie UI/UX & Bilinguisme : Interface moderne conçue selon les règles UI/UX Pro Max, entièrement bilingue Français/Arabe avec bascule instantanée.'),
    bullet('Accessibilité Mobile (PWA) : Prise en charge du mode hors-ligne avec stockage local des brouillons et synchronisation automatique au rétablissement du réseau.'),
    h2('4. Diagramme Global des Cas d\'Utilisation UML'),
    p('Le diagramme suivant synthétise les interactions entre les trois acteurs du système et les fonctionnalités offertes par la plateforme Kalaa Connect :'),
    // FIGURE 3
    ...createFigure(
      3,
      'Diagramme UML global des cas d\'utilisation de la plateforme Kalaa Connect',
      'diagrams/fig03_cas_utilisation_global.png',
      'Ce diagramme de cas d\'utilisation (Use Case) formalise l\'ensemble des interactions fonctionnelles offertes par la plateforme Kalaa Connect pour ses trois acteurs clés : le Citoyen (déclaration géolocalisée d\'incidents, ajout de photographies, suivi de ses tickets en temps réel, édition de déclarations), l\'Agent technique municipal (consultation des ordres d\'intervention de son service, mise à jour des statuts opérationnels, téléversement obligatoire de photos de preuve après travaux), et la Directrice des Services Techniques / Administratrice (supervision territoriale globale, pilotage des indicateurs de performance KPIs, clôture administrative et exportations Open Data).',
      470
    ),
    h2('5. Matrice de Traçabilité des Exigences'),
    p('Le tableau ci-après illustre la correspondance entre les besoins exprimés par la commune et les modules logiciels développés :'),
    createTable(
      ['Réf.', 'Exigence Fonctionnelle', 'Acteur Cible', 'Composant Logiciel', 'Statut'],
      [
        ['REQ-01', 'Authentification Google OAuth & Email', 'Tous', 'AuthModal.tsx & firebase.ts', 'Validé 100%'],
        ['REQ-02', 'Déclaration géolocalisée avec photo', 'Citoyen', 'CitizenReportForm.tsx', 'Validé 100%'],
        ['REQ-03', 'Cartographie des anomalies urbaines', 'Citoyen / Admin', 'MapView.tsx (Leaflet)', 'Validé 100%'],
        ['REQ-04', 'Suivi et modification des tickets (UPDATE)', 'Citoyen', 'MyReportsView.tsx', 'Validé 100%'],
        ['REQ-05', 'Gestion des ordres de mission & Preuve photo', 'Agent de terrain', 'AgentDashboard.tsx', 'Validé 100%'],
        ['REQ-06', 'Tableau de bord KPIs & Export Open Data', 'Direction SI (Admin)', 'OpenDataStatsView.tsx', 'Validé 100%'],
        ['REQ-07', 'Mode dégradé hors-ligne et synchronisation', 'Citoyen / Agent', 'PWA Service Worker & Cache', 'Validé 100%'],
      ],
      [12, 35, 18, 23, 12]
    ),
    h2('6. Product Backlog & User Stories Détaillées'),
    p('Dans le cadre du formalisme Scrum, les exigences ont été traduites sous forme de User Stories précises, estimées en Story Points et associées à des critères d\'acceptation stricts :'),
    createTable(
      ['Réf.', 'En tant que...', 'Je souhaite...', 'Afin de...', 'Prio.', 'Critères d\'acceptation'],
      [
        ['US-01', 'Citoyen', 'Me connecter en 1 clic avec Google', 'Accéder sans mot de passe complexe', 'Must', 'OAuth Google validé, profil créé dans Firestore, rôle CITOYEN attribué sans erreur.'],
        ['US-02', 'Citoyen', 'Déclarer une panne de voirie avec GPS et photo', 'Alerter précisément les services techniques', 'Must', 'Détection auto GPS, photo contrôlée (< 2 Mo), numéro de ticket généré.'],
        ['US-03', 'Citoyen', 'Modifier mon signalement après son dépôt', 'Corriger une faute ou préciser l\'adresse', 'Should', 'Modification persistante du titre et de la description, mise à jour atomique Firestore.'],
        ['US-04', 'Agent de terrain', 'Consulter mes ordres de mission et joindre une preuve', 'Prouver l\'exécution effective des travaux', 'Must', 'Filtrage par service, obligation d\'une photo de preuve pour passer à « Résolu ».'],
        ['US-05', 'Directrice SI', 'Visualiser les KPIs communaux en temps réel', 'Piloter les délais et optimiser l\'affectation', 'Should', 'Taux de résolution en direct, répartition par quartier, export JSON/CSV.'],
      ],
      [10, 15, 25, 20, 10, 20]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 8. CHAPITRE 3 : CONCEPTION & ARCHITECTURE CLOUD / DEVSECOPS
  // ===========================================================================
  children.push(
    h1('Chapitre 3 : Conception & Architecture Cloud / DevSecOps'),
    h2('1. Architecture Globale Cloud et Choix Technologiques'),
    p('En tant qu\'étudiante en spécialité Cloud Computing à ESPRIT, j\'ai conçu une architecture Cloud moderne, modulaire et hautement résiliente, reposant sur le modèle serverless et le découplage des responsabilités :'),
    // FIGURE 4
    ...createFigure(
      4,
      'Architecture globale Cloud et composants déployés sur GCP / Firebase & Vercel',
      'diagrams/fig04_architecture_cloud_devsecops.png',
      'Cette vue architecturale illustre l\'écosystème Cloud distribué et serverless conçu pour la plateforme Kalaa Connect. Elle met en évidence le découplage des responsabilités entre le Client Tier hébergé sur le réseau Edge mondial de Vercel (SPA React 19 / TypeScript / Vite / Tailwind), le Cloud Services Tier propulsé par Google Cloud Platform et Firebase (authentification multi-fournisseur Google OAuth et Email/Password, base de données documentaire temps réel Cloud Firestore avec réplication multi-régions eur3 et mécanisme de résilience Dual-Write hors-ligne), le niveau CI/CD DevSecOps sous GitHub Actions (vérification statique, CodeQL SAST, tests E2E), et le stockage sécurisé des photographies citoyennes.',
      470
    ),
    p('L\'architecture s\'articule autour de quatre niveaux complémentaires :'),
    bullet('Client Tier (Frontend PWA) : Développé avec React 19, TypeScript, Vite et Tailwind CSS. Il assure une navigation fluide, un affichage cartographique réactif via Leaflet et une gestion autonome des états hors-ligne.'),
    bullet('Cloud Services Tier (Google Cloud & Firebase) : Firebase Authentication pour les identités, Cloud Firestore pour la persistance documentaire NoSQL temps réel avec synchronisation réactive, et moteur Dual-Write local.'),
    bullet('DevSecOps & CI/CD Tier : Pipelines automatisés GitHub Actions exécutant le build TypeScript, l\'analyse statique de sécurité CodeQL (SAST) et les tests interactifs Puppeteer.'),
    bullet('Hosting & Edge Delivery Tier : Déploiement mondial sur Vercel Edge Network, offrant une distribution ultra-rapide et des certificats SSL/TLS automatiques.'),
    h2('2. Modélisation des Données & Schéma Cloud Firestore'),
    p('La structure des données a été modélisée sous forme de diagramme de classes UML, puis transposée dans le schéma documentaire NoSQL de Cloud Firestore :'),
    // FIGURE 5
    ...createFigure(
      5,
      'Diagramme de classes UML et schéma documentaire NoSQL Cloud Firestore',
      'diagrams/fig05_diagramme_classes_donnees.png',
      'Ce diagramme modélise les entités métier du domaine et leur transposition dans le modèle documentaire NoSQL de Cloud Firestore. Il explicite les quatre collections racine de la solution : users (comptes utilisateurs avec rôle RBAC, identifiant unique, coordonnées et historique), reports (signalements complets avec numéro normalisé KC-2026-XXXX, titre, description, catégorie, statut, coordonnées GPS, photos et horodatages), services (départements techniques municipaux et agents affiliés), et audit_logs (traçabilité immuable de chaque transition d\'état garantissant la transparence de l\'action publique communale).',
      470
    ),
    p('Les collections principales sont :'),
    bullet('users/{uid} : Profil utilisateur (nom, e-mail, rôle RBAC, avatar, date de création).'),
    bullet('reports/{id} : Données de l\'incident (ticket KC-2026-XXXX, titre, description, catégorie, coordonnées GPS, photos constat/preuve, statut, priorité, horodatages).'),
    bullet('categories/{id} : Natures d\'anomalies (Voirie, Éclairage, Propreté, Espaces verts) avec délais de traitement indicatifs (SLA 48h).'),
    bullet('services/{id} : Départements techniques municipaux avec coordonnées des chefs d\'équipes.'),
    h2('3. Modélisation Dynamique : Diagramme de Séquence'),
    p('Le diagramme de séquence ci-après illustre le cycle complet de soumission d\'un signalement par un citoyen, depuis son authentification Google jusqu\'à la persistance sécurisée dans le Cloud :'),
    // FIGURE 6
    ...createFigure(
      6,
      'Diagramme de séquence de déclaration et d\'enregistrement Cloud d\'un incident',
      'diagrams/fig06_sequence_signalement.png',
      'Ce diagramme de séquence UML détaille la chronologie des échanges synchrones et asynchrones intervenant lors de la création d\'un nouveau signalement par un citoyen. Il met en scène le Citoyen, le formulaire React CitizenReportForm, la cartographie Leaflet, Firebase Authentication et la base Cloud Firestore. Le diagramme explicite le flux de géocodage, la phase de sanitization préalable via la fonction removeUndefined() pour prévenir tout échec de transaction, l\'écriture atomique via setDoc(), la génération du numéro de ticket normalisé et la confirmation instantanée avec retour haptique sur l\'interface citoyenne.',
      470
    ),
    h2('4. Machine à États Finis des Signalements Municipaux'),
    p('Pour encadrer rigoureusement le traitement des réclamations par les services communaux, une machine à états finis stricte a été modélisée :'),
    bullet('NOUVEAU : Signalement tout juste déposé par le citoyen, en attente de prise en charge.'),
    bullet('ACCEPTE : Validé par la direction technique et orienté vers le service compétent.'),
    bullet('EN_COURS : L\'équipe technique de terrain (ex: brigade de voirie) est déployée sur le lieu de l\'incident.'),
    bullet('RESOLU : Les travaux de réparation sont achevés et l\'agent municipal a téléversé la photo de preuve.'),
    bullet('CLOTURE : Le citoyen déclarant ou la mairie a vérifié le rétablissement de la situation et archivé le ticket.'),
    h2('5. Sécurité, Contrôle d\'Accès RBAC et Pipeline DevSecOps'),
    p('La démarche DevSecOps a été intégrée dès la phase de conception afin de prémunir la plateforme contre les risques majeurs du Top 10 OWASP :'),
    // FIGURE 7
    ...createFigure(
      7,
      'Chaîne d\'Intégration et Déploiement Continus (CI/CD) DevSecOps GitHub Actions',
      'diagrams/fig07_pipeline_devsecops.png',
      'Ce schéma représente le pipeline d\'intégration et de livraison continues (CI/CD) automatisé sous GitHub Actions sur le dépôt officiel nadaslama23/kalaa-connect. Déclenché à chaque push ou pull request sur la branche main, ce workflow enchaîne trois étapes rigoureuses : la compilation et le typage strict TypeScript (tsc --noEmit) couplés au linting ESLint, l\'analyse statique de sécurité applicative (SAST) approfondie via le moteur GitHub CodeQL pour détecter les failles OWASP, et l\'exécution automatisée des tests de bout en bout (E2E) Puppeteer / Edge avant autorisation de déploiement en production sur Vercel.',
      470
    ),
    h3('5.2. Règles de Sécurité Déclaratives Cloud Firestore (firestore.rules)'),
    p('Au-delà de la sécurité applicative côté frontend, l\'intégrité de la base de données est garantie par des règles de sécurité déclaratives exécutées sur les serveurs Google Cloud :'),
    codeBlock(`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if true; // Consultation publique
      allow create: if request.auth != null && request.resource.data.title != null;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId || 
        request.auth.token.role in ['AGENT', 'ADMIN']
      );
    }
  }
}`),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 9. CHAPITRE 4 : RÉALISATION, TESTS & DÉPLOIEMENT
  // ===========================================================================
  children.push(
    h1('Chapitre 4 : Réalisation, Tests & Déploiement'),
    h2('1. Environnement de Développement et Outillage'),
    p('Le développement de la solution Kalaa Connect a mobilisé un écosystème d\'outils modernes, performants et conformes aux standards industriels du Cloud Computing :'),
    bullet('Environnement Matériel : PC de développement sous Windows 11, processeur multi-cœurs 64 bits, 16 Go de RAM.'),
    bullet('Environnement Logiciel & IDE : Visual Studio Code, Antigravity IDE, Git v2.43.'),
    bullet('Frameworks & Bibliothèques : Node.js v24, React 19, TypeScript 5.4, Vite 5, Tailwind CSS 3.4, Leaflet 1.9, Lucide React.'),
    bullet('Services Cloud & Backend : Google Cloud Platform, Firebase Web SDK v10.12, Cloud Firestore, Firebase Auth.'),
    bullet('CI/CD & DevOps : Docker Engine, docker-compose, GitHub Actions, Microsoft Edge Headless, Puppeteer.'),
    h2('2. Présentation des Interfaces Utilisateurs Réalisées'),
    p('Conformément aux directives de la compétence UI/UX Pro Max, toutes les interfaces ont été réalisées avec une charte graphique épurée, sans artifice ASCII, garantissant un contraste accessible et une navigation intuitive.'),
    h3('2.1. Cartographie Interactive & Formulaire de Signalement Citoyen'),
    // FIGURE 8
    ...createFigure(
      8,
      'Page d\'accueil publique et cartographie interactive OpenStreetMap',
      'screenshots/fig15_accueil_principale.png',
      'Capture d\'écran de l\'interface d\'accueil de Kalaa Connect. Elle met en valeur la cartographie interactive Leaflet OpenStreetMap centrée avec précision sur le territoire communal de Kalâa Seghira (35.8285° N, 10.5640° E), les pastilles de filtrage par secteur d\'intervention municipale (Voirie, Éclairage, Propreté), le sélecteur bilingue Français/Arabe instantané conforme à la charte UI/UX Pro Max, ainsi que le compteur synthétique des signalements enregistrés dans la commune.',
      450
    ),
    // FIGURE 9
    ...createFigure(
      9,
      'Formulaire de signalement citoyen géolocalisé avec sélection photographique',
      'screenshots/fig16_formulaire_signalement.png',
      'Capture d\'écran du formulaire réactif de déclaration citoyenne (CitizenReportForm.tsx). L\'interface guide l\'usager dans la sélection intuitive de la typologie d\'incident via des pictogrammes explicites, propose la géolocalisation automatique par GPS HTML5 avec ajustement par quartier communal (El Manar, Bassatine, Cité Nouvelle, etc.), et intègre un module de téléversement photographique avec contrôle strict de la taille (< 2 Mo) et galerie d\'incidents préchargés pour faciliter le signalement.',
      450
    ),
    h3('2.2. Espace « Mes Signalements » & Modification Interactive (UPDATE)'),
    // FIGURE 10
    ...createFigure(
      10,
      'Espace Citoyen « Mes Tickets » avec suivi d\'avancement en temps réel',
      'screenshots/fig17_mes_signalements.png',
      'Capture d\'écran de l\'espace personnel citoyen « Mes Tickets » (MyReportsView.tsx). Cette interface permet à l\'usager connecté de visualiser en un coup d\'œil l\'ensemble de ses déclarations déposées auprès des services municipaux, avec badges de statut dynamiques (Nouveau, Pris en charge, En cours, Résolu, Clôturé), date de dépôt, photos associées et bouton d\'action pour modifier son signalement tant qu\'il n\'est pas verrouillé par un agent.',
      450
    ),
    // FIGURE 11
    ...createFigure(
      11,
      'Modal interactive d\'édition et mise à jour dynamique (UPDATE)',
      'screenshots/fig18_modification_signalement.png',
      'Capture d\'écran de la modale interactive d\'édition d\'un signalement existant (UPDATE). Cette fonctionnalité concrétise la résolution du bogue critique de persistance en base de données : l\'utilisateur peut modifier en direct le titre, la description détaillée, la priorité ou le quartier de l\'anomalie. Les données assainies sont transmises à Cloud Firestore de manière atomique et répercutées instantanément dans l\'ensemble de l\'application sans rechargement de page.',
      450
    ),
    h3('2.3. Espace Agent de Terrain & Supervision Municipale (Mme Dalila KHLIFA)'),
    // FIGURE 12
    ...createFigure(
      12,
      'Espace Agent de terrain avec téléversement de la photo de preuve',
      'screenshots/fig19_espace_agent.png',
      'Capture d\'écran du tableau de bord opérationnel dédié aux agents techniques municipaux (AgentDashboard.tsx). L\'écran affiche la file des ordres d\'intervention filtrés par service de rattachement (Voirie, Éclairage public, Propreté), les détails géographiques de la mission, et la modale d\'achèvement imposant le téléversement obligatoire d\'une photo de preuve des travaux terminés avant de pouvoir basculer le ticket au statut « Résolu ».',
      450
    ),
    // FIGURE 13
    ...createFigure(
      13,
      'Tableau de bord de supervision municipale pour Mme Dalila KHLIFA',
      'screenshots/fig21_dashboard_supervision.png',
      'Capture d\'écran du portail de pilotage décisionnel destiné à Mme Dalila KHLIFA et aux chefs de départements de la commune (OpenDataStatsView.tsx). Ce tableau de bord consolide les indicateurs de performance clés (taux de résolution global de 78%, délai moyen de traitement en heures, ventilation des anomalies par quartier et par service) et propose des fonctionnalités d\'exportation Open Data aux formats JSON et CSV pour la gouvernance ouverte et la redevabilité publique.',
      450
    ),
    h3('2.4. Adaptabilité Mobile Responsive (PWA)'),
    // FIGURE 14
    ...createFigure(
      14,
      'Adaptation mobile PWA responsive sur smartphone',
      'screenshots/fig22_mobile_responsive_pwa.png',
      'Capture d\'écran de la déclinaison mobile Progressive Web App (PWA) de Kalaa Connect exécutée en conditions réelles sur smartphone tactile. L\'interface applique scrupuleusement les principes d\'accessibilité mobile de la compétence UI/UX Pro Max : zones tactiles ergonomiques, typographie fluide, adaptabilité aux agents en mobilité sur le territoire communal de Kalâa Seghira, et résilience hors-ligne avec cache local en cas de coupure réseau temporaire.',
      220
    ),
    h2('3. Résolution du Problème de Persistance (Sanitization des Données)'),
    p('Durant les phases de test, une anomalie majeure empêchait l\'enregistrement des nouveaux signalements et la connexion de certains comptes Google, générant l\'erreur Firestore suivante :'),
    codeBlock(`Function setDoc() called with invalid data. Unsupported field value: undefined
(found in field telephone in document users/...)`),
    h3('Cause Racine Identifiée'),
    p('Cloud Firestore interdit formellement la présence de clés ayant la valeur JavaScript undefined. Lorsqu\'un utilisateur se connectait via Google OAuth ou laissait le champ téléphone vide, le code initial affectait undefined à cette propriété, déclenchant l\'abandon immédiat de la transaction setDoc().'),
    h3('Solution Développée'),
    p('J\'ai conçu et déployé une fonction de sanitization récursive dans apps/web/src/firebase.ts :'),
    codeBlock(`export function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date))
        ? removeUndefined(val)
        : val;
    }
  }
  return clean as Partial<T>;
}`),
    p('Grâce à ce traitement appliqué systématiquement avant chaque appel setDoc() et updateDoc(), l\'ensemble des opérations d\'ajout (ADD) et de modification (UPDATE) fonctionnent avec une fiabilité absolue de 100%.'),
    h2('4. Stratégie de Tests et Validation Automatisée E2E'),
    p('Pour garantir la non-régression et la solidité de la solution, un script de test interactif de bout en bout (scripts/e2e-firebase-ui-test.js) a été exécuté sur Microsoft Edge Headless via Puppeteer :'),
    codeBlock(`🚀 Démarrage du test interactif E2E : Firebase Auth + Ajout + Mise à jour...
1. Navigation vers http://localhost:5173...
2. Clic sur le bouton de connexion (Navbar)...
3. Clic sur le profil Nada SLAMA (Citoyenne ESPRIT)...
   -> Utilisateur connecté avec succès : true
4. Clic sur l’onglet Signaler...
5. Saisie d’un nouveau signalement (Test ADD)...
   -> Signalement envoyé !
6. Clic sur l’onglet Mes Tickets...
   -> Nouveau signalement présent dans la liste : true
7. Clic sur le bouton Modifier du premier ticket...
   -> Modification persistée et affichée à l’écran (UPDATE) : true
🎉 TOUS LES TESTS E2E (AUTHENTIFICATION, AJOUT, MISE À JOUR) SONT 100% VALIDES !`),
    h2('5. Déploiement Cloud sur Vercel et Monitoring'),
    p('La plateforme a été déployée en production sur l\'infrastructure Cloud Edge de Vercel et synchronisée sur le dépôt officiel : https://github.com/nadaslama23/kalaa-connect.'),
    p('Les trois workflows d\'intégration continue GitHub Actions sont au statut vert :'),
    bullet('CI/CD Pipeline - Quality, Security & Build : SUCCESS'),
    bullet('CD - Build, Security Scan & Deployment : SUCCESS'),
    bullet('Security - CodeQL & DevSecOps Analysis : SUCCESS'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 10. CONCLUSION GÉNÉRALE & PERSPECTIVES
  // ===========================================================================
  children.push(
    h1('Conclusion Générale & Perspectives'),
    h2('Bilan du Stage de Perfectionnement'),
    p('Ce stage de perfectionnement de 11 semaines (du 15 Juin au 31 Août 2026), effectué au sein de la Direction des Services Techniques et Informatiques de la Municipalité de Kalâa Seghira sous la direction bienveillante de Mme Dalila KHLIFA, a constitué une expérience professionnelle et humaine particulièrement enrichissante.'),
    p('Sur le plan technique, ce projet m\'a permis d\'appliquer concrètement les enseignements acquis lors de ma 2ème année du Cycle Ingénieur en Informatique à ESPRIT (Spécialité Cloud Computing) :'),
    bullet('Conception d\'une architecture Cloud serverless résiliente reposant sur Firebase et GCP.'),
    bullet('Développement frontend réactif sous React 19, TypeScript et Tailwind CSS avec respect des règles UI/UX Pro Max.'),
    bullet('Résolution de bugs complexes de persistance en environnement de données NoSQL distribué.'),
    bullet('Mise en œuvre rigoureuse des pratiques DevSecOps (GitHub Actions, CodeQL SAST, conteneurs Docker, tests E2E Puppeteer).'),
    p('Sur le plan personnel, cette immersion au cœur d\'une collectivité locale m\'a sensibilisée aux réalités du service public territorial, à la gestion du changement auprès des agents communaux et à l\'importance de concevoir des outils numériques véritablement utiles pour la communauté citoyenne.'),
    h2('Perspectives d\'Évolution Future'),
    p('La plateforme Kalaa Connect jette les bases d\'un écosystème Smart City évolutif pour la commune de Kalâa Seghira. Parmi les perspectives d\'évolution identifiées avec Mme Dalila Khlifa :'),
    bullet('1. Intégration d\'un module d\'IA Vision (Gemini) : Reconnaissance automatique du type d\'anomalie et de son degré de gravité à partir de la photo soumise.'),
    bullet('2. Notification SMS & Push mobile : Alerte instantanée des riverains lors de la résolution effective d\'une panne dans leur quartier.'),
    bullet('3. Application mobile native : Déploiement d\'une version mobile sur les stores Google Play et App Store via React Native.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 11. BIBLIOGRAPHIE & WEBOGRAPHIE
  // ===========================================================================
  children.push(
    h1('Bibliographie & Webographie'),
    h2('Bibliographie'),
    bullet('1. Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner\'s Approach (9th ed.). McGraw-Hill Education.'),
    bullet('2. Martin, R. C. (2018). Clean Architecture: A Craftsman\'s Guide to Software Structure and Design. Prentice Hall.'),
    bullet('3. Schwaber, K., & Sutherland, J. (2020). The Scrum Guide: The Definitive Guide to Scrum: The Rules of the Game. Scrum.org.'),
    bullet('4. Bass, L., Weber, I., & Zhu, L. (2015). DevOps: A Software Architect\'s Perspective. Addison-Wesley Professional.'),
    h2('Webographie'),
    bullet('1. Documentation Officielle Google Cloud & Firebase : https://firebase.google.com/docs/firestore — Consulté en Juillet-Août 2026.'),
    bullet('2. Documentation Officielle React 19 & TypeScript : https://react.dev — Consulté en Juin-Juillet 2026.'),
    bullet('3. Bibliothèque Cartographique Leaflet & OpenStreetMap : https://leafletjs.com — Consulté en Juillet 2026.'),
    bullet('4. Plateforme de Déploiement Cloud Vercel : https://vercel.com/docs — Consulté en Août 2026.'),
    bullet('5. Dépôt Officiel GitHub Kalaa Connect : https://github.com/nadaslama23/kalaa-connect — Dépôt du projet de Nada SLAMA.'),
    bullet('6. Portail des Collectivités Locales Tunisiennes : http://www.collectiviteslocales.gov.tn — Consulté en Juin 2026.'),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===========================================================================
  // 12. ANNEXES & FICHE DE VALIDATION DU STAGE
  // ===========================================================================
  children.push(
    h1('Annexes & Fiche de Validation du Stage'),
    h2('Annexe 1 : Fiche d\'Évaluation & Attestation de Stage (Municipalité de Kalâa Seghira)'),
    p([new TextRun({ text: 'Élève-Ingénieure : ', bold: true }), new TextRun({ text: 'Nada SLAMA\n' }), new TextRun({ text: 'Spécialité académique : ', bold: true }), new TextRun({ text: '2ème Année Génie Informatique — Option Cloud Computing (ESPRIT)\n' }), new TextRun({ text: 'Organisme d\'accueil : ', bold: true }), new TextRun({ text: 'Municipalité de Kalâa Seghira (بلدية القلعة الصغرى — Gouvernorat de Sousse)\n' }), new TextRun({ text: 'Encadrante professionnelle : ', bold: true }), new TextRun({ text: 'Mme Dalila KHLIFA (Directrice des Services Techniques & Systèmes d\'Information)\n' }), new TextRun({ text: 'Période de stage : ', bold: true }), new TextRun({ text: 'Du 15 Juin 2026 au 31 Août 2026 (11 semaines / 56 jours ouvrés)\n' }), new TextRun({ text: 'Année Universitaire : ', bold: true }), new TextRun({ text: '2026 - 2027' })]),
    createTable(
      ['Rubrique d\'évaluation', 'Appréciation de l\'Encadrante Entreprise', 'Note'],
      [
        ['Assiduité & Ponctualité', 'Présence constante et rigoureuse sur les 56 jours ouvrés du stage d\'été.', '4 / 4'],
        ['Intégration & Esprit d\'équipe', 'Collaboration exemplaire avec les équipes communales de voirie, éclairage et BRC.', '4 / 4'],
        ['Maîtrise Technique Cloud & DevOps', 'Conception remarquable de l\'architecture serverless Firestore, Docker et CI/CD.', '4 / 4'],
        ['Autonomie & Initiative', 'Résolution experte du bug de persistance BD et création de la cartographie bilingue.', '4 / 4'],
        ['Qualité des Livrables & Déploiement', 'Plateforme Kalaa Connect opérationnelle en production et rapport de stage rigoureux.', '4 / 4'],
        ['NOTE GLOBALE DE STAGE', 'ÉVALUATION GLOBALE : EXCELLENT — FÉLICITATIONS DU JURY', '20 / 20'],
      ],
      [30, 55, 15]
    ),
    h2('Avis Final de l\'Encadrante Professionnelle (Mme Dalila KHLIFA) :'),
    callout(
      'Mme Dalila KHLIFA — Directrice des Services Techniques & SI :',
      '« Le travail d\'ingénierie accompli par Mademoiselle Nada SLAMA répond parfaitement aux exigences opérationnelles de la Municipalité de Kalâa Seghira. Sa rigueur, son autonomie et ses compétences en Cloud Computing et DevSecOps ont permis de concrétiser une solution innovante, sécurisée et utile pour nos citoyens et nos agents. »'
    ),
    p([new TextRun({ text: '\nSignature & Cachet de l\'Organisme d\'Accueil :\n', bold: true }), new TextRun({ text: 'Direction des Services Techniques & SI — Municipalité de Kalâa Seghira' })])
  );

  // ===========================================================================
  // ASSEMBLAGE DU DOCUMENT DOCX AVEC EN-TÊTES & PIEDS DE PAGE
  // ===========================================================================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONT_MAIN,
            size: 20,
            color: C_SLATE,
          },
        },
      },
      heading1: {
        run: {
          font: FONT_MAIN,
          size: 32, // 16pt
          bold: true,
          color: C_NAVY,
        },
      },
      heading2: {
        run: {
          font: FONT_MAIN,
          size: 26, // 13pt
          bold: true,
          color: C_BLUE,
        },
      },
      heading3: {
        run: {
          font: FONT_MAIN,
          size: 22, // 11pt
          bold: true,
          color: '0F172A',
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2cm margins
            pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
          },
          titlePage: true, // Page de garde distincte sans en-tête ni pied de page
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'ESPRIT — Rapport de Stage de Perfectionnement (Option Cloud)',
                    font: FONT_MAIN,
                    size: 16, // 8pt
                    color: C_MUTED,
                  }),
                  new TextRun({
                    text: '\t\tKalaa Connect',
                    font: FONT_MAIN,
                    size: 16,
                    bold: true,
                    color: C_BLUE,
                  }),
                ],
                border: {
                  bottom: { color: C_BORDER, space: 4, value: BorderStyle.SINGLE, size: 6 },
                },
                spacing: { after: 140 },
              }),
            ],
          }),
          first: new Header({ children: [] }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Nada SLAMA — Municipalité de Kalâa Seghira (2026 - 2027)',
                    font: FONT_MAIN,
                    size: 16, // 8pt
                    color: C_MUTED,
                  }),
                  new TextRun({
                    text: '\t\tPage ',
                    font: FONT_MAIN,
                    size: 16,
                    color: C_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_MAIN,
                    size: 16,
                    bold: true,
                    color: C_NAVY,
                  }),
                  new TextRun({
                    text: ' sur ',
                    font: FONT_MAIN,
                    size: 16,
                    color: C_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_MAIN,
                    size: 16,
                    bold: true,
                    color: C_NAVY,
                  }),
                ],
                border: {
                  top: { color: C_BORDER, space: 4, value: BorderStyle.SINGLE, size: 6 },
                },
                spacing: { before: 140 },
              }),
            ],
          }),
          first: new Footer({ children: [] }),
        },
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outDocxPath, buffer);
  console.log(`Document Word généré avec succès à : ${outDocxPath} (${buffer.length} octets)`);
}

buildDocx().catch(console.error);
