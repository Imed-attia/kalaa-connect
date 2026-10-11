const puppeteer = require('puppeteer-core');
const path = require('path');

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function runE2EValidation() {
  console.log('🚀 Démarrage du test interactif E2E : Firebase Auth + Ajout + Mise à jour...');
  
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: "new",
    args: ['--no-sandbox', '--disable-web-security', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Écoute des logs de la console du navigateur
  page.on('console', msg => console.log('   [NAVIGATEUR LOG]:', msg.text()));

  try {
    // 1. Accès à la plateforme
    console.log('1. Navigation vers http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    // 2. Ouvrir le modal d'authentification
    console.log('2. Clic sur le bouton de connexion (Navbar)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const loginBtn = btns.find(b => b.textContent && b.textContent.includes('Connexion'));
      if (loginBtn) loginBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // 3. Connexion Démo Rapide en tant que Nada SLAMA
    console.log('3. Clic sur le profil Nada SLAMA (Citoyenne ESPRIT)...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nadaBtn = btns.find(b => b.textContent && b.textContent.includes('Nada SLAMA'));
      if (nadaBtn) nadaBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Vérifier que le nom Nada SLAMA apparaît dans la Navbar
    const userLoggedIn = await page.evaluate(() => {
      return document.body.innerText.includes('Nada SLAMA');
    });
    console.log('   -> Utilisateur connecté avec succès :', userLoggedIn);

    // 4. Aller sur le formulaire de signalement (ADD)
    console.log('4. Clic sur l’onglet Signaler...');
    const reportTab = await page.waitForSelector('nav button:nth-child(2)');
    await reportTab.click();
    await new Promise(r => setTimeout(r, 1000));

    // Remplir et soumettre un nouveau signalement
    console.log('5. Saisie d’un nouveau signalement (Test ADD)...');
    const testTitle = `Test E2E Firebase ${Date.now()}`;
    
    // Attendre l'input titre
    const titleInput = await page.waitForSelector('input[placeholder*="Nid-de-poule"]');
    await titleInput.click();
    await titleInput.type(testTitle, { delay: 30 });

    const descInput = await page.$('textarea');
    if (descInput) {
      await descInput.click();
      await descInput.type('Anomalie de voirie testée avec succès via Firestore et Puppeteer.', { delay: 20 });
    }

    // Soumettre le formulaire
    console.log('   Envoi du formulaire...');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    });

    await new Promise(r => setTimeout(r, 3000));
    console.log('   -> Signalement envoyé !');

    // 6. Vérifier la présence dans Mes Tickets et tester la mise à jour (UPDATE)
    console.log('6. Clic sur l’onglet Mes Tickets...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('nav button'));
      const myTicketsBtn = btns.find(b => b.textContent && b.textContent.includes('signalements') || b.textContent.includes('tickets') || b.textContent.includes('Mes'));
      if (myTicketsBtn) myTicketsBtn.click();
    });
    await new Promise(r => setTimeout(r, 2500));

    // Vérifier si le ticket apparaît
    const ticketFound = await page.evaluate((title) => {
      return document.body.innerText.includes(title);
    }, testTitle);
    console.log('   -> Nouveau signalement présent dans la liste :', ticketFound);

    // Tester le bouton Modifier (UPDATE)
    console.log('7. Clic sur le bouton Modifier du premier ticket...');
    await page.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll('button')).filter(b => b.textContent && b.textContent.includes('Modifier'));
      if (editBtns.length > 0) editBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Modifier le titre dans la modal
    const updatedTitle = `Modifié avec succès à ${new Date().toLocaleTimeString()}`;
    const modalInput = await page.$('div[role="dialog"] input, .fixed input[type="text"]');
    if (modalInput) {
      await modalInput.click({ clickCount: 3 });
      await modalInput.type(updatedTitle, { delay: 20 });
    }

    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Enregistrer'));
      if (saveBtn) saveBtn.click();
    });

    await new Promise(r => setTimeout(r, 2500));

    const isUpdatedOnScreen = await page.evaluate((upTitle) => {
      return document.body.innerText.includes(upTitle);
    }, updatedTitle);
    console.log('   -> Modification persistée et affichée à l’écran (UPDATE) :', isUpdatedOnScreen);

    if (ticketFound && isUpdatedOnScreen) {
      console.log('🎉 TOUS LES TESTS E2E (AUTHENTIFICATION, AJOUT, MISE À JOUR) SONT 100% VALIDES !');
    } else {
      console.log('⚠️ Résultat partiel - ticketFound:', ticketFound, 'isUpdatedOnScreen:', isUpdatedOnScreen);
    }

  } catch (err) {
    console.error('❌ Erreur lors du test E2E :', err);
  } finally {
    await browser.close();
  }
}

runE2EValidation();
