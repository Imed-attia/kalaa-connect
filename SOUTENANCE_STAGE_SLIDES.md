# Kalaa Connect — Support de Soutenance de Stage Ingénieur
## Présentation pour le Jury ESPRIT (Option Cloud Computing)
**Élève Ingénieur : Imed Attia (`@imed`) · AU 2025/2026**

---

### Diapositive 1 : Titre et Introduction
* **Titre** : Kalaa Connect — Plateforme Cloud de Signalement Citoyen et de Gestion des Interventions Urbaines
* **Organisme d'accueil** : Municipalité de Kalâa Seghira (Gouvernorat de Sousse)
* **Cadre académique** : Stage Ingénieur 4ème $\rightarrow$ 5ème année, Option Cloud Computing, ESPRIT
* **Durée** : 8 semaines (40 jours ouvrés, J1 à J40)
* **Présenté par** : Imed Attia

---

### Diapositive 2 : Contexte de la Municipalité de Kalâa Seghira
* Collectivité territoriale dynamique du gouvernorat de Sousse regroupant plusieurs quartiers urbains et périurbains (Centre-Ville, El Manar, Bassatine, Ennour...).
* 4 services techniques municipaux opérationnels : **Voirie**, **Éclairage Public**, **Propreté / Déchets**, **Espaces Verts**.
* Volonté municipale de moderniser la relation citoyenne et de digitaliser le suivi des interventions techniques sur le terrain.

---

### Diapositive 3 : Problématique et Constats du Terrain
* **Canaux dispersés** : Réclamations par téléphone, registres papier à l'accueil, réseaux sociaux sans centralisation.
* **Absence de localisation précise** : Descriptions approximatives (« près du café ») entraînant des pertes de temps pour les équipes mobiles.
* **Frustration citoyenne** : Aucun accusé de réception ni moyen de savoir si l'incident est pris en charge.
* **Manque de données décisionnelles** : Aucune statistique consolidée sur les délais de résolution et les zones à forte récurrence.

---

### Diapositive 4 : Objectifs Mesurables et Cibles
| Objectif | Indicateur | Cible | Réalisé |
| :--- | :--- | :--- | :--- |
| **Rapidité** | Temps pour créer un signalement | < 60 secondes | **38 secondes** |
| **Traçabilité** | Tickets avec statut et agent assigné | 100 % | **100 % (Machine à états)** |
| **Notification** | Changement de statut notifié au citoyen | Email instantané | **Bilingue FR/AR avec 3 retries** |
| **Coût Cloud** | Budget d'infrastructure mensuel | 0 TND | **0 TND (Paliers gratuits)** |
| **Fiabilité** | Supervision en production | Health checks actifs | **Route /health + Grafana Cloud** |

---

### Diapositive 5 : Solution Proposée : Kalaa Connect
* **Monorepo moderne TypeScript** intégrant :
  1. Une **Progressive Web App (PWA)** mobile-first, bilingue Français/Arabe (RTL), installable sur tout smartphone.
  2. Une **API REST NestJS** sécurisée avec documentation OpenAPI/Swagger.
  3. Une base **PostgreSQL gérée (Supabase)** protégée par Row Level Security (RLS).
  4. Un modèle d'**IA Vision (Google Gemini)** pour la pré-classification automatique.
  5. Une infrastructure **Docker & Terraform** déployée sur Google Cloud Run.

---

### Diapositive 6 : Architecture Globale du Système
* Présentation du diagramme d'architecture C4 (Cloudflare Pages $\rightarrow$ Google Cloud Run $\rightarrow$ Supabase / Gemini / Grafana).
* Découplage strict entre la présentation, la logique métier et la persistance.
* Architecture conçue pour le *Scale-to-zero* (consommation nulle de ressources hors requêtes).

---

### Diapositive 7 : Stratégie « Coût 0 TND » et Paliers Gratuits
* **Compute** : Google Cloud Run (2 millions de requêtes/mois gratuites, seuil max fixé à 2 instances).
* **Base de données** : Supabase PostgreSQL (500 Mo gratuits).
* **Frontend** : Cloudflare Pages (bande passante illimitée).
* **IA** : Google Gemini 1.5 Flash (15 requêtes/minute gratuites).
* **Supervision** : Grafana Cloud (10 000 séries temporelles gratuites).

---

### Diapositive 8 : Sécurité et Conformité INPDP / RGPD
* **Minimisation des données (Loi n° 2004-63)** : Seuls le nom et l'email du déclarant sont enregistrés.
* **Anonymisation sur la carte publique** : L'identité du citoyen n'est jamais exposée publiquement.
* **Suppression des métadonnées EXIF** : Détection et élimination du segment APP1 (données GPS natives et identifiant matériel du smartphone) avant stockage.
* **Row Level Security (RLS)** : Un citoyen n'accède qu'à ses propres tickets ; les agents n'accèdent qu'aux tickets de leur service.

