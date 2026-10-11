const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');

const mdPath = path.resolve(__dirname, '../../RAPPORT_STAGE_2EME_ANNEE_NADA_SLAMA.md');
const outDocxPath = path.resolve(__dirname, '../../RAPPORT_STAGE_2EME_ANNEE_NADA_SLAMA.docx');

if (!fs.existsSync(mdPath)) {
  console.error('Fichier markdown source introuvable :', mdPath);
  process.exit(1);
}

const mdContent = fs.readFileSync(mdPath, 'utf8');
const lines = mdContent.split(/\r?\n/);

const children = [];

// Page de garde formelle
children.push(
  new Paragraph({
    text: "RÉPUBLIQUE TUNISIENNE",
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 }
  }),
  new Paragraph({
    text: "MINISTÈRE DE L’ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE",
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 }
  }),
  new Paragraph({
    text: "ÉCOLE SUPÉRIEURE PRIVÉE D'INGÉNIERIE ET DE TECHNOLOGIES (ESPRIT)",
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 }
  }),
  new Paragraph({
    text: "DÉPARTEMENT GÉNIE INFORMATIQUE",
    alignment: AlignmentType.CENTER,
    spacing: { after: 400 }
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: "RAPPORT DE STAGE DE PERFECTIONNEMENT",
        bold: true,
        size: 32,
        color: "1E3A8A"
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 }
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: "2ème Année Cycle Ingénieur en Informatique — Année 2025-2026",
        italics: true,
        size: 24
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 }
  }),
  new Paragraph({
    children: [
      new TextRun({
        text: "KALAA CONNECT : Plateforme Cloud Municipale Intelligente de Gestion et de Suivi des Interventions et Signalements Citoyens",
        bold: true,
        size: 28,
        color: "0F172A"
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 800 }
  }),
  new Paragraph({
    children: [
      new TextRun({ text: "Élève-Ingénieure : ", bold: true, size: 24 }),
      new TextRun({ text: "Nada SLAMA\n", size: 24 }),
      new TextRun({ text: "Encadrante Professionnelle : ", bold: true, size: 24 }),
      new TextRun({ text: "Mme Dalila KHLIFA (Responsable des Services Techniques & SI)\n", size: 24 }),
      new TextRun({ text: "Organisme d'Accueil : ", bold: true, size: 24 }),
      new TextRun({ text: "Municipalité de Kalâa Seghira (Gouvernorat de Sousse)", size: 24 })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 1000 }
  })
);

let inCodeBlock = false;
let codeBuffer = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.trim().startsWith('```')) {
    if (!inCodeBlock) {
      inCodeBlock = true;
      codeBuffer = [];
    } else {
      inCodeBlock = false;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeBuffer.join('\n'),
              font: "Consolas",
              size: 18,
              color: "334155"
            })
          ],
          spacing: { before: 120, after: 120 }
        })
      );
      codeBuffer = [];
    }
    continue;
  }

  if (inCodeBlock) {
    codeBuffer.push(line);
    continue;
  }

  if (line.startsWith('# ')) {
    children.push(
      new Paragraph({
        text: line.replace('# ', '').trim(),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 180 }
      })
    );
  } else if (line.startsWith('## ')) {
    children.push(
      new Paragraph({
        text: line.replace('## ', '').trim(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 }
      })
    );
  } else if (line.startsWith('### ')) {
    children.push(
      new Paragraph({
        text: line.replace('### ', '').trim(),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 80 }
      })
    );
  } else if (line.startsWith('- ') || line.startsWith('* ')) {
    children.push(
      new Paragraph({
        text: line.replace(/^[-*]\s+/, '').replace(/\*\*/g, ''),
        bullet: { level: 0 },
        spacing: { after: 60 }
      })
    );
  } else if (line.trim().length > 0 && !line.startsWith('<') && !line.startsWith('---')) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: line.replace(/\*\*/g, '').replace(/__/g, ''),
            size: 22
          })
        ],
        spacing: { after: 120 }
      })
    );
  }
}

const doc = new Document({
  creator: "Nada SLAMA",
  title: "Rapport de Stage de Perfectionnement — Kalaa Connect",
  description: "Rapport académique ESPRIT - Municipalité de Kalâa Seghira - Encadré par Mme Dalila KHLIFA",
  sections: [
    {
      properties: {},
      children: children
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outDocxPath, buffer);
  console.log('✅ Document Word (.docx) généré avec succès :', outDocxPath, `(${buffer.length} octets)`);
}).catch((err) => {
  console.error('Erreur lors de la génération du document docx :', err);
  process.exit(1);
});
