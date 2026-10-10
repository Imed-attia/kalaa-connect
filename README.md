# Kalaa Connect — Plateforme Cloud de Signalement Citoyen

Plateforme moderne de signalement et de résolution d'anomalies urbaines pour la **Municipalité de Kalâa Seghira (Sousse, Tunisie)**.

> **Projet de stage ingénieur ESPRIT (4ème $\rightarrow$ 5ème année, Option Cloud)**  
> **Auteur** : Imed Attia (`@imed`, imedattia1032@gmail.com)  
> **Durée** : 8 semaines (40 jours ouvrés, J1 à J40)  
> **Coût cloud cible** : 0 TND (Paliers gratuits uniquement)

---

## Architecture Globale

Le projet est structuré sous forme de monorepo moderne :

```
kalaa-connect/
├── apps/
│   ├── api/             # API NestJS (TypeScript, Swagger, Auth JWT, RLS, IA Gemini)
│   └── web/             # PWA React (Vite, TypeScript, Tailwind, Leaflet OSM, FR/AR bilingue)
├── packages/
│   └── shared/          # Types partagés, Enums, Constantes, Machine à états
├── terraform/           # Infrastructure as Code (Google Cloud Run, Secret Manager, IAM)
├── .github/workflows/   # CI/CD, Scan de vulnérabilités Trivy, Sauvegarde SQL & Ping
├── docker-compose.yml   # Orchestration de développement local
└── README.md
```

---

## Fonctionnalités Clés

1. **Espace Citoyen (PWA Mobile-First)** :
   * Création d'un signalement en moins de 60 secondes avec prise de photo et coordonnées GPS.
   * Carte interactive Leaflet / OpenStreetMap avec filtres par catégorie et état.
   * Interface 100 % bilingue **Français et Arabe** (avec disposition RTL).
   * Mode hors-ligne avec enregistrement local des brouillons de signalement.
   * Suivi en temps réel de l'avancement de son ticket.

2. **Espace Agent Municipal** :
   * Tableau de bord des tickets filtrés par service (Voirie, Éclairage, Propreté, Espaces verts).
   * Gestion du cycle de vie des tickets : *Nouveau $\rightarrow$ Accepté $\rightarrow$ En cours $\rightarrow$ Résolu $\rightarrow$ Clôturé*.
   * Obligation d'une photo de preuve lors de la résolution.
   * Traçabilité complète et audit des changements de statut.

3. **Espace Responsable / Administrateur** :
   * Gestion des services municipaux et des comptes agents.
   * Visualisation des métriques de performance municipale.
   * Export des données en CSV.

4. **Bonus IA & Open Data** :
   * Classification automatique des photos par vision (Google Gemini API) avec score de confiance et explication.
   * Page publique `/stats` Open Data (sans aucune donnée à caractère personnel) avec répartition par quartier.

5. **Supervision & Fiabilité** :
   * Endpoint de santé `/health`.
   * Traçabilité des requêtes via `X-Request-ID`.
   * Tâche planifiée GitHub Actions (ping de base de données + backup SQL) pour éviter la mise en veille gratuite de Supabase.

---

## Installation & Démarrage Rapide

### Prérequis
* Node.js LTS (>= 20)
* npm (>= 10)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de l'environnement
Copier le fichier d'exemple et ajuster les variables nécessaires :
```bash
cp .env.example .env
```

### 3. Lancement des applications en développement
* **Lancer l'API NestJS** :
  ```bash
  npm run start:api
  # Swagger accessible sur http://localhost:3000/api/docs
  ```
* **Lancer l'application Web PWA** :
  ```bash
  npm run start:web
  # Application accessible sur http://localhost:5173
  ```

### 4. Lancer les tests
```bash
npm run test
```

---

## Licence
Ce projet est développé dans le cadre du projet de stage ingénieur ESPRIT. Licence MIT.
