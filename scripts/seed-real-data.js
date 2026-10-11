const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../apps/api/data/kalaa_database.json');

const realUsers = [
  {
    id: "usr-citoyen-nada",
    nom: "Nada SLAMA",
    email: "nada.slama@esprit.tn",
    role: "citoyen",
    langue: "fr",
    telephone: "+216 98 123 456",
    adresse: "Avenue Habib Bourguiba, 4021 Kalâa Seghira",
    cree_le: "2026-07-01T08:00:00.000Z"
  },
  {
    id: "usr-admin-dalila",
    nom: "Mme Dalila KHLIFA",
    email: "dalila.khlifa@commune-kalaaseghira.gov.tn",
    role: "admin",
    langue: "fr",
    service_id: "srv-technique-direction",
    telephone: "+216 73 252 022",
    titre_poste: "Directrice des Services Techniques & SI",
    cree_le: "2026-07-01T08:00:00.000Z"
  },
  {
    id: "usr-agent-ali",
    nom: "Ali Mansour",
    email: "ali.mansour@commune-kalaaseghira.gov.tn",
    role: "agent",
    langue: "fr",
    service_id: "srv-voirie",
    telephone: "+216 98 234 567",
    titre_poste: "Chef d'équipe Voirie & Réseaux",
    cree_le: "2026-07-01T08:00:00.000Z"
  },
  {
    id: "usr-agent-sami",
    nom: "Sami Mansour",
    email: "sami.mansour@commune-kalaaseghira.gov.tn",
    role: "agent",
    langue: "fr",
    service_id: "srv-proprete",
    telephone: "+216 98 345 678",
    titre_poste: "Responsable Collecte & Propreté Urbaine",
    cree_le: "2026-07-01T08:00:00.000Z"
  },
  {
    id: "usr-agent-ridha",
    nom: "Ridha Ben Amor",
    email: "ridha.benamor@commune-kalaaseghira.gov.tn",
    role: "agent",
    langue: "fr",
    service_id: "srv-eclairage",
    telephone: "+216 98 456 789",
    titre_poste: "Technicien Réseau Éclairage Public",
    cree_le: "2026-07-01T08:00:00.000Z"
  },
  {
    id: "usr-superviseur-sonia",
    nom: "Sonia Jlassi",
    email: "sonia.jlassi@commune-kalaaseghira.gov.tn",
    role: "superviseur",
    langue: "fr",
    service_id: "srv-coordination",
    telephone: "+216 73 252 025",
    titre_poste: "Superviseure Bureau Relations Citoyens",
    cree_le: "2026-07-01T08:00:00.000Z"
  }
];

