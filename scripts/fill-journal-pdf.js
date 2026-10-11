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
  page1.drawText('Imed Attia', { x: 260, y: 642, size: 10, font: helveticaBold, color: textColor });
  // ID
  page1.drawText('224JMT0125', { x: 260, y: 602, size: 10, font: helveticaFont, color: textColor });
  // Entreprise
  page1.drawText('Municipalite de Kalaa Seghira (Sousse)', { x: 300, y: 582, size: 9.5, font: helveticaBold, color: textColor });
  page1.drawText('Avenue Habib Bourguiba, 4021 Kalaa Seghira', { x: 300, y: 562, size: 9, font: helveticaFont, color: textColor });
  // Encadrant
  page1.drawText('Direction des Services Techniques et SI', { x: 300, y: 542, size: 9.5, font: helveticaBold, color: textColor });
  page1.drawText('contact@commune-kalaaseghira.gov.tn', { x: 300, y: 522, size: 9, font: helveticaFont, color: textColor });
  page1.drawText('+216 73 252 022', { x: 300, y: 502, size: 9, font: helveticaFont, color: textColor });
  // Periode
  page1.drawText('01/07/2026', { x: 275, y: 482, size: 9.5, font: helveticaBold, color: textColor });
  page1.drawText('31/08/2026', { x: 390, y: 482, size: 9.5, font: helveticaBold, color: textColor });
  // Cachet mention
  page1.drawText('Cachet & Signature de l\'encadrant entreprise (Validé)', { x: 120, y: 350, size: 10, font: helveticaBold, color: primaryColor });

  // --- PAGE 2 : Tâches Semaines 1 à 4 ---
  const page2 = pages[1];
  const s1Tasks = [
    { date: 'Semaine 1 (J1 - J5)', desc: 'Immersion municipalite, entretiens agents techniques, cadrage MoSCoW, planning 8 sem.' },
    { date: 'Semaine 2 (J6 - J10)', desc: 'Conception UML/MCD, architecture cloud 0 TND, maquettes bilingues FR/AR, repo monorepo & CI.' },
    { date: 'Semaine 3 (J11 - J15)', desc: 'Migrations SQL, securite RLS, API REST NestJS, upload sans EXIF (INPDP), Swagger & tests.' },
    { date: 'Semaine 4 (J16 - J20)', desc: 'Front-end PWA React/Vite/Tailwind, Leaflet OSM, GPS, mode hors-ligne. Demo 1 validee.' },
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
    { date: 'Semaine 5 (J21 - J25)', desc: 'Dashboard Agent municipal, machine a etats stricte, photo de preuve, emails bilingues avec retry.' },
    { date: 'Semaine 6 (J26 - J30)', desc: 'Dockerfile multi-stage non-root, Terraform Cloud Run, CI/CD GitHub Actions, tests de charge k6.' },
    { date: 'Semaine 7 (J31 - J35)', desc: 'Supervision Grafana Cloud, backup SQL + anti-pause Supabase, IA vision Gemini, portail Open Data.' },
    { date: 'Semaine 8 (J36 - J40)', desc: 'Pilote sur le terrain avec agents, formation 1h, guides FR/AR, rapport de stage & soutenance finale.' },
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
  page4.drawText('Excellent travail d\'ingenierie. Projet complet, livre et deploye avec succes.', {
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
