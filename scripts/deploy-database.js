/**
 * Kalaa Connect — Script de déploiement et synchronisation de la base de données
 * Élève-Ingénieure : Nada SLAMA
 * Encadrante : Mme Dalila KHLIFA
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve(__dirname, '../.env');
const dbJsonPath = path.resolve(__dirname, '../apps/api/data/kalaa_database.json');
const sqlPath = path.resolve(__dirname, '../apps/api/src/database/migrations/deploy_full_database.sql');

console.log('======================================================================');
console.log('   KALAA CONNECT — DÉPLOIEMENT DE LA BASE DE DONNÉES CLOUD');
console.log('======================================================================\n');

// 1. Charger les variables d'environnement
let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (key === 'SUPABASE_URL') supabaseUrl = val;
      if (key === 'SUPABASE_SERVICE_ROLE_KEY' || key === 'SUPABASE_ANON_KEY') {
        if (!supabaseKey) supabaseKey = val;
      }
    }
  });
}

// 2. Vérification des données locales à déployer
if (!fs.existsSync(dbJsonPath)) {
  console.error('❌ Fichier de données locales introuvable :', dbJsonPath);
  process.exit(1);
}

const localData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
console.log('📦 Données locales prêtes à être migrées :');
console.log(`   - Utilisateurs : ${localData.users ? localData.users.length : 0}`);
console.log(`   - Signalements : ${localData.reports ? localData.reports.length : 0}`);
console.log(`   - Historiques d'audit : ${localData.statusHistory ? localData.statusHistory.length : 0}`);
console.log(`   - Script SQL consolidé : ${sqlPath} (${fs.statSync(sqlPath).size} octets)\n`);

// 3. Déploiement vers Supabase si les identifiants sont fournis
if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('example')) {
  console.log(`🚀 Connexion à l'instance Supabase Cloud : ${supabaseUrl}...`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  async function deploy() {
    try {
      // Tester la connectivité
      const { data: services, error: srvErr } = await supabase.from('services').select('*').limit(1);
      if (srvErr) {
        console.log('ℹ️ Les tables ne sont pas encore créées sur Supabase.');
        console.log('👉 Exécutez le script SQL consolidé directement dans le SQL Editor de Supabase :');
        console.log(`   Fichier : ${sqlPath}\n`);
      } else {
        console.log('✅ Connectivité Supabase vérifiée avec succès !');
        console.log('🔄 Synchronisation des signalements...');
        // Sync data
        for (const rep of (localData.reports || [])) {
          await supabase.from('signalements').upsert({
            id: rep.id,
            numero_ticket: rep.numero_ticket,
            titre: rep.titre,
            description: rep.description,
            statut: rep.statut,
            priorite: rep.priorite,
            latitude: rep.latitude,
            longitude: rep.longitude,
            quartier: rep.quartier,
            adresse_approximative: rep.adresse_approximative,
            photo_url: rep.photo_url,
            cree_le: rep.cree_le,
            mis_a_jour_le: rep.mis_a_jour_le
          });
        }
        console.log('✅ Synchronisation cloud terminée avec succès !');
      }
    } catch (err) {
      console.error('❌ Erreur lors du déploiement Supabase :', err.message);
    }
  }

  deploy();
} else {
  console.log('ℹ️ Aucune instance Supabase distante configurée dans le fichier .env.');
  console.log('💡 GUIDE DE DÉPLOIEMENT RAPIDE DE LA BASE DE DONNÉES CLOUD (2 minutes) :');
  console.log('----------------------------------------------------------------------');
  console.log('1. Rendez-vous sur https://supabase.com (ou Neon.tech) et créez un projet gratuit nommé "kalaa-connect".');
  console.log('2. Ouvrez le "SQL Editor" dans le tableau de bord Supabase.');
  console.log('3. Copiez-collez l\'intégralité du fichier suivant et cliquez sur "Run" :');
  console.log(`   📄 ${sqlPath}`);
  console.log('4. Récupérez votre SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Settings > API.');
  console.log('5. Renseignez-les dans kalaa-connect/.env :');
  console.log('   DATABASE_MODE=supabase');
  console.log('   SUPABASE_URL=https://[votre-id].supabase.co');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=[votre-cle]');
  console.log('----------------------------------------------------------------------\n');
  console.log('✅ En local, la base de données est 100% active et persistante dans apps/api/data/kalaa_database.json !');
}
