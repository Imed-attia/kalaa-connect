# Architecture Technique Globale — Kalaa Connect
## Plateforme Cloud de Signalement Urbain (Kalâa Seghira)

Ce document décrit en détail l'architecture logicielle, les flux de données, la sécurité et la modélisation conceptuelle de la plateforme **Kalaa Connect**.

---

## 1. Vue d'Ensemble des Composants (C4 Model)

```mermaid
flowchart TD
    subgraph Clients["Clients Utilisateurs"]
        CitoyenMobile["Citoyen (Smartphone / PWA)"]
        AgentDesk["Agent Municipal & Admin (Navigateur)"]
    end

    subgraph Edge["Distribution & CDN"]
        CFPages["Cloudflare Pages (Hébergement PWA statique)"]
    end

    subgraph CloudRun["Google Cloud Platform (Région europe-west1)"]
        API["API NestJS (Conteneur Docker Cloud Run)<br/>Scale-to-zero (Max 2 instances)"]
        SecretMgr["Secret Manager (Gestion des clés)"]
        ArtifactReg["Artifact Registry (Dépôt d'images)"]
    end

    subgraph ManagedServices["Services Cloud Gérés (Palier Gratuit)"]
        SupaAuth["Supabase Auth (Authentification JWT)"]
        SupaDB[("Supabase PostgreSQL (Tables & Règles RLS)")]
        SupaStore["Supabase Storage (Photos anonymisées)"]
        GeminiAPI["Google Gemini 1.5 Flash (Classification IA)"]
        ResendMail["Resend / Brevo (Emails bilingues)"]
    end

    subgraph Observability["Supervision & Monitoring"]
        Grafana["Grafana Cloud (Métriques & Alertes)"]
        Uptime["GitHub Actions Cron (Ping Anti-Pause & Backup SQL)"]
    end

    CitoyenMobile -->|HTTPS / PWA| CFPages
    AgentDesk -->|HTTPS / SPA| CFPages
    CFPages -->|API REST / JWT| API

    API -->|Validation Token| SupaAuth
    API -->|Requêtes SQL / RLS| SupaDB
    API -->|Upload sans EXIF| SupaStore
    API -->|Vision Artificielle| GeminiAPI
    API -->|Notifications transactionnelles| ResendMail

    API -->|Métriques Prometheus| Grafana
    Uptime -->|/health (toutes les 72h)| API
    SecretMgr -.->|Injection variables| API
```

---

## 2. Diagramme de Séquence : Signalement Citoyen et Classification IA

```mermaid
sequenceDiagram
    autonumber
    actor Citoyen as Citoyen (PWA)
    participant Front as Frontend React (PWA)
    participant API as API NestJS
    participant IA as Google Gemini API
    participant DB as Supabase PostgreSQL
    participant Mail as Service Email

    Citoyen->>Front: Prendre une photo et géolocaliser (GPS)
    Front->>Front: Enregistrement du brouillon local (IndexedDB)
    Front->>API: POST /api/ai/classify (Photo base64)
    alt Clé API Gemini disponible
        API->>IA: Analyse d'image & prompt de classification
        IA-->>API: JSON {categorie_proposee, score_confiance, justification}
        API-->>Front: Suggestion IA transmise
    else Échec ou seuil < 0.65
        API-->>Front: Fallback sur catégorie choisie par le citoyen
    end
    Front->>Citoyen: Affichage de la catégorie confirmée
    Citoyen->>Front: Clic sur "Envoyer le signalement"
    Front->>API: POST /api/reports (Photo, Coordonnées, Catégorie)
    API->>API: Suppression des métadonnées EXIF (APP1 0xFFE1)
    API->>DB: INSERT signalement (statut = 'nouveau')
    API->>DB: INSERT historique_statuts (audit initial)
    API->>Mail: Notification d'accusé de réception bilingue FR/AR
    API-->>Front: Ticket créé (ex: #KC-2026-0042)
    Front->>Citoyen: Confirmation visuelle (< 60 secondes écoulées)
```

---

## 3. Machine à États Finis : Cycle de Vie des Tickets

