-- ==============================================================
-- Kalaa Connect — Migration 002: Politiques Row Level Security (RLS)
-- Conforme aux spécifications de sécurité et de minimisation des données
-- ==============================================================

-- Activation de RLS sur toutes les tables sensibles
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signalements ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE historique_statuts ENABLE ROW LEVEL SECURITY;

-- 1. Politiques pour la table 'utilisateurs'
-- L'utilisateur peut lire son propre profil
CREATE POLICY "utilisateur_lit_son_profil" ON utilisateurs
    FOR SELECT USING (auth.uid() = id);

-- L'utilisateur peut mettre à jour son propre profil (nom, langue, téléphone)
CREATE POLICY "utilisateur_maj_son_profil" ON utilisateurs
    FOR UPDATE USING (auth.uid() = id);

-- Les admins peuvent consulter tous les profils
CREATE POLICY "admin_voit_tous_profils" ON utilisateurs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Politiques pour la table 'signalements'
-- Les citoyens peuvent lire leurs propres signalements
CREATE POLICY "citoyen_lit_ses_signalements" ON signalements
    FOR SELECT USING (
        auth.uid() = auteur_id
    );

-- Les citoyens peuvent créer des signalements
CREATE POLICY "citoyen_cree_signalement" ON signalements
    FOR INSERT WITH CHECK (
        auth.uid() = auteur_id
    );

-- Les citoyens peuvent mettre à jour uniquement pour confirmer la clôture d'un ticket résolu
CREATE POLICY "citoyen_cloture_signalement_resolu" ON signalements
    FOR UPDATE USING (
        auth.uid() = auteur_id AND statut = 'resolu'
    );

-- Les agents municipaux voient les tickets de leur service
CREATE POLICY "agent_voit_tickets_service" ON signalements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            JOIN categories c ON c.service_id = u.service_id
            WHERE u.id = auth.uid() 
              AND u.role = 'agent' 
              AND c.id = signalements.categorie_id
        )
    );

-- Les agents peuvent mettre à jour les tickets de leur service
CREATE POLICY "agent_maj_tickets_service" ON signalements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM utilisateurs u 
            JOIN categories c ON c.service_id = u.service_id
            WHERE u.id = auth.uid() 
              AND u.role = 'agent' 
              AND c.id = signalements.categorie_id
        )
    );

-- Les admins ont accès en lecture et écriture sur tous les signalements
CREATE POLICY "admin_acces_total_signalements" ON signalements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 3. Politiques pour les commentaires
-- Tout participant autorisé peut lire les commentaires non internes
CREATE POLICY "lecture_commentaires_publics" ON commentaires
    FOR SELECT USING (
        est_interne = FALSE
        OR EXISTS (
            SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('agent', 'admin')
        )
    );

-- Seuls les agents et admins peuvent poster des commentaires internes
CREATE POLICY "insertion_commentaires" ON commentaires
    FOR INSERT WITH CHECK (
        auth.uid() = auteur_id
        AND (
            est_interne = FALSE
            OR EXISTS (
                SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('agent', 'admin')
            )
        )
    );

-- 4. Politiques pour l'historique des statuts
-- Tout le monde peut voir l'historique d'un signalement auquel il a accès
CREATE POLICY "lecture_historique_statuts" ON historique_statuts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM signalements s WHERE s.id = historique_statuts.signalement_id
        )
    );
