-- ==============================================================================
-- KALAA CONNECT — SCRIPT COMPLET DE DÉPLOIEMENT DE LA BASE DE DONNÉES
-- Conforme aux spécifications académiques ESPRIT 2025-2026
-- Élève-Ingénieure : Nada SLAMA
-- Encadrante Professionnelle : Mme Dalila KHLIFA (Municipalité de Kalâa Seghira)
-- Compatible : Supabase (PostgreSQL 15+), Neon, AWS RDS, Docker PostgreSQL
-- ==============================================================================

-- 0. EXTENSIONS NÉCESSAIRES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. TABLES FONDAMENTALES DU SYSTÈME MUNICIPAL
-- ==============================================================================

-- 1.1 Services Municipaux Techniques
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    nom_ar VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 Utilisateurs (Citoyens, Agents de terrain, Administrateurs)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('citoyen', 'agent', 'admin')),
    langue VARCHAR(5) DEFAULT 'fr' CHECK (langue IN ('fr', 'ar')),
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    telephone VARCHAR(20),
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Catégories d'anomalies urbaines
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom_fr VARCHAR(120) NOT NULL,
    nom_ar VARCHAR(120) NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    delai_moyen_jours INT DEFAULT 3,
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.4 Signalements Urbains (Tickets d'incidents)
CREATE TABLE IF NOT EXISTS signalements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_ticket VARCHAR(30) UNIQUE NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    categorie_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    adresse_approximative VARCHAR(255),
    quartier VARCHAR(100),
    photo_url TEXT NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'nouveau' 
        CHECK (statut IN ('nouveau', 'accepte', 'en_cours', 'resolu', 'cloture', 'rejete', 'doublon')),
    priorite VARCHAR(20) NOT NULL DEFAULT 'normale'
        CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
    auteur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES utilisateurs(id) ON DELETE SET NULL,
    photo_preuve_url TEXT,
    motif_rejet_ou_doublon TEXT,
    ticket_origine_id UUID REFERENCES signalements(id) ON DELETE SET NULL,
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mis_a_jour_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.5 Commentaires et journal d'échanges
CREATE TABLE IF NOT EXISTS commentaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signalement_id UUID NOT NULL REFERENCES signalements(id) ON DELETE CASCADE,
    auteur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    texte TEXT NOT NULL,
    photo_preuve_url TEXT,
    est_interne BOOLEAN DEFAULT FALSE,
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.6 Historique d'audit des statuts (Traçabilité stricte)
CREATE TABLE IF NOT EXISTS historique_statuts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signalement_id UUID NOT NULL REFERENCES signalements(id) ON DELETE CASCADE,
    ancien_statut VARCHAR(20),
    nouveau_statut VARCHAR(20) NOT NULL,
    acteur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    commentaire TEXT,
    photo_preuve_url TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index de performance pour les requêtes géographiques et de statut
CREATE INDEX IF NOT EXISTS idx_signalements_statut ON signalements(statut);
CREATE INDEX IF NOT EXISTS idx_signalements_categorie ON signalements(categorie_id);
CREATE INDEX IF NOT EXISTS idx_signalements_auteur ON signalements(auteur_id);
CREATE INDEX IF NOT EXISTS idx_signalements_agent ON signalements(agent_id);
CREATE INDEX IF NOT EXISTS idx_signalements_geo ON signalements(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_historique_signalement ON historique_statuts(signalement_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_signalement ON commentaires(signalement_id);

-- ==============================================================================
-- 2. VUES OPEN DATA ET ANALYTIQUES (CONFORME LOI TUNISIENNE INPDP)
-- ==============================================================================

CREATE OR REPLACE VIEW vue_signalements_publics AS
SELECT 
    s.id,
    s.numero_ticket,
    s.titre,
    s.description,
    s.latitude,
    s.longitude,
    s.quartier,
    s.statut,
    s.priorite,
    s.photo_url,
    s.photo_preuve_url,
    s.cree_le,
    s.mis_a_jour_le,
    c.id AS categorie_id,
    c.nom_fr AS categorie_nom_fr,
    c.nom_ar AS categorie_nom_ar,
    srv.id AS service_id,
    srv.nom AS service_nom,
    srv.nom_ar AS service_nom_ar
FROM signalements s
JOIN categories c ON s.categorie_id = c.id
JOIN services srv ON c.service_id = srv.id
WHERE s.statut NOT IN ('rejete', 'doublon');

CREATE OR REPLACE VIEW vue_stats_categories AS
SELECT 
    c.id AS categorie_id,
    c.nom_fr,
    c.nom_ar,
    srv.nom AS service_nom,
    COUNT(s.id) AS total_tickets,
    COUNT(s.id) FILTER (WHERE s.statut = 'resolu' OR s.statut = 'cloture') AS total_resolus,
    COUNT(s.id) FILTER (WHERE s.statut IN ('nouveau', 'accepte', 'en_cours')) AS total_en_cours,
    ROUND(
        AVG(
            EXTRACT(EPOCH FROM (s.mis_a_jour_le - s.cree_le)) / 3600
        ) FILTER (WHERE s.statut IN ('resolu', 'cloture'))::numeric, 
        1
    ) AS delai_moyen_resolution_heures
FROM categories c
JOIN services srv ON c.service_id = srv.id
LEFT JOIN signalements s ON s.categorie_id = c.id
GROUP BY c.id, c.nom_fr, c.nom_ar, srv.nom;

-- ==============================================================================
-- 3. JEU DE DONNÉES RÉEL DE LA MUNICIPALITÉ DE KALÂA SEGHYRA (SEED)
-- ==============================================================================

-- 3.1 Services Municipaux
INSERT INTO services (id, code, nom, nom_ar, description, actif) VALUES
('11111111-1111-1111-1111-111111111111', 'voirie', 'Voirie & Chaussée', 'الطرقات والمسالك', 'Entretien des routes, trottoirs, nids-de-poule', TRUE),
('22222222-2222-2222-2222-222222222222', 'eclairage', 'Éclairage Public', 'الإنارة العمومية', 'Pannes de réverbères, câbles et éclairage nocturne', TRUE),
('33333333-3333-3333-3333-333333333333', 'proprete', 'Propreté & Gestion des Déchets', 'النظافة والتصرف في الفضلات', 'Bennes pleines, dépôts sauvages d’ordures', TRUE),
('44444444-4444-4444-4444-444444444444', 'espaces_verts', 'Espaces Verts & Environnement', 'المساحات الخضراء والبيئة', 'Arbres dangereux, entretien des jardins publics', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3.2 Catégories bilingues
INSERT INTO categories (id, nom_fr, nom_ar, service_id, delai_moyen_jours) VALUES
('c1111111-1111-1111-1111-111111111111', 'Nid-de-poule ou chaussée dégradée', 'حفرة أو طريق متضرر', '11111111-1111-1111-1111-111111111111', 3),
('c1111111-1111-1111-1111-222222222222', 'Trottoir cassé ou impraticable', 'رصيف مكسور أو غير صالح للمرور', '11111111-1111-1111-1111-111111111111', 5),
('c2222222-2222-2222-2222-111111111111', 'Lampadaire éteint ou clignotant', 'فانوس إنارة معطل أو يومض', '22222222-2222-2222-2222-222222222222', 2),
('c2222222-2222-2222-2222-222222222222', 'Câble électrique à découvert', 'سلك كهربائي مكشوف وخطر', '22222222-2222-2222-2222-222222222222', 1),
('c3333333-3333-3333-3333-111111111111', 'Dépôt sauvage d’ordures', 'مصب فضلات عشوائي', '33333333-3333-3333-3333-333333333333', 1),
('c3333333-3333-3333-3333-222222222222', 'Conteneur à ordures débordant', 'حاوية فضلات ممتلئة تتطلب تفريغ', '33333333-3333-3333-3333-333333333333', 1),
('c4444444-4444-4444-4444-111111111111', 'Branche menaçant de tomber', 'غصن شجرة آيل للسقوط', '44444444-4444-4444-4444-444444444444', 2),
('c4444444-4444-4444-4444-222222222222', 'Herbes sèches et risque d’incendie', 'أعشاب يابسة وخطر حريق', '44444444-4444-4444-4444-444444444444', 4)
ON CONFLICT (id) DO NOTHING;

-- 3.3 Utilisateurs Officiels Kalâa Seghira
INSERT INTO utilisateurs (id, nom, email, role, langue, service_id, telephone) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nada SLAMA', 'nada.slama@esprit.tn', 'citoyen', 'fr', NULL, '+21698123456'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ali Mansour', 'ali.mansour@commune-kalaaseghira.gov.tn', 'agent', 'fr', '11111111-1111-1111-1111-111111111111', '+21698234567'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sami Mansour', 'sami.mansour@commune-kalaaseghira.gov.tn', 'agent', 'ar', '33333333-3333-3333-3333-333333333333', '+21698345678'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mme Dalila KHLIFA', 'dalila.khlifa@commune-kalaaseghira.gov.tn', 'admin', 'fr', NULL, '+21673252022')
ON CONFLICT (id) DO NOTHING;

-- 3.4 Signalements réels à Kalâa Seghira
INSERT INTO signalements (
    id, numero_ticket, titre, description, categorie_id, 
    latitude, longitude, adresse_approximative, quartier, 
    photo_url, statut, priorite, auteur_id, cree_le
) VALUES
(
    'e1111111-1111-1111-1111-111111111111', 'KC-2026-0001', 
    'Nid-de-poule profond devant la pharmacie centrale', 
    'Nid-de-poule dangereux sur la voie principale risquant d’endommager les véhicules.',
    'c1111111-1111-1111-1111-111111111111', 
    35.8285, 10.5640, 'Avenue Habib Bourguiba', 'Centre-Ville',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
    'nouveau', 'haute', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 days'
),
(
    'e2222222-2222-2222-2222-222222222222', 'KC-2026-0002', 
    'Lampadaire en panne angle Ibn Khaldoun', 
    'Éclairage public éteint depuis 3 nuits à l’angle du collège Ibn Khaldoun.',
    'c2222222-2222-2222-2222-111111111111', 
    35.8322, 10.5615, 'Rue Ibn Khaldoun', 'El Manar',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    'accepte', 'normale', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day'
),
(
    'e3333333-3333-3333-3333-333333333333', 'KC-2026-0003', 
    'Accumulation d’ordures et benne débordante Cité El Bassatine', 
    'Les poubelles débordent et les déchets sont dispersés sur la chaussée.',
    'c3333333-3333-3333-3333-111111111111', 
    35.8215, 10.5695, 'Rue des Écoles', 'Cité El Bassatine',
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600',
    'resolu', 'urgente', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;