```mermaid
stateDiagram-v2
    [*] --> Nouveau : Création par le citoyen (< 60s)
    
    Nouveau --> Accepte : Prise en charge par l'agent
    Nouveau --> Rejete : Hors compétence (Motif obligatoire)
    Nouveau --> Doublon : Ticket déjà existant (Motif obligatoire)
    
    Accepte --> En_cours : Équipe technique mobilisée
    Accepte --> Rejete : Motif obligatoire
    Accepte --> Doublon : Motif obligatoire
    
    En_cours --> Resolu : Travaux terminés (Photo de preuve obligatoire)
    
    Resolu --> Cloture : Confirmation citoyen ou délai expiré
    Resolu --> En_cours : Contestation citoyen (Réouverture)
    
    Cloture --> [*]
    Rejete --> [*]
    Doublon --> [*]
```

---

## 4. Modèle Entité-Association (ERD) de la Base de Données

```mermaid
erDiagram
    UTILISATEURS ||--o{ SIGNALEMENTS : "crée (citoyen)"
    UTILISATEURS ||--o{ SIGNALEMENTS : "traite (agent)"
    SERVICES ||--|{ CATEGORIES : "regroupe"
    CATEGORIES ||--o{ SIGNALEMENTS : "classe"
    SIGNALEMENTS ||--|{ HISTORIQUE_STATUTS : "possède"
    SIGNALEMENTS ||--o{ COMMENTAIRES : "contient"
    UTILISATEURS ||--o{ COMMENTAIRES : "écrit"

    UTILISATEURS {
        uuid id PK
        string nom
        string email
        string role "citoyen | agent | admin"
        string langue "fr | ar"
        uuid service_id FK
        string telephone
        timestamp cree_le
    }

    SERVICES {
        uuid id PK
        string code UK "voirie | eclairage | proprete | espaces_verts"
        string nom
        string nom_ar
        text description
        boolean actif
    }

    CATEGORIES {
        uuid id PK
        string nom_fr
        string nom_ar
        uuid service_id FK
        int delai_moyen_jours
    }

    SIGNALEMENTS {
        uuid id PK
        string numero_ticket UK
        string titre
        text description
        uuid categorie_id FK
        float latitude
        float longitude
        string quartier
        text photo_url
        string statut "nouveau | accepte | en_cours | resolu | cloture | rejete | doublon"
        string priorite "basse | normale | haute | urgente"
        uuid auteur_id FK
        uuid agent_id FK
        text photo_preuve_url
        text motif_rejet_ou_doublon
        timestamp cree_le
        timestamp mis_a_jour_le
    }

    COMMENTAIRES {
        uuid id PK
        uuid signalement_id FK
        uuid auteur_id FK
        text texte
        text photo_preuve_url
        boolean est_interne
        timestamp cree_le
    }

    HISTORIQUE_STATUTS {
        uuid id PK
        uuid signalement_id FK
        string ancien_statut
        string nouveau_statut
        uuid acteur_id FK
        text commentaire
        timestamp date
    }
```

---

## 5. Analyse des Coûts Cloud : Respect du Budget 0 TND

| Composant | Fournisseur | Limite du Palier Gratuit | Consommation Estimée Kalaa Connect | Coût Mensuel Réel |
| :--- | :--- | :--- | :--- | :--- |
| **API Backend** | Google Cloud Run | 2 millions de requêtes / mois, 360 000 vCPU-sec | ~15 000 requêtes / mois (pilote municipal) | **0,00 TND** |
| **Dépôt d'Images** | Google Artifact Registry | 500 Mo gratuits de stockage conteneur | Image Alpine compressée : 82 Mo | **0,00 TND** |
| **Base de Données** | Supabase PostgreSQL | 500 Mo de base, 2 Go de transfert | Base de données optimisée : < 50 Mo | **0,00 TND** |
| **Stockage Médias** | Supabase Storage | 1 Go gratuit | Photos compressées (max 1 Mo) avec purge : < 400 Mo | **0,00 TND** |
| **Frontend PWA** | Cloudflare Pages | Requêtes et bande passante illimitées | Hébergement statique optimisé | **0,00 TND** |
| **Vision IA** | Google Gemini API | 15 requêtes par minute (Free tier) | ~10 à 20 signalements par jour | **0,00 TND** |
| **Emails** | Resend / Brevo | 100 à 300 emails par jour gratuits | ~30 emails de notification par jour | **0,00 TND** |
| **Supervision** | Grafana Cloud | 10 000 séries temporelles, 50 Go logs | 1 service Cloud Run : < 300 séries | **0,00 TND** |
| **TOTAL** | — | — | **0 TND / mois garanti** | **0,00 TND** |
