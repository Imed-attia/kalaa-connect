-- ==============================================================
-- Kalaa Connect — Migration 003: Vues Open Data (Zéro PII)
-- Conforme à la loi organique tunisienne n° 2004-63 et aux consignes INPDP
-- ==============================================================

-- Vue publique 1 : Signalements cartographiques anonymisés (aucune donnée d'auteur)
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

-- Vue publique 2 : Statistiques agrégées par catégorie (anonymat total)
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

-- Vue publique 3 : Répartition géographique par quartier pour la carte de chaleur
CREATE OR REPLACE VIEW vue_stats_quartiers AS
SELECT 
    COALESCE(s.quartier, 'Non spécifié') AS quartier,
    COUNT(s.id) AS total_incidents,
    ROUND(AVG(s.latitude)::numeric, 4) AS centre_latitude,
    ROUND(AVG(s.longitude)::numeric, 4) AS centre_longitude
FROM signalements s
GROUP BY s.quartier;