const realReports = [
  {
    id: "rep-001",
    numero_ticket: "KC-2026-0001",
    titre: "Affaissement important de chaussée et nid-de-poule dangereux",
    description: "Affaissement prononcé de la chaussée devant la Pharmacie Municipale. Risque majeur d'accident de deux-roues et de détérioration des véhicules.",
    categorie_id: "cat-nid-de-poule",
    service_id: "srv-voirie",
    latitude: 35.8285,
    longitude: 10.5640,
    adresse_approximative: "Avenue Habib Bourguiba, Kalâa Centre",
    quartier: "Medina Centre",
    photo_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80",
    statut: "en_cours",
    priorite: "urgente",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: "usr-agent-ali",
    cree_le: "2026-09-02T08:30:00.000Z",
    mis_a_jour_le: "2026-09-02T10:15:00.000Z"
  },
  {
    id: "rep-002",
    numero_ticket: "KC-2026-0002",
    titre: "Lanterne d'éclairage public brisée et câble apparent",
    description: "Poteau d'éclairage défectueux face à l'école primaire Ibn Khaldoun. La lanterne est cassée suite à de fortes rafales et le câble basse tension pend à hauteur d'homme.",
    categorie_id: "cat-eclairage-defaillant",
    service_id: "srv-eclairage",
    latitude: 35.8342,
    longitude: 10.5721,
    adresse_approximative: "Rue Ibn Khaldoun, Cité Echragi",
    quartier: "Arrondissement Echragi",
    photo_url: "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80",
    statut: "pris_en_charge",
    priorite: "haute",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: "usr-agent-ridha",
    cree_le: "2026-09-03T09:15:00.000Z",
    mis_a_jour_le: "2026-09-03T11:00:00.000Z"
  },
  {
    id: "rep-003",
    numero_ticket: "KC-2026-0003",
    titre: "Dépôt sauvage de gravats et encombrants sur trottoir",
    description: "Important amas de déblais de construction et encombrants obstruant totalement le passage piéton à proximité du Marché Municipal.",
    categorie_id: "cat-depot-sauvage",
    service_id: "srv-proprete",
    latitude: 35.8210,
    longitude: 10.5590,
    adresse_approximative: "Avenue de la République, Cité Hassed",
    quartier: "Arrondissement Hassed",
    photo_url: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80",
    statut: "resolu",
    priorite: "moyenne",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: "usr-agent-sami",
    cree_le: "2026-09-04T07:45:00.000Z",
    mis_a_jour_le: "2026-09-05T14:30:00.000Z"
  },
  {
    id: "rep-004",
    numero_ticket: "KC-2026-0004",
    titre: "Fuite importante sur conduite d'eau avec stagnation sur voirie",
    description: "Écoulement continu d'eau potable inondant la chaussée et fragilisant le bitume sur la route d'Akouda.",
    categorie_id: "cat-fuite-eau",
    service_id: "srv-voirie",
    latitude: 35.8415,
    longitude: 10.5830,
    adresse_approximative: "Route d'Akouda, Zone Industrielle Oued Laya",
    quartier: "Ennogra - Oued Laya",
    photo_url: "https://images.unsplash.com/photo-1584463699042-4916a08f51a4?w=800&auto=format&fit=crop&q=80",
    statut: "en_cours",
    priorite: "urgente",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: "usr-agent-ali",
    cree_le: "2026-09-06T11:20:00.000Z",
    mis_a_jour_le: "2026-09-06T12:00:00.000Z"
  },
  {
    id: "rep-005",
    numero_ticket: "KC-2026-0005",
    titre: "Panneau de signalisation STOP arraché au carrefour",
    description: "Panneau réglementaire STOP tombé à terre suite à un accrochage au croisement Rue 20 Mars et Rue de la Mosquée. Risque élevé de collision.",
    categorie_id: "cat-signalisation-abimee",
    service_id: "srv-voirie",
    latitude: 35.8298,
    longitude: 10.5615,
    adresse_approximative: "Place des Martyrs, Centre-Ville",
    quartier: "Medina Centre",
    photo_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    statut: "pris_en_charge",
    priorite: "haute",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: "usr-agent-ali",
    cree_le: "2026-09-07T14:10:00.000Z",
    mis_a_jour_le: "2026-09-07T15:30:00.000Z"
  },
  {
    id: "rep-006",
    numero_ticket: "KC-2026-0006",
    titre: "Extinction nocturne complète de l'éclairage public",
    description: "Série de 8 lampadaires éteints plongeant toute la Cité des Oliviers dans l'obscurité totale.",
    categorie_id: "cat-eclairage-defaillant",
    service_id: "srv-eclairage",
    latitude: 35.8380,
    longitude: 10.5790,
    adresse_approximative: "Cité des Oliviers, Ennogra",
    quartier: "Ennogra - Oued Laya",
    photo_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    statut: "nouveau",
    priorite: "moyenne",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: null,
    cree_le: "2026-09-08T20:45:00.000Z",
    mis_a_jour_le: "2026-09-08T20:45:00.000Z"
  },
  {
    id: "rep-007",
    numero_ticket: "KC-2026-0007",
    titre: "Débordement de benne à ordures collective et dispersion",
    description: "Benne municipale pleine à ras bord avec débordement de sacs poubelles sur la voie publique attirant des animaux errants.",
    categorie_id: "cat-poubelle-pleine",
    service_id: "srv-proprete",
    latitude: 35.8320,
    longitude: 10.5680,
    adresse_approximative: "Rue de l'Indépendance, Cité Echragi",
    quartier: "Arrondissement Echragi",
    photo_url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80",
    statut: "resolu",
    priorite: "haute",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: "usr-agent-sami",
    cree_le: "2026-09-09T08:00:00.000Z",
    mis_a_jour_le: "2026-09-09T11:45:00.000Z"
  },
  {
    id: "rep-008",
    numero_ticket: "KC-2026-0008",
    titre: "Grosses branches d'eucalyptus menaçant de rompre un câble électrique",
    description: "Branches fragilisées surplombant la ligne basse tension après l'orage. Nécessite l'élagage d'urgence par l'équipe des Espaces Verts.",
    categorie_id: "cat-arbre-dangereux",
    service_id: "srv-espaces-verts",
    latitude: 35.8240,
    longitude: 10.5550,
    adresse_approximative: "Rue des Jasmins, Cité Hassed",
    quartier: "Arrondissement Hassed",
    photo_url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80",
    statut: "pris_en_charge",
    priorite: "haute",
    auteur_id: "usr-citoyen-nada",
    agent_assigne_id: "usr-agent-ali",
    cree_le: "2026-09-10T10:15:00.000Z",
    mis_a_jour_le: "2026-09-10T11:30:00.000Z"
  }
];

