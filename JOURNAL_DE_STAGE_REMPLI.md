# ESPRIT — École d'Ingénieurs
## JOURNAL DE STAGE INGÉNIEUR (8 semaines minimum)
### Année Universitaire 2025 / 2026

---

### INFORMATIONS GÉNÉRALES
* **Nom et prénom de l'élève ingénieur** : Imed Attia
* **Niveau / Année** : 4ème année $\rightarrow$ 5ème année (Option Cloud Computing)
* **Email** : imedattia1032@gmail.com
* **GitHub** : https://github.com/Imed-attia
* **Organisme / Entreprise d'accueil** : Municipalité de Kalâa Seghira (Sousse, Tunisie)
* **Nom de l'encadrant entreprise** : Encadrant Municipalité de Kalâa Seghira
* **Période de stage** : 8 semaines (40 jours ouvrés)
* **Projet** : **Kalaa Connect** — Plateforme Cloud de signalement citoyen et de traitement des anomalies urbaines

---

## JOURNAL DES TÂCHES RÉALISÉES AU JOUR LE JOUR (J1 à J40)

### SEMAINE 1 : Immersion, cadrage et recueil des besoins
* **J1** : Accueil par l'encadrant, présentation de la municipalité, visite des services techniques (voirie, éclairage, propreté). Remise du journal de stage pour validation du programme.
* **J2** : Entretiens avec les agents des services techniques. Recensement des types de problèmes signalés et analyse du circuit actuel de traitement (téléphone, registre papier, réseaux sociaux).
* **J3** : Entretien avec le responsable administratif. Collecte des contraintes : matériel disponible, bande passante internet, multilinguisme (Français/Arabe), volume de réclamations estimé.
* **J4** : Rédaction des exigences fonctionnelles et non fonctionnelles. Définition des 3 profils d'utilisateurs (Citoyen, Agent municipal, Administrateur) et priorisation MoSCoW.
* **J5** : Validation du périmètre MVP avec l'encadrant. Élaboration du planning des 8 semaines, création du dépôt GitHub et du tableau Kanban, rédaction de la note de cadrage.
> **Résumé hebdomadaire S1** : Immersion à la municipalité, entretiens avec les agents, recueil des besoins, validation du périmètre et du planning.

---

### SEMAINE 2 : Conception et fondations techniques
* **J6** : Rédaction des user stories détaillées avec critères d'acceptation. Élaboration du diagramme des cas d'utilisation UML pour les trois profils.
* **J7** : Conception de la base de données (Modèle Conceptuel des Données puis schéma relationnel SQL) : signalements, utilisateurs, services, catégories, historique des statuts.
* **J8** : Choix de l'architecture cloud et sélection des services gérés à palier gratuit (coût cible 0 TND). Élaboration du schéma d'architecture et matrice des risques.
* **J9** : Création des maquettes mobile-first de l'application citoyen et du tableau de bord agent en français et en arabe. Revue d'ergonomie avec un agent technique.
* **J10** : Initialisation du monorepo Git (`apps/web`, `apps/api`, `packages/shared`), conventions Git, premier pipeline CI (lint et build) avec GitHub Actions.
> **Résumé hebdomadaire S2** : Conception UML et base de données, architecture cloud, maquettes bilingues, mise en place du monorepo et de la CI.

---

### SEMAINE 3 : Base de données, sécurité et API REST
* **J11** : Écriture et exécution des migrations SQL (tables, contraintes, index), mise en place des politiques de sécurité par ligne (Row Level Security - RLS), données initiales de seed.
* **J12** : Développement de l'authentification déléguée JWT (Supabase Auth), création du garde de rôles RBAC (Citoyen, Agent, Admin), endpoints profil utilisateur.
* **J13** : Développement de l'API REST des signalements : création, consultation, détail, filtres par catégorie, statut et zone géographique, pagination et validation DTO.
* **J14** : Implémentation du module de téléversement sécurisé de photos : contrôle strict de la taille (1 Mo max), vérification du type MIME, suppression des métadonnées géographiques EXIF (INPDP).
* **J15** : Rédaction des tests unitaires et d'intégration de l'API, génération automatique de la documentation interactive OpenAPI / Swagger (`/api/docs`), revue de code.
> **Résumé hebdomadaire S3** : Base de données, sécurité RLS, authentification par rôles, API REST des signalements, upload sans EXIF et tests unitaires.

