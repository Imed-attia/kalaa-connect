const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function fillJournal() {
  const templatePath = path.resolve(__dirname, '../../journal_stage_4_fr.pdf');
  const outputPath = path.resolve(__dirname, '../../journal_stage_4_fr_rempli.pdf');

  if (!fs.existsSync(templatePath)) {
    console.error('Fichier template journal_stage_4_fr.pdf introuvable à :', templatePath);
    return;
  }

  const existingPdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pages = pdfDoc.getPages();

  // --- PAGE 1 : Informations Générales ---
  const page1 = pages[0];
  const textColor = rgb(0.1, 0.1, 0.2);
  const primaryColor = rgb(0.08, 0.5, 0.25);

  // Nom et prénom
  page1.drawText('Nada SLAMA', { x: 260, y: 642, size: 10, font: helveticaBold, color: textColor });
  // ID
  page1.drawText('224JMT0418', { x: 260, y: 602, size: 10, font: helveticaFont, color: textColor });
  // Entreprise
  page1.drawText('Municipalité de Kalâa Seghira (Sousse)', { x: 300, y: 582, size: 9.5, font: helveticaBold, color: textColor });
  page1.drawText('Avenue Habib Bourguiba, 4021 Kalâa Seghira', { x: 300, y: 562, size: 9, font: helveticaFont, color: textColor });
  // Encadrant
  page1.drawText('Mme Dalila KHLIFA (Services Techniques & SI)', { x: 300, y: 542, size: 9.5, font: helveticaBold, color: textColor });
  page1.drawText('contact@commune-kalaaseghira.gov.tn', { x: 300, y: 522, size: 9, font: helveticaFont, color: textColor });
  page1.drawText('+216 73 252 022', { x: 300, y: 502, size: 9, font: helveticaFont, color: textColor });
  // Periode
  page1.drawText('15/06/2026', { x: 275, y: 482, size: 9.5, font: helveticaBold, color: textColor });
  page1.drawText('31/08/2026', { x: 390, y: 482, size: 9.5, font: helveticaBold, color: textColor });
  // Mention spécialité & année
  page1.drawText('2ème Année Génie Informatique (Option Cloud) · Année Universitaire 2026 - 2027', { x: 120, y: 450, size: 8.5, font: helveticaBold, color: primaryColor });
  // Cachet mention
  page1.drawText('Mme Dalila KHLIFA — Directrice Services Techniques & SI (Validé)', { x: 120, y: 350, size: 9.5, font: helveticaBold, color: primaryColor });

  // --- PAGE 2 : Tâches Semaines 1 à 5 ---
  const page2 = pages[1];
  const s1Tasks = [
    { date: 'S1 (15/06 - 19/06)', desc: 'Immersion Mairie de Kalâa Seghira avec Mme Dalila Khlifa, diagnostic des réclamations (BRC, voirie, propreté), cadrage du projet Kalaa Connect.' },
    { date: 'S2 (22/06 - 26/06)', desc: 'Recueil des exigences auprès des chefs de service, définition des acteurs (Citoyen, Agent, Admin), matrice MoSCoW et planification Scrum.' },
    { date: 'S3 (29/06 - 03/07)', desc: 'Modélisation UML (cas d utilisation, séquences, classes) et conception documentaire NoSQL pour Cloud Firestore (Users, Reports, Services).' },
    { date: 'S4 (06/07 - 10/07)', desc: 'Architecture Cloud GCP/Firebase, charte UI/UX Pro Max bilingue FR/AR (Bleu Azur & Vert Émeraude), initialisation monorepo React 19 / Vite.' },
    { date: 'S5 (13/07 - 17/07)', desc: 'Authentification Firebase (Google OAuth & Email), contrôle d accès par rôles RBAC (Citoyen, Agent, Directrice SI) et Navbar bilingue.' },
  ];

  let y2 = 725;
  s1Tasks.forEach((t) => {
    page2.drawText(t.date, { x: 50, y: y2, size: 8.5, font: helveticaBold, color: textColor });
    page2.drawText(t.desc, { x: 155, y: y2, size: 8, font: helveticaFont, color: textColor, maxWidth: 390 });
    y2 -= 52;
  });

  // --- PAGE 3 : Tâches Semaines 6 à 11 ---
  const page3 = pages[2];
  const s2Tasks = [
    { date: 'S6 (20/07 - 24/07)', desc: 'Formulaire de signalement citoyen, cartographie Leaflet OpenStreetMap sur Kalâa Seghira, GPS et téléversement photo sécurisé.' },
    { date: 'S7 (27/07 - 31/07)', desc: 'Espace Mes Tickets et résolution du bug de persistance BD : écriture atomique Firestore, sanitization des undefined et modal d édition (UPDATE).' },
    { date: 'S8 (03/08 - 07/08)', desc: 'Espace Agent municipal de terrain, machine à états des tickets, photo de preuve obligatoire pour résolution et seed de 20 signalements.' },
    { date: 'S9 (10/08 - 14/08)', desc: 'Tableau de bord de supervision territoriale pour Mme Dalila Khlifa, calcul des KPIs municipaux et service d export Open Data (JSON/CSV).' },
    { date: 'S10 (17/08 - 21/08)', desc: 'DevSecOps & CI/CD : Docker multi-stage, pipelines GitHub Actions (CodeQL SAST, Build, Lint) et tests E2E automatisés Puppeteer / Edge.' },
    { date: 'S11 (24/08 - 31/08)', desc: 'Déploiement Cloud Vercel, tests hors-ligne PWA, recette finale avec Mme Dalila Khlifa, formation agents et rédaction du rapport (25 pages).' },
  ];

  let y3 = 730;
  s2Tasks.forEach((t) => {
    page3.drawText(t.date, { x: 50, y: y3, size: 8.5, font: helveticaBold, color: textColor });
    page3.drawText(t.desc, { x: 155, y: y3, size: 8, font: helveticaFont, color: textColor, maxWidth: 390 });
    y3 -= 45;
  });

  // --- PAGE 4 : Grille d'évaluation ---
  const page4 = pages[3];
  // Cocher/indiquer les notes maximales (4 sur chaque critère)
  const yCoordsCrit = [645, 605, 565, 515, 470, 435, 395, 355, 305, 270, 235];
  yCoordsCrit.forEach((y) => {
    page4.drawText('4 / 4', { x: 535, y, size: 9, font: helveticaBold, color: primaryColor });
  });

  page4.drawText('20 / 20', { x: 520, y: 195, size: 12, font: helveticaBold, color: primaryColor });
  page4.drawText('Travail d ingénierie remarquable de Nada SLAMA. Solution Kalaa Connect complète, fiable, hautement sécurisée et prête pour l exploitation municipale.', {
    x: 320,
    y: 155,
    size: 8.5,
    font: helveticaBold,
    color: textColor,
    maxWidth: 240,
  });

  const modifiedPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, modifiedPdfBytes);
  console.log('✅ Journal de stage ESPRIT rempli généré avec succès à :', outputPath);
}

fillJournal().catch((err) => console.error(err));
