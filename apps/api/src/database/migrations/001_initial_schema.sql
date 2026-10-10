-- ==============================================================
-- Kalaa Connect — Migration 001: Schéma initial de base de données
-- Conforme aux spécifications du plan de stage ESPRIT (Section 3)
-- ==============================================================

-- Activation de l'extension UUID si nécessaire
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table des services municipaux techniques
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    nom_ar VARCHAR(100) NOT NULL,
    description TEXT,
    actif BOOLEAN DEFAULT TRUE,
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des utilisateurs (profils liés à auth.users de Supabase)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id UUID PRIMARY KEY, -- Référence à auth.users.id
    nom VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('citoyen', 'agent', 'admin')),
    langue VARCHAR(5) DEFAULT 'fr' CHECK (langue IN ('fr', 'ar')),
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    telephone VARCHAR(20),
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table des catégories d'anomalies urbaines
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom_fr VARCHAR(120) NOT NULL,
    nom_ar VARCHAR(120) NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    delai_moyen_jours INT DEFAULT 3,
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des signalements urbains (Tickets)
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

-- 5. Table des commentaires et échanges
CREATE TABLE IF NOT EXISTS commentaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signalement_id UUID NOT NULL REFERENCES signalements(id) ON DELETE CASCADE,
    auteur_id UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    texte TEXT NOT NULL,
    photo_preuve_url TEXT,
    est_interne BOOLEAN DEFAULT FALSE,
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table d'audit de l'historique des statuts
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

-- Index pour optimiser les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_signalements_statut ON signalements(statut);
CREATE INDEX IF NOT EXISTS idx_signalements_categorie ON signalements(categorie_id);
CREATE INDEX IF NOT EXISTS idx_signalements_auteur ON signalements(auteur_id);
CREATE INDEX IF NOT EXISTS idx_signalements_agent ON signalements(agent_id);
CREATE INDEX IF NOT EXISTS idx_signalements_geo ON signalements(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_historique_signalement ON historique_statuts(signalement_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_signalement ON commentaires(signalement_id);