---

### SEMAINE 4 : Application Citoyen (PWA Mobile-First)
* **J16** : Développement du squelette front-end React avec Vite et Tailwind CSS : routage, gestion du multilinguisme français/arabe avec disposition droite-gauche (RTL).
* **J17** : Création des écrans d'inscription, de connexion et de sélection de profil, persistance de session et gestion réactive des erreurs.
* **J18** : Développement du formulaire de signalement en moins de 60 secondes : sélection de catégorie, prise de photo par caméra/fichier, coordonnées GPS avec ajustement cartographique.
* **J19** : Intégration de la cartographie Leaflet / OpenStreetMap des signalements publics avec filtres interactifs. Page « Mes signalements » avec suivi du statut.
* **J20** : Transformation de l'application en Progressive Web App (PWA) : manifeste, Service Worker, gestion du brouillon hors-ligne en cas de coupure réseau. Démonstration 1 à l'encadrant.
> **Résumé hebdomadaire S4** : Application citoyen bilingue installable (PWA), signalement avec photo et GPS, carte publique Leaflet, première démo validée.

---

### SEMAINE 5 : Espace Agent municipal et cycle de vie des tickets
* **J21** : Développement du tableau de bord de l'agent municipal : tri, pagination, filtres par statut et par service technique assigné (Voirie, Éclairage, Propreté, Espaces verts).
* **J22** : Implémentation de la machine à états stricte des tickets : transitions autorisées (*Nouveau $\rightarrow$ Accepté $\rightarrow$ En cours $\rightarrow$ Résolu $\rightarrow$ Clôturé*), rejet côté serveur des transitions interdites.
* **J23** : Implémentation de l'obligation de photo de preuve lors de la résolution, enregistrement de l'historique d'audit horodaté pour chaque transition.
* **J24** : Intégration du service d'envois d'emails transactionnels bilingues (Resend/Brevo) avec mécanisme de retry automatique en cas d'échec réseau.
* **J25** : Développement du module d'administration : gestion des services, comptes agents, export direct des données en CSV. Tests de bout en bout du parcours citoyen $\rightarrow$ agent $\rightarrow$ clôture.
> **Résumé hebdomadaire S5** : Espace agent, machine à états des statuts, notifications email bilingues, interface admin, export CSV et validation de la démo 2.

---

### SEMAINE 6 : Conteneurs, Infrastructure as Code (Terraform) et Déploiement
* **J26** : Écriture du `Dockerfile` multi-étapes sécurisé (image Alpine légère, utilisateur non-root), configuration de `docker-compose.yml` pour le développement local, audit de sécurité Trivy.
* **J27** : Écriture de l'Infrastructure as Code avec Terraform : Artifact Registry, service Google Cloud Run, gestionnaire de secrets (Secret Manager), compte de service au moindre privilège.
* **J28** : Mise en place du pipeline de déploiement continu avec GitHub Actions : lint, tests automatisés, scan Trivy, publication de l'image conteneur et déploiement du front sur Cloudflare Pages.
* **J29** : Configuration de la politique CORS, du HTTPS avec certificats gérés, limitation du nombre d'instances Cloud Run (max 2) pour garantir le respect strict du palier 0 TND.
* **J30** : Tests de montée en charge avec k6 (simulation de 50 utilisateurs simultanés), optimisation de la latence, vérification de la conformité OWASP Top 10.
> **Résumé hebdomadaire S6** : Conteneurisation Docker, Terraform Cloud Run, pipeline CI/CD GitHub Actions, contrôle budgétaire 0 TND et tests de charge k6.

---

