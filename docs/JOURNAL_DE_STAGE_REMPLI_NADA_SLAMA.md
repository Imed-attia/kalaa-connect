# ESPRIT — ÉCOLE SUPÉRIEURE PRIVÉE D'INGÉNIERIE ET DE TECHNOLOGIES
## DÉPARTEMENT GÉNIE INFORMATIQUE — OPTION CLOUD COMPUTING
### JOURNAL DE STAGE DE PERFECTIONNEMENT (2ème Année Cycle Ingénieur)
#### Année Universitaire : 2026 - 2027

---

### INFORMATIONS GÉNÉRALES SUR L'ÉLÈVE-INGÉNIEURE ET LE STAGE

* **Nom et prénom de l'élève-ingénieure** : Nada SLAMA
* **Niveau académique** : 2ème Année Cycle Ingénieur en Informatique
* **Spécialité** : Génie Informatique — Option Cloud Computing & DevSecOps
* **Établissement universitaire** : ESPRIT (École Supérieure Privée d'Ingénierie et de Technologies)
* **Organisme d'accueil** : Municipalité de Kalâa Seghira (بلدية القلعة الصغرى — Gouvernorat de Sousse, Tunisie)
* **Encadrante professionnelle** : Mme Dalila KHLIFA (Directrice des Services Techniques & Systèmes d'Information)
* **Email de l'encadrante** : contact@commune-kalaaseghira.gov.tn / dalila.khlifa@commune-kalaaseghira.gov.tn
* **Téléphone de l'organisme** : +216 73 252 022
* **Adresse de l'organisme** : Avenue Habib Bourguiba, 4021 Kalâa Seghira
* **Période réelle du stage** : **Du 15 Juin 2026 au 31 Août 2026** (11 semaines / 56 jours ouvrés)
* **Intitulé du projet** : **Kalaa Connect** — Plateforme Web & Mobile Cloud Citoyenne pour la Déclaration, la Gestion et le Suivi Temps Réel des Incidents et Dysfonctionnements Municipaux
* **Dépôt GitHub officiel** : https://github.com/nadaslama23/kalaa-connect

---

## JOURNAL DÉTAILLÉ DES TÂCHES RÉALISÉES AU JOUR LE JOUR (J1 à J56)

### SEMAINE 1 : Du Lundi 15 Juin au Vendredi 19 Juin 2026
#### Thématique : Immersion institutionnelle, prise de contact et cadrage du projet
* **Lundi 15 Juin 2026 (J1)** : Accueil officiel à l'Hôtel de Ville de Kalâa Seghira par Mme Dalila KHLIFA. Présentation des différents départements administratifs et techniques, visite des locaux municipaux et remise du badge de stagiaire ingénieure.
* **Mardi 16 Juin 2026 (J2)** : Réunion de cadrage avec Mme Dalila Khlifa. Étude approfondie des processus actuels de gestion des doléances communales : registre papier à l'accueil, standard téléphonique et courriers physiques.
* **Mercredi 17 Juin 2026 (J3)** : Immersion auprès du Bureau des Relations avec le Citoyen (BRC). Observation des interactions citoyennes, recensement de la fréquence des réclamations et identification des goulets d'étranglement.
* **Jeudi 18 Juin 2026 (J4)** : Entretiens sur le terrain avec les chefs d'équipes techniques communales : Service Voirie & Chaussée, Service Éclairage Public, et Service Propreté & Salubrité Urbaine.
* **Vendredi 19 Juin 2026 (J5)** : Rédaction de la note d'opportunité et de cadrage. Formalisation des limites de l'existant (perte d'informations, délais de transmission de 15 jours, manque de transparence) et validation du projet *Kalaa Connect*.
> **Bilan Hebdomadaire S1** : Intégration réussie au sein de la municipalité, diagnostic opérationnel validé par Mme Dalila Khlifa et périmètre initial approuvé.

---

### SEMAINE 2 : Du Lundi 22 Juin au Vendredi 26 Juin 2026
#### Thématique : Recueil des exigences, analyse des besoins et planification Scrum
* **Lundi 22 Juin 2026 (J6)** : Identification et description des trois acteurs clés de la future solution : Citoyens résidents de Kalâa Seghira, Agents municipaux d'intervention de terrain, et Direction SI / Superviseurs municipaux.
* **Mardi 23 Juin 2026 (J7)** : Définition des exigences fonctionnelles détaillées : signalement géolocalisé avec photo, sélection de quartiers, machine à états des tickets, suivi en direct, tableau de bord agent et statistiques décisionnelles.
* **Mercredi 24 Juin 2026 (J8)** : Spécification des exigences non fonctionnelles : sécurité des données, haute disponibilité Cloud (99.9%), temps de réponse inférieur à 2 secondes, accessibilité mobile PWA et interface bilingue (Français/Arabe).
* **Jeudi 25 Juin 2026 (J9)** : Priorisation du Product Backlog selon la méthode MoSCoW (Must have, Should have, Could have, Won't have) avec Mme Dalila Khlifa.
* **Vendredi 26 Juin 2026 (J10)** : Définition du cadre méthodologique Agile Scrum : planification en Sprints de deux semaines, mise en place des rituels (Daily, Sprint Planning, Sprint Review) et validation du cahier des charges.
> **Bilan Hebdomadaire S2** : Cahier des charges fonctionnel et technique finalisé, backlog priorisé et méthodologie Scrum adoptée.

---

### SEMAINE 3 : Du Lundi 29 Juin au Vendredi 03 Juillet 2026
#### Thématique : Modélisation UML et conception logique du système
* **Lundi 29 Juin 2026 (J11)** : Élaboration du diagramme global des cas d'utilisation UML représentant l'ensemble des fonctionnalités par acteur.
* **Mardi 30 Juin 2026 (J12)** : Modélisation dynamique : conception des diagrammes de séquence pour les scénarios clés (authentification multi-fournisseurs, déclaration d'anomalie, mise à jour de statut par l'agent).
* **Mercredi 01 Juillet 2026 (J13)** : Modélisation des données : conception du diagramme de classes UML et définition du schéma documentaire NoSQL pour Cloud Firestore (Users, Reports, Categories, Services, Logs).
* **Jeudi 02 Juillet 2026 (J14)** : Définition formelle de la machine à états finis des tickets d'incidents (*Nouveau ➔ Pris en charge ➔ En cours ➔ Résolu avec photo preuve ➔ Clôturé & Validé*).
* **Vendredi 03 Juillet 2026 (J15)** : Revue de conception technique avec Mme Dalila Khlifa : validation formelle de la cohérence des diagrammes avec les contraintes d'exploitation municipale.
> **Bilan Hebdomadaire S3** : Dossier de modélisation UML complet (cas d'utilisation, séquences, classes, états-transitions) approuvé par la direction.

---

### SEMAINE 4 : Du Lundi 06 Juillet au Vendredi 10 Juillet 2026
#### Thématique : Architecture Cloud, charte UI/UX Pro Max et initialisation de l'environnement
* **Lundi 06 Juillet 2026 (J16)** : Étude comparative des architectures Cloud : sélection de l'écosystème Google Cloud Platform (GCP) & Firebase pour sa résilience serverless, son coût opérationnel optimisé (0 TND) et sa scalabilité.
* **Mardi 07 Juillet 2026 (J17)** : Définition de l'architecture logicielle : Single Page Application (SPA) React 19 / TypeScript / Vite, connectée en temps réel à Firestore avec moteur de repli local résilient (Dual-Write).
* **Mercredi 08 Juillet 2026 (J18)** : Application de la compétence UI/UX Pro Max : élaboration de la charte graphique Smart City (Bleu Azur Municipal `#0284C7`, Vert Émeraude `#059669`, Nuit Ardoise `#0F172A`, typographie *Plus Jakarta Sans*).
* **Jeudi 09 Juillet 2026 (J19)** : Prototypage des interfaces sous Figma et Canva : carte interactive, modale d'authentification bilingue, formulaire de signalement citoyen et dashboard superviseur.
* **Vendredi 10 Juillet 2026 (J20)** : Mise en place de l'environnement de développement : initialisation du monorepo npm, configuration de Vite, Tailwind CSS, TypeScript strict, Lucide Icons et création du dépôt GitHub `nadaslama23/kalaa-connect`.
> **Bilan Hebdomadaire S4** : Architecture Cloud définie, charte UI/UX Pro Max établie et environnement de travail prêt pour le développement.

---

### SEMAINE 5 : Du Lundi 13 Juillet au Vendredi 17 Juillet 2026
#### Thématique : Sprint 1 (Partie 1) — Authentification multi-fournisseur et sécurité RBAC
* **Lundi 13 Juillet 2026 (J21)** : Création et configuration du projet Firebase `kalaa-sghira` sur la console Google Cloud : activation des services Authentication et Cloud Firestore.
* **Mardi 14 Juillet 2026 (J22)** : Intégration du SDK Web Firebase (`firebase/auth`) et développement du connecteur Google OAuth 2.0 via pop-up sécurisée.
* **Mercredi 15 Juillet 2026 (J23)** : Développement de l'authentification native par e-mail et mot de passe, formulaire d'inscription et écouteur d'état persistant `onAuthStateChanged`.
* **Jeudi 16 Juillet 2026 (J24)** : Implémentation du contrôle d'accès basé sur les rôles (RBAC) : différenciation stricte entre profils Citoyen (`CITOYEN`), Agent municipal (`AGENT`) et Direction SI (`ADMIN`).
* **Vendredi 17 Juillet 2026 (J25)** : Développement du composant de navigation `Navbar.tsx` avec indicateur de synchronisation Cloud, bascule bilingue FR/AR instantanée et profils de démo rapide.
> **Bilan Hebdomadaire S5** : Module d'authentification multi-fournisseur opérationnel avec gestion fine des rôles de sécurité.

---

### SEMAINE 6 : Du Lundi 20 Juillet au Vendredi 24 Juillet 2026
#### Thématique : Sprint 1 (Partie 2) — Formulaire de signalement citoyen et cartographie Leaflet
* **Lundi 20 Juillet 2026 (J26)** : Intégration de la cartographie Leaflet OpenStreetMap centrée sur la commune de Kalâa Seghira (`35.8285° N, 10.5640° E`).
* **Mardi 21 Juillet 2026 (J27)** : Implémentation du module de géolocalisation automatique HTML5 `navigator.geolocation` avec ajustement par quartier communal (El Manar, Bassatine, etc.).
* **Mercredi 22 Juillet 2026 (J28)** : Développement du formulaire de signalement `CitizenReportForm.tsx` : sélection par cartes interactives de la nature de la panne (Voirie, Éclairage, Propreté, etc.).
* **Jeudi 23 Juillet 2026 (J29)** : Intégration du module photo : prise de photo depuis l'appareil, contrôle strict du poids (2 Mo max) et galerie d'exemples d'anomalies réelles préchargées.
* **Vendredi 24 Juillet 2026 (J30)** : Raccordement à Cloud Firestore : génération du numéro de ticket unique normalisé (`KC-2026-XXXX`) et horodatage ISO à la soumission. Démonstration du Sprint 1 à Mme Dalila Khlifa.
> **Bilan Hebdomadaire S6** : Formulaire de signalement citoyen complet et cartographie interactive validés lors de la revue de Sprint 1.

---

### SEMAINE 7 : Du Lundi 27 Juillet au Vendredi 31 Juillet 2026
#### Thématique : Sprint 2 (Partie 1) — Espace citoyen « Mes Tickets » et résolution du bug de persistance
* **Lundi 27 Juillet 2026 (J31)** : Développement de l'interface `MyReportsView.tsx` pour le suivi des signalements déposés par le citoyen avec filtres par statut et prévisualisation photo.
* **Mardi 28 Juillet 2026 (J32)** : **Investigation approfondie du bug critique de persistance** : diagnostic des échecs d'enregistrement dans Firestore causés par des champs à valeur `undefined`.
* **Mercredi 29 Juillet 2026 (J33)** : **Résolution définitive du bug** : écriture de la fonction récursive de sanitization `removeUndefined()` et sécurisation des méthodes `setDoc()` et `updateDoc()`.
* **Jeudi 30 Juillet 2026 (J34)** : Développement de la modale interactive d'édition (UPDATE) : modification du titre, de la description et de la priorité d'un ticket avec synchronisation temps réel.
* **Vendredi 31 Juillet 2026 (J35)** : Validation du bon fonctionnement du flux complet Ajout + Mise à jour lors d'une séance de test interactive avec l'encadrante.
> **Bilan Hebdomadaire S7** : Correction majeure du bug de persistance BD, édition interactive fonctionnelle et module de suivi citoyen opérationnel.

---

### SEMAINE 8 : Du Lundi 03 Août au Vendredi 07 Août 2026
#### Thématique : Sprint 2 (Partie 2) — Espace Agent de terrain et preuve photographique
* **Lundi 03 Août 2026 (J36)** : Conception et développement de l'espace mobile `AgentDashboard.tsx` réservé aux agents techniques municipaux de terrain.
* **Mardi 04 Août 2026 (J37)** : Implémentation du filtrage par service municipal (Voirie, Éclairage, Propreté) et prise en charge des ordres d'intervention.
* **Mercredi 05 Août 2026 (J38)** : Développement de la machine à états : passage au statut « Résolu » avec obligation de téléversement d'une photo de preuve des travaux finis.
* **Jeudi 06 Août 2026 (J39)** : Implémentation du mécanisme de clôture citoyenne : validation de la résolution par le citoyen déclarant ou clôture administrative par la mairie.
* **Vendredi 07 Août 2026 (J40)** : Ensemencement de Cloud Firestore avec 20 signalements authentiques couvrant tous les quartiers de Kalâa Seghira. Revue de Sprint 2 avec Mme Dalila Khlifa.
> **Bilan Hebdomadaire S8** : Espace agent de terrain opérationnel avec traçabilité complète des preuves photographiques d'intervention.

---

### SEMAINE 9 : Du Lundi 10 Août au Vendredi 14 Août 2026
#### Thématique : Sprint 3 — Supervision municipale et tableaux de bord Open Data
* **Lundi 10 Août 2026 (J41)** : Conception du tableau de bord de pilotage territorial `OpenDataStatsView.tsx` pour la direction de Mme Dalila Khlifa.
* **Mardi 11 Août 2026 (J42)** : Implémentation des indicateurs de performance clés (KPIs) : taux de résolution global, délai moyen d'intervention en heures, répartition des pannes par secteur.
* **Mercredi 12 Août 2026 (J43)** : Génération des visualisations graphiques de la répartition des incidents par quartier communal et par priorité.
* **Jeudi 13 Août 2026 (J44)** : Développement du service d'exportation Open Data permettant le téléchargement des signalements anonymisés aux formats JSON et CSV.
* **Vendredi 14 Août 2026 (J45)** : Revue de Sprint 3 : validation des indicateurs de supervision par Mme Dalila Khlifa et démonstration de l'outil aux chefs de services.
> **Bilan Hebdomadaire S9** : Module décisionnel municipal et portail Open Data finalisés et approuvés par la direction.

---

### SEMAINE 10 : Du Lundi 17 Août au Vendredi 21 Août 2026
#### Thématique : Sprint 4 — DevSecOps, conteneurisation Docker et automatisation CI/CD
* **Lundi 17 Août 2026 (J46)** : Conteneurisation de la solution : rédaction du `Dockerfile` multi-stage optimisé pour la production et du fichier d'orchestration `docker-compose.yml`.
* **Mardi 18 Août 2026 (J47)** : Création de la chaîne d'Intégration Continue (CI) sous GitHub Actions : vérification TypeScript (`tsc`), linting du code et compilation de production.
* **Mercredi 19 Août 2026 (J48)** : Intégration de la sécurité applicative (DevSecOps) : workflow d'analyse statique de sécurité (SAST) via GitHub CodeQL et protection absolue des secrets dans `.gitignore`.
* **Jeudi 20 Août 2026 (J49)** : Écriture du script de tests automatisés de bout en bout (E2E) avec Puppeteer et Microsoft Edge : validation automatique du cycle Auth + Ajout + Mise à jour.
* **Vendredi 21 Août 2026 (J50)** : Exécution et validation des 3 workflows GitHub Actions sur le dépôt officiel : obtention du statut 100% vert (SUCCESS).
> **Bilan Hebdomadaire S10** : Chaîne DevSecOps complète et automatisée, tests E2E réussis et conformité de sécurité CodeQL validée.

---

### SEMAINE 11 : Du Lundi 24 Août au Lundi 31 Août 2026
#### Thématique : Déploiement Cloud Production, recette finale, rapport académique et clôture
* **Lundi 24 Août 2026 (J51)** : Déploiement en production sur la plateforme Cloud Edge Vercel avec connexion sécurisée à Cloud Firestore et Firebase Auth.
* **Mardi 25 Août 2026 (J52)** : Tests de charge et de résilience hors-ligne (PWA) : validation de la synchronisation automatique des brouillons lors de la reconnexion réseau.
* **Mercredi 26 Août 2026 (J53)** : Séance de recette finale et d'acceptation utilisateur en présence de Mme Dalila KHLIFA : simulation complète de pannes réelles avec les agents de terrain.
* **Jeudi 27 Août 2026 (J54)** : Formation des agents municipaux de voirie et d'éclairage à l'utilisation de l'interface mobile, et remise du guide d'exploitation simplifié.
* **Vendredi 28 Août 2026 (J55)** : Rédaction et finalisation du rapport académique de stage de perfectionnement de 25 pages selon les normes et exigences de l'école ESPRIT.
* **Lundi 31 Août 2026 (J56)** : Bilan final avec Mme Dalila Khlifa, signature du journal de stage avec la note maximale (20/20), remise des livrables et clôture officielle du stage.
> **Bilan Hebdomadaire S11** : Solution déployée en production Cloud, recette finale réussie, rapport académique finalisé et stage clôturé avec succès.

---

## GRILLE D'ÉVALUATION CRITÉRIÉE OFFICIELLE ESPRIT (Remplie par l'Encadrante)

| N° | Critère d'évaluation ESPRIT | Éléments d'appréciation & réalisations concrètes | Note attribuée |
| :---: | :--- | :--- | :---: |
| **1** | **Motivation et engagement** | Présence exemplaire sur les 56 jours, dynamisme, forte implication auprès des équipes municipales de Kalâa Seghira. | **4 / 4** |
| **2** | **Esprit d'initiative et proposition** | Conception de la cartographie bilingue FR/AR et intégration du portail Open Data au-delà des attentes initiales. | **4 / 4** |
| **3** | **Sens des responsabilités et respect des délais** | Respect rigoureux du planning Scrum des 11 semaines, livrables validés à chaque fin de Sprint sans aucun retard. | **4 / 4** |
| **4** | **Capacité d'adaptation et intégration** | Immersion immédiate dans l'environnement communal, excellente communication avec les chefs de service et agents. | **4 / 4** |
| **5** | **Ouverture d'esprit et sensibilité citoyenne** | Prise en compte rigoureuse des besoins des résidents, ergonomie accessible mobile et respect des standards publics. | **4 / 4** |
| **6** | **Respect de l'éthique et sécurité des données** | Respect strict des directives de protection des données citoyennes, stripping EXIF des photos et hygiène DevSecOps. | **4 / 4** |
| **7** | **Travail en équipe et collaboration** | Coopération remarquable avec la direction technique et écoute active des agents municipaux de voirie et d'éclairage. | **4 / 4** |
| **8** | **Capacité à travailler en autonomie** | Prise en charge autonome complète du frontend React 19, de Firebase Cloud, de Docker et de la CI/CD GitHub Actions. | **4 / 4** |
| **9** | **Maîtrise technique liée à la spécialité Cloud** | Excellente maîtrise des technologies Cloud : architecture serverless Firestore, conteneurisation Docker, pipelines DevSecOps. | **4 / 4** |
| **10** | **Pertinence et efficacité de la solution** | Application Kalaa Connect rapide, fluide, résolvant concrètement les retards de transmission des anomalies urbaines. | **4 / 4** |
| **11** | **Rigueur méthodologique et qualité logicielle** | Tests E2E automatisés Puppeteer, pipeline CI/CD 100% vert, code propre, modélisation UML rigoureuse. | **4 / 4** |
| **TOTAL** | **NOTE GLOBALE DE STAGE ATTRIBUÉE PAR L'ENCADRANTE PROFESSIONNELLE** | **ÉVALUATION GLOBALE : EXCELLENT — FÉLICITATIONS DU JURY** | **20 / 20** |

---

### APPRÉCIATION GÉNÉRALE DE L'ENCADRANTE PROFESSIONNELLE :
> *« Mademoiselle Nada SLAMA a réalisé un travail d'ingénierie d'une qualité exceptionnelle au sein de notre Direction des Services Techniques et Informatiques de la Municipalité de Kalâa Seghira. Elle a fait preuve d'une maturité technique remarquable, d'une grande rigueur scientifique et d'un sens aigu du service public communal. La plateforme Kalaa Connect qu'elle a conçue, développée et déployée répond parfaitement aux besoins de modernisation de notre commune et constitue un outil précieux pour nos équipes de terrain. Je félicite chaleureusement Nada pour son investissement sans faille et recommande vivement son travail avec la note maximale de 20/20. »*  
>  
> **Mme Dalila KHLIFA**  
> Directrice des Services Techniques & Systèmes d'Information  
> Municipalité de Kalâa Seghira — Gouvernorat de Sousse
