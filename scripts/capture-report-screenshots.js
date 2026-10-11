const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureAllScreenshots() {
  console.log('🚀 Lancement de Microsoft Edge pour capture des écrans réels...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--window-size=1400,900'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 2 });

  try {
    // 1. Page d'accueil avec cartographie interactive et données réelles
    console.log('Capture 1 : Page d’accueil et cartographie municipale');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fig15_accueil_principale.png') });

    // 2. Formulaire de signalement
    console.log('Capture 2 : Formulaire de signalement d’incident');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const reportBtn = buttons.find(b => b.textContent && (b.textContent.includes('Signaler') || b.textContent.includes('بلاغ')));
      if (reportBtn) reportBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Remplissage avec des données réalistes pour la capture
    await page.evaluate(() => {
      const titleInput = document.querySelector('input[type="text"]');
      if (titleInput) {
        titleInput.value = 'Affaissement important de chaussée devant la Pharmacie';
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const descTextarea = document.querySelector('textarea');
      if (descTextarea) {
        descTextarea.value = 'Nid-de-poule dangereux sur Avenue Habib Bourguiba risquant de provoquer des accidents de deux-roues.';
        descTextarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fig16_formulaire_signalement.png') });

    // 3. Espace Mes Signalements
    console.log('Capture 3 : Espace Mes Signalements');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const myReportsBtn = buttons.find(b => b.textContent && (b.textContent.includes('signalements') || b.textContent.includes('بلاغاتي')));
      if (myReportsBtn) myReportsBtn.click();
    });
    await new Promise(r => setTimeout(r, 1800));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fig17_mes_signalements.png') });

    // 4. Modal de modification interactive
    console.log('Capture 4 : Modal de modification interactive (Fix Defect)');
    await page.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Modifier'));
      if (editBtns.length > 0) editBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fig18_modification_signalement.png') });

    // Fermeture de la modal
    await page.evaluate(() => {
      const cancelBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Annuler'));
      if (cancelBtns.length > 0) cancelBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 500));

    // 5. Espace Agent Municipal de Terrain
    console.log('Capture 5 : Espace Agent Municipal & Ordres de Mission');
    await page.evaluate(() => {
      const roleSelect = document.querySelector('select');
      if (roleSelect) {
        roleSelect.value = 'agent';
        roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const buttons = Array.from(document.querySelectorAll('button'));
      const agentBtn = buttons.find(b => b.textContent && (b.textContent.includes('Agent') || b.textContent.includes('Intervention')));
      if (agentBtn) agentBtn.click();
    });
    await new Promise(r => setTimeout(r, 1800));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fig19_espace_agent.png') });

    // 6. Tableau de bord Superviseur / Admin (Mme Dalila KHLIFA)
    console.log('Capture 6 : Tableau de bord de pilotage territorial municipal');
    await page.evaluate(() => {
      const roleSelect = document.querySelector('select');
      if (roleSelect) {
        roleSelect.value = 'admin';
        roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const buttons = Array.from(document.querySelectorAll('button'));
      const homeBtn = buttons.find(b => b.textContent && (b.textContent.includes('Accueil') || b.textContent.includes('الرئيسية')));
      if (homeBtn) homeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fig21_dashboard_supervision.png') });

    // 7. Simulation Mobile PWA
    console.log('Capture 7 : Simulation Mobile PWA (iPhone SE 375x667)');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'fig22_mobile_responsive_pwa.png') });

    console.log('✅ Toutes les captures réelles haute résolution ont été enregistrées avec succès dans :', SCREENSHOTS_DIR);
  } catch (err) {
    console.error('Erreur lors de la capture :', err);
  } finally {
    await browser.close();
  }
}

captureAllScreenshots().catch(console.error);