### SEMAINE 7 : Supervision, Bonus IA Gemini et Open Data
* **J31** : Mise en place de la supervision : journaux structurés JSON avec identifiant de corrélation `X-Request-ID`, endpoint `/health`, métriques Prometheus/Grafana Cloud, définition des alertes.
* **J32** : Implémentation du contrôle de disponibilité externe et de la tâche planifiée GitHub Actions (ping toutes les 72h + sauvegarde SQL) pour empêcher la mise en pause gratuite de Supabase.
* **J33** : Intégration de l'IA générative Google Gemini 1.5 Flash : analyse de la photo, suggestion automatique de la catégorie avec score de confiance et explication, mécanisme de repli transparent.
* **J34** : Évaluation du modèle de classification IA sur un dataset de 50 photos tests, mesure du taux d'exactitude (> 80%), ajustement du seuil de confiance à 0.65.
* **J35** : Développement de la page publique `/stats` Open Data : indicateurs clés, délai moyen, répartition par quartier sans aucune donnée personnelle, export CSV.
> **Résumé hebdomadaire S7** : Supervision Grafana, sauvegarde SQL automatique, classification d'images par IA Gemini, page et export Open Data.

---

### SEMAINE 8 : Pilote, formation des agents et remise du projet
* **J36** : Préparation des jeux de données réels pour le pilote municipal, vérification finale de l'absence de bugs, gel des nouvelles fonctionnalités.
* **J37** : Déroulement du pilote avec les agents des services techniques de Kalâa Seghira : simulation de signalements réels sur le terrain, recueil des retours et observations.
* **J38** : Ajustements ergonomiques mineurs suite aux remarques du pilote. Séance de formation des agents techniques municipaux (1 heure) et rédaction du guide utilisateur bilingue FR/AR.
* **J39** : Finalisation de la documentation technique complète : README, architecture cloud, guide d'exploitation et de déploiement, remise des livrables et du dépôt GitHub.
* **J40** : Rédaction finale du rapport de stage d'ingénieur, préparation de la soutenance finale, signature du journal de stage et de l'attestation par l'encadrant entreprise.
> **Résumé hebdomadaire S8** : Pilote sur le terrain, formation des agents municipaux, documentation technique finale, rapport de stage et soutenance.

---

## GRILLE D'ÉVALUATION CRITÉRIÉE ESPRIT (Section 9 du plan)

| Critère d'évaluation | Preuve concrète fournie dans le projet | Mention visée |
| :--- | :--- | :--- |
| **1. Motivation et engagement** | Journal complet sur 40 jours, 2 démos intermédiaires (J20 et J25), respect rigoureux du calendrier. | **Excellent (4/4)** |
| **2. Esprit d'initiative & proposition** | Intégration du bonus d'IA vision Gemini et du portail Open Data citoyen en plus du MVP initial. | **Excellent (4/4)** |
| **3. Sens des responsabilités et délais** | Planning 8 semaines tenu, livrables validés chaque vendredi, tableau Kanban à jour. | **Excellent (4/4)** |
| **4. Capacité d'adaptation** | Immersion semaine 1, intégration du vocabulaire et des circuits administratifs réels de la commune. | **Excellent (4/4)** |
| **5. Ouverture d'esprit & sensibilité sociale** | Interface bilingue Français/Arabe (RTL), accessibilité mobile-first pour smartphones d'entrée de gamme. | **Excellent (4/4)** |
| **6. Respect de l'éthique et des valeurs** | Minimisation stricte des données (INPDP / Loi 2004-63), stripping EXIF, Open Data 100% anonymisé. | **Excellent (4/4)** |
| **7. Travail en équipe et collaboration** | Entretiens réguliers avec les agents municipaux, intégration des retours du pilote de terrain. | **Excellent (4/4)** |
| **8. Capacité à travailler en autonomie** | Prise en charge autonome de l'intégralité du monorepo, de Docker, de Terraform et de la CI/CD. | **Excellent (4/4)** |
| **9. Maîtrise technique liée à la spécialité** | Maîtrise complète de la stack Cloud : Docker multi-stage, Terraform GCP, Cloud Run, Supabase, Grafana. | **Excellent (4/4)** |
| **10. Pertinence de la solution mise en place** | Signalement en moins de 60 secondes, 0 TND de coût cloud grâce aux paliers gratuits optimisés. | **Excellent (4/4)** |
| **11. Utilisation des ressources et méthodes** | GitHub Actions, scan Trivy, tests de charge k6, respect du Top 10 OWASP, TypeScript strict. | **Excellent (4/4)** |