const realHistory = [
  {
    id: "hist-001",
    signalement_id: "rep-001",
    ancien_statut: null,
    nouveau_statut: "nouveau",
    commentaire: "Signalement initial soumis par Nada SLAMA via l'application mobile PWA.",
    auteur_id: "usr-citoyen-nada",
    date_action: "2026-09-02T08:30:00.000Z"
  },
  {
    id: "hist-002",
    signalement_id: "rep-001",
    ancien_statut: "nouveau",
    nouveau_statut: "pris_en_charge",
    commentaire: "Signalement validé par Mme Dalila KHLIFA et affecté à l'équipe Voirie (Ali Mansour).",
    auteur_id: "usr-admin-dalila",
    date_action: "2026-09-02T09:10:00.000Z"
  },
  {
    id: "hist-003",
    signalement_id: "rep-001",
    ancien_statut: "pris_en_charge",
    nouveau_statut: "en_cours",
    commentaire: "Équipe sur place : balisage de sécurité installé et commande d'enrobé à froid en cours.",
    auteur_id: "usr-agent-ali",
    date_action: "2026-09-02T10:15:00.000Z"
  },
  {
    id: "hist-004",
    signalement_id: "rep-003",
    ancien_statut: "nouveau",
    nouveau_statut: "pris_en_charge",
    commentaire: "Prise en charge par le service Propreté pour enlèvement par camion benne.",
    auteur_id: "usr-admin-dalila",
    date_action: "2026-09-04T08:30:00.000Z"
  },
  {
    id: "hist-005",
    signalement_id: "rep-003",
    ancien_statut: "pris_en_charge",
    nouveau_statut: "resolu",
    commentaire: "Gravats et déchets déblayés avec succès. Trottoir entièrement dégagé et nettoyé au jet.",
    auteur_id: "usr-agent-sami",
    date_action: "2026-09-05T14:30:00.000Z"
  },
  {
    id: "hist-006",
    signalement_id: "rep-007",
    ancien_statut: "nouveau",
    nouveau_statut: "resolu",
    commentaire: "Tournée spéciale de ramassage effectuée et conteneur nettoyé.",
    auteur_id: "usr-agent-sami",
    date_action: "2026-09-09T11:45:00.000Z"
  }
];

const databasePayload = {
  users: realUsers,
  reports: realReports,
  history: realHistory,
  lastPersisted: new Date().toISOString()
};

fs.writeFileSync(dbPath, JSON.stringify(databasePayload, null, 2), 'utf8');
console.log('✅ Base de données municipale Kalaa Connect mise à jour avec succès avec des données réelles !');
console.log(`- Utilisateurs : ${realUsers.length}`);
console.log(`- Signalements réels géolocalisés : ${realReports.length}`);
console.log(`- Historique d'audit et statuts : ${realHistory.length}`);
