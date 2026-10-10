-- ==============================================================
-- Kalaa Connect — Migration 004: Données initiales et de test (Seed)
-- Municipalité de Kalâa Seghira (Sousse, Tunisie)
-- ==============================================================

-- 1. Insertion des services municipaux
INSERT INTO services (id, code, nom, nom_ar, description, actif) VALUES
('11111111-1111-1111-1111-111111111111', 'voirie', 'Voirie & Chaussée', 'الطرقات والمسالك', 'Entretien des routes, trottoirs, nids-de-poule', TRUE),
('22222222-2222-2222-2222-222222222222', 'eclairage', 'Éclairage Public', 'الإنارة العمومية', 'Pannes de réverbères, câbles et éclairage nocturne', TRUE),
('33333333-3333-3333-3333-333333333333', 'proprete', 'Propreté & Gestion des Déchets', 'النظافة والتصرف في الفضلات', 'Bennes pleines, dépôts sauvages d’ordures', TRUE),
('44444444-4444-4444-4444-444444444444', 'espaces_verts', 'Espaces Verts & Environnement', 'المساحات الخضراء والبيئة', 'Arbres dangereux, entretien des jardins publics', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 2. Insertion des catégories bilingues
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

-- 3. Utilisateurs de test
INSERT INTO utilisateurs (id, nom, email, role, langue, service_id, telephone) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Imed Attia', 'imedattia1032@gmail.com', 'citoyen', 'fr', NULL, '+21698000111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ahmed Ben Salah', 'agent.voirie@kalaa-soghra.gov.tn', 'agent', 'fr', '11111111-1111-1111-1111-111111111111', '+21698000222'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Sami Mansour', 'agent.proprete@kalaa-soghra.gov.tn', 'agent', 'ar', '33333333-3333-3333-3333-333333333333', '+21698000333'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Administrateur Municipal', 'admin@kalaa-soghra.gov.tn', 'admin', 'fr', NULL, '+21673000000')
ON CONFLICT (id) DO NOTHING;

-- 4. Exemples de signalements à Kalâa Seghira
INSERT INTO signalements (
    id, numero_ticket, titre, description, categorie_id, 
    latitude, longitude, adresse_approximative, quartier, 
    photo_url, statut, priorite, auteur_id, cree_le
) VALUES
(
    'e1111111-1111-1111-1111-111111111111', 'KC-2026-0001', 
    'Nid-de-poule profond devant la pharmacie', 
    'Nid-de-poule dangereux risquant d’endommager les véhicules et cyclistes.',
    'c1111111-1111-1111-1111-111111111111', 
    35.8285, 10.5640, 'Avenue Habib Bourguiba', 'Centre-Ville',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600',
    'nouveau', 'haute', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 days'
),
(
    'e2222222-2222-2222-2222-222222222222', 'KC-2026-0002', 
    'Lampadaire en panne depuis 3 nuits', 
    'L’éclairage public ne s’allume plus à l’angle de la rue, quartier plongé dans le noir.',
    'c2222222-2222-2222-2222-111111111111', 
    35.8322, 10.5615, 'Rue Ibn Khaldoun', 'El Manar',
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600',
    'accepte', 'normale', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 day'
),
(
    'e3333333-3333-3333-3333-333333333333', 'KC-2026-0003', 
    'Accumulation de déchets près de l’école', 
    'Les poubelles débordent et les ordures sont dispersées sur le trottoir.',
    'c3333333-3333-3333-3333-111111111111', 
    35.8215, 10.5695, 'Rue des Écoles', 'Cité El Bassatine',
    'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600',
    'resolu', 'urgente', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '4 days'
)
ON CONFLICT (id) DO NOTHING;