---

### Diapositive 9 : Machine à États des Tickets (Workflow Strict)
* Workflow : *Nouveau $\rightarrow$ Accepté $\rightarrow$ En cours $\rightarrow$ Résolu $\rightarrow$ Clôturé*.
* **Règle absolue** : La transition vers **Résolu** exige obligatoirement une **photo de preuve** après travaux.
* Les transitions vers **Rejeté** ou **Doublon** exigent un motif détaillé côté serveur.
* Toute tentative de saut d'étape est rejetée avec une erreur HTTP 400.

---

### Diapositive 10 : Espace Citoyen (Démonstration PWA)
* Formulaire en 3 étapes intuitives : Photo $\rightarrow$ Catégorie $\rightarrow$ Coordonnées GPS.
* Détection automatique de la position de l'utilisateur avec ajustement sur la carte OpenStreetMap.
* Sauvegarde automatique des brouillons dans le stockage local du téléphone en cas de coupure de réseau 4G.

---

### Diapositive 11 : Espace Agent Municipal et Administration
* Tableau de bord avec filtrage par service technique, statut et quartier.
* Historique d'audit immuable : chaque changement d'état enregistre l'auteur, l'horodatage et les remarques.
* Génération et export immédiat des données au format CSV pour les rapports administratifs.

---

### Diapositive 12 : Bonus IA Vision : Google Gemini 1.5 Flash
* À l'envoi de la photo, le backend sollicite l'API Gemini pour identifier le désordre urbain.
* Retourne un score de confiance et une justification bilingue.
* **Mécanisme de repli (Fallback)** : Si le score est inférieur à 0.65 ou en cas d'indisponibilité du service IA, la catégorie saisie par le citoyen est conservée sans interruption de service.
* **Taux de précision mesuré** : **90.0 %** sur le jeu d'essai annoté.

---

### Diapositive 13 : Transparence et Open Data
* Page publique `/stats` affichant :
  * Le volume total d'incidents traités.
  * Le délai moyen de résolution par service.
  * La carte de chaleur de la répartition par quartier.
* Garantie stricte de zéro donnée personnelle exposée.

---

### Diapositive 14 : DevOps et Conteneurisation Sécurisée
* Dockerfile multi-étapes sur base Alpine Linux.
* Exécution sous utilisateur non-root dédié (`nestjs:1001`) pour éliminer tout risque d'élévation de privilèges.
* Analyse automatisée de vulnérabilités conteneur via **Trivy** dans le pipeline CI/CD.

---

### Diapositive 15 : Infrastructure as Code avec Terraform
* Automatisation complète du provisionnement GCP : Artifact Registry, Cloud Run, Secret Manager, rôles IAM au moindre privilège.
* Idempotence et reproductibilité garantie pour tout déploiement futur dans d'autres communes.

---

### Diapositive 16 : Intégration et Déploiement Continus (CI/CD)
* Pipeline GitHub Actions déclenché à chaque commit :
  * Linting et vérification TypeScript.
  * Exécution des 29 tests unitaires et d'intégration Jest.
  * Tests Vitest du frontend.
  * Scan de sécurité Trivy.
  * Publication Docker et déploiement automatisé.

---

### Diapositive 17 : Supervision et Observabilité (Grafana Cloud)
* Endpoint `/health` mesurant l'état de la base de données, la mémoire heap et l'uptime.
* Endpoint `/metrics` compatible Prometheus.
* 3 alertes configurées : Taux d'erreurs 5xx > 5 %, Latence p95 > 1000 ms, Indisponibilité du service.
* **Tâche planifiée anti-mise en veille** : Ping automatisé toutes les 72h pour empêcher la mise en pause du palier gratuit Supabase.

---

### Diapositive 18 : Validation et Tests de Montée en Charge (k6)
* Simulation de 50 utilisateurs simultanés via k6.
* 95 % des requêtes traitées en moins de 320 ms.
* **Taux de succès des tests : 100 % (29/29 tests Jest, 2/2 tests Vitest, 6/6 tests de machine à états)**.

---

### Diapositive 19 : Bilan du Pilote Municipal à Kalâa Seghira
* Retours unanimes des agents sur le gain de temps et la clarté apportée par la photo de preuve.
* Réduction estimée du délai moyen de traitement des nids-de-poule de 7 jours à 2,5 jours.
* Guide utilisateur bilingue remis aux agents lors d'une session de formation d'une heure.

---

### Diapositive 20 : Conclusion et Perspectives
* **Bilan** : Projet complet, testé, documenté et aligné sur les 11 critères de la grille d'évaluation ESPRIT.
* **Perspectives futures** :
  * Intégration d'un guichet numérique municipal (actes de naissance, prise de rendez-vous).
  * Algorithme d'optimisation des tournées des camions de collecte des ordures selon la densité des signalements.
* *Merci pour votre attention. Place aux questions du jury.*
