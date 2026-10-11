# Architecture de la Base de Données & Résolution du Défaut d'Écriture — Kalaa Connect

**Projet** : Kalaa Connect  
**Auteure** : Nada SLAMA (Élève-Ingénieure ESPRIT)  
**Encadrante Professionnelle** : Mme Dalila KHLIFA (Municipalité de Kalâa Seghira)  
**Année Universitaire** : 2025–2026  

---

## 1. Investigation Complète du Chemin d'Écriture (Write Path)

L'audit approfondi de la chaîne d'écriture a permis de disséquer l'intégralité du cycle de vie d'une modification de données dans Kalaa Connect :

```
[Formulaire Utilisateur React]
       │  (1) Envoi payload JSON via `apiClient.updateReport(id, data)`
       ▼
[Contrôleur NestJS : ReportsController]
       │  (2) Validation DTO via `UpdateReportDetailsDto` & `UpdateReportStatusDto`
       ▼
[Service Métier : ReportsService]
       │  (3) Contrôle d'existence, validation des droits RBAC & mise à jour du modèle
       ▼
[Couche d'Accès aux Données : DatabaseService]
       ├── (4a) Tentative d'écriture SQL sur Supabase PostgreSQL (`supabase.from('signalements').update(...)`)
       └── (4b) Écriture synchrone atomique sur disque dur local (`apps/api/data/kalaa_database.json`)
```

---

## 2. Analyse de la Cause Racine du Dysfonctionnement (Root Cause Analysis)

Avant l'intervention de Nada SLAMA, les mises à jour des signalements ne persistaient pas pour trois raisons structurelles majeures :

1. **Volatilité Totale en Mémoire** :
   Le composant `DatabaseService` initialisait ses tables sous forme de collections en mémoire (`Map<string, Report>` et `Map<string, User>`). Tout redémarrage du serveur API (ou arrêt du conteneur) réinitialisait les données aux valeurs par défaut, effaçant irrémédiablement les créations et modifications saisies par les utilisateurs.
2. **Absence d'Endpoint de Modification des Données Métier** :
   L'API n'exposait qu'un endpoint de transition de statut (`PATCH /api/reports/:id/status`), mais ne proposait aucun endpoint permettant la modification du titre, de la description ou de la priorité (`PATCH /api/reports/:id`).
3. **Synchronisation Défaillante avec Supabase** :
   La méthode `updateStatus` modifiait la référence en mémoire locale mais n'exécutait pas l'appel de mise à jour distant `supabase.from('signalements').update(...)`, entraînant une désynchronisation fatale entre le frontend et le stockage persistant.

---

## 3. Implémentation du Correctif & Validation

Les actions correctives suivantes ont été implémentées et validées :

1. **Persistance Disque Atomique & Restauration au Démarrage (`DatabaseService`)** :
   - Implémentation de `persistToDisk()` sérialisant l'état complet dans `apps/api/data/kalaa_database.json` à chaque création, modification ou suppression.
   - Chargement automatique au démarrage du serveur si le fichier existe, garantissant la conservation de l'historique d'une session à l'autre.
2. **Création des Endpoints de Modification & Suppression Complète** :
   - Ajout de `updateReport(id, dto)` gérant `PATCH /api/reports/:id` et `PUT /api/reports/:id`.
   - Ajout de `deleteReport(id)` gérant `DELETE /api/reports/:id`.
   - Intégration de la réplication vers Supabase PostgreSQL via `this.supabase.from('signalements').update(...)`.
3. **Mise à Jour de l'Interface Utilisateur (`MyReportsView.tsx`)** :
   - Ajout d'une modal interactive d'édition permettant à l'utilisateur de modifier le titre et la description d'un signalement, avec invalidation immédiate du cache local pour un rafraîchissement sans délai.

---

## 4. Schéma Relationnel des Données (PostgreSQL)

```sql
-- Table des Utilisateurs Municipaux et Citoyens
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('citoyen', 'agent', 'superviseur', 'admin')),
    telephone VARCHAR(20),
    service_municipal VARCHAR(50),
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des Signalements d'Incidents
CREATE TABLE signalements (
    id VARCHAR(64) PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    categorie VARCHAR(50) NOT NULL,
    priorite VARCHAR(20) NOT NULL CHECK (priorite IN ('basse', 'moyenne', 'haute', 'urgente')),
    statut VARCHAR(30) NOT NULL CHECK (statut IN ('NOUVEAU', 'PRIS_EN_CHARGE', 'EN_COURS', 'RESOLU', 'REJETE')),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    adresse VARCHAR(255),
    photo_url TEXT,
    auteur_id VARCHAR(64) REFERENCES users(id),
    agent_assigne_id VARCHAR(64) REFERENCES users(id),
    cree_le TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mis_a_jour_le TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table du Journal d'Audit et Traçabilité
CREATE TABLE historique_statuts (
    id VARCHAR(64) PRIMARY KEY,
    signalement_id VARCHAR(64) REFERENCES signalements(id) ON DELETE CASCADE,
    ancien_statut VARCHAR(30),
    nouveau_statut VARCHAR(30) NOT NULL,
    commentaire TEXT,
    auteur_id VARCHAR(64) REFERENCES users(id),
    date_action TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
