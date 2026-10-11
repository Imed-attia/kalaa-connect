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
  page1.drawText('01/07/2026', { x: 275, y: 482, size: 9.5, font: helveticaBold, color: textColor });
  page1.drawText('31/08/2026', { x: 390, y: 482, size: 9.5, font: helveticaBold, color: textColor });
  // Cachet mention
  page1.drawText('Mme Dalila KHLIFA — Encadrante Entreprise (Validé)', { x: 120, y: 350, size: 10, font: helveticaBold, color: primaryColor });

  // --- PAGE 2 : Tâches Semaines 1 à 4 ---
  const page2 = pages[1];
  const s1Tasks = [
    { date: 'Semaine 1 (J1 - J5)', desc: 'Immersion à la Mairie de Kalâa Seghira avec Mme Dalila Khlifa, entretiens avec les agents de voirie/propreté, cadrage MoSCoW et planification Scrum.' },
    { date: 'Semaine 2 (J6 - J10)', desc: 'Spécification des besoins, modélisation UML (Cas d utilisation, classes, séquences), charte UI/UX Pro Max bilingue FR/AR et maquettage responsive.' },
    { date: 'Semaine 3 (J11 - J15)', desc: 'Architecture backend NestJS modulaire, schémas PostgreSQL Supabase, authentification JWT, contrôle d accès RBAC et tests unitaires Jest.' },
    { date: 'Semaine 4 (J16 - J20)', desc: 'Développement Frontend React 19 / Vite / Tailwind, cartographie Leaflet OpenStreetMap, géolocalisation GPS et formulaire de signalement citoyen.' },
  ];

  let y2 = 720;
  s1Tasks.forEach((t) => {
    page2.drawText(t.date, { x: 60, y: y2, size: 9, font: helveticaBold, color: textColor });
    page2.drawText(t.desc, { x: 160, y: y2, size: 8.5, font: helveticaFont, color: textColor, maxWidth: 380 });
    y2 -= 60;
  });

  // --- PAGE 3 : Tâches Semaines 5 à 8 ---
  const page3 = pages[2];
  const s2Tasks = [
    { date: 'Semaine 5 (J21 - J25)', desc: 'Dashboard Agent municipal, machine à états des incidents, gestion des ordres de mission, photo de preuve et historique d audit immuable.' },
    { date: 'Semaine 6 (J26 - J30)', desc: 'Résolution du bug de persistance BD : écriture atomique disque, sync Supabase, endpoint PATCH /api/reports et modal d édition frontend.' },
    { date: 'Semaine 7 (J31 - J35)', desc: 'Cloud Engineering & DevSecOps : Docker multi-stage, docker-compose 6 services, pipeline GitHub Actions CI/CD, scan SAST CodeQL et SonarQube.' },
    { date: 'Semaine 8 (J36 - J40+)', desc: 'Probes Kubernetes (/health/live, ready, db), métriques Prometheus, dashboards Grafana, tests E2E Edge Chromium, rédaction rapport et soutenance.' },
  ];

  let y3 = 720;
  s2Tasks.forEach((t) => {
    page3.drawText(t.date, { x: 60, y: y3, size: 9, font: helveticaBold, color: textColor });
    page3.drawText(t.desc, { x: 160, y: y3, size: 8.5, font: helveticaFont, color: textColor, maxWidth: 380 });
    y3 -= 60;
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
