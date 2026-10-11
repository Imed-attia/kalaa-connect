/**
 * Kalaa Connect — Synchronisation & Seeding Firebase Cloud Firestore
 * Élève-Ingénieure : Nada SLAMA
 * Encadrante : Mme Dalila KHLIFA
 * Projet Firebase : kalaa-sghira
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const serviceAccountPath = path.resolve(__dirname, '../kalaa-sghira-firebase-adminsdk-fbsvc-aab907152a.json');
const dbJsonPath = path.resolve(__dirname, '../apps/api/data/kalaa_database.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Fichier clé de compte de service Firebase introuvable :', serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
const app = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

const rawData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

async function seedFirestore() {
  console.log('🚀 Démarrage de la synchronisation Firestore pour le projet :', serviceAccount.project_id);

  // 1. Services municipaux
  const services = [
    { id: 'srv-voirie', code: 'voirie', nom: 'Voirie & Chaussée', nom_ar: 'الطرقات والمسالك', description: 'Entretien des routes, trottoirs, nids-de-poule', actif: true },
    { id: 'srv-eclairage', code: 'eclairage', nom: 'Éclairage Public', nom_ar: 'الإنارة العمومية', description: 'Pannes de réverbères, câbles et éclairage nocturne', actif: true },
    { id: 'srv-proprete', code: 'proprete', nom: 'Propreté & Gestion des Déchets', nom_ar: 'النظافة والتصرف في الفضلات', description: 'Bennes pleines, dépôts sauvages d’ordures', actif: true },
    { id: 'srv-espaces-verts', code: 'espaces_verts', nom: 'Espaces Verts & Environnement', nom_ar: 'المساحات الخضراء والبيئة', description: 'Arbres dangereux, entretien des jardins publics', actif: true }
  ];

  console.log('📦 Insertion des services municipaux...');
  for (const srv of services) {
    await db.collection('services').doc(srv.id).set(srv, { merge: true });
  }

  // 2. Catégories d'incidents
  const categories = [
    { id: 'cat-nid-de-poule', nom_fr: 'Nid-de-poule ou chaussée dégradée', nom_ar: 'حفرة أو طريق متضرر', service_id: 'srv-voirie', delai_jours: 3 },
    { id: 'cat-trottoir-casse', nom_fr: 'Trottoir cassé ou impraticable', nom_ar: 'رصيف مكسور أو غير صالح للمرور', service_id: 'srv-voirie', delai_jours: 5 },
    { id: 'cat-lampadaire-panne', nom_fr: 'Lampadaire éteint ou clignotant', nom_ar: 'فانوس إنارة معطل أو يومض', service_id: 'srv-eclairage', delai_jours: 2 },
    { id: 'cat-cable-decouvert', nom_fr: 'Câble électrique à découvert', nom_ar: 'سلك كهربائي مكشوف وخطر', service_id: 'srv-eclairage', delai_jours: 1 },
    { id: 'cat-depot-sauvage', nom_fr: 'Dépôt sauvage d’ordures', nom_ar: 'مصب فضلات عشوائي', service_id: 'srv-proprete', delai_jours: 1 },
    { id: 'cat-conteneur-plein', nom_fr: 'Conteneur à ordures débordant', nom_ar: 'حاوية فضلات ممتلئة تتطلب تفريغ', service_id: 'srv-proprete', delai_jours: 1 },
    { id: 'cat-arbre-dangereux', nom_fr: 'Branche menaçant de tomber', nom_ar: 'غصن شجرة آيل للسقوط', service_id: 'srv-espaces-verts', delai_jours: 2 },
    { id: 'cat-herbes-seches', nom_fr: 'Herbes sèches et risque d’incendie', nom_ar: 'أعشاب يابسة وخطر حريق', service_id: 'srv-espaces-verts', delai_jours: 4 }
  ];

  console.log('📦 Insertion des catégories...');
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set(cat, { merge: true });
  }

  // 3. Utilisateurs municipaux et citoyen
  console.log('📦 Insertion des utilisateurs municipaux...');
  for (const u of (rawData.users || [])) {
    await db.collection('users').doc(u.id).set(u, { merge: true });
  }

  // 4. Signalements réels de Kalâa Seghira
  console.log('📦 Insertion des signalements réels...');
  for (const r of (rawData.reports || [])) {
    await db.collection('reports').doc(r.id).set(r, { merge: true });
  }

  // 5. Historique d'audit
  console.log('📦 Insertion des historiques d’audit...');
  for (const h of (rawData.statusHistory || [])) {
    await db.collection('status_history').doc(h.id).set(h, { merge: true });
  }

  console.log('✅ Synchronisation Firestore terminée avec succès !');
  const count = (await db.collection('reports').get()).size;
  console.log(`🎉 Total des signalements enregistrés dans Cloud Firestore : ${count}`);
}

seedFirestore().then(() => process.exit(0)).catch((err) => {
  console.error('❌ Erreur de synchronisation Firestore :', err);
  process.exit(1);
});
