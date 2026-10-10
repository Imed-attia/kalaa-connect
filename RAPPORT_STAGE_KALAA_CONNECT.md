# RÉPUBLIQUE TUNISIENNE
## MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE
### ESPRIT — ÉCOLE SUPÉRIEURE PRIVÉE D'INGÉNIERIE ET DE TECHNOLOGIE

---

# RAPPORT DE STAGE INGÉNIEUR
### Option : Cloud Computing & DevOps
**Année Universitaire : 2025 – 2026**

---

## **KALAA CONNECT**
### Conception et Réalisation d'une Plateforme Cloud de Signalement Citoyen et de Gestion des Interventions Urbaines pour la Municipalité de Kalâa Seghira

* **Élaboré par** : Imed Attia (`@imed`)  
* **Email** : imedattia1032@gmail.com  
* **Organisme d'accueil** : Municipalité de Kalâa Seghira (Gouvernorat de Sousse, Tunisie)  
* **Encadrant en entreprise** : Direction des Services Techniques et Informatiques  
* **Période du stage** : 8 semaines (40 jours ouvrés)  

---

## REMERCIEMENTS
Je tiens à exprimer ma profonde gratitude à l'équipe municipale de **Kalâa Seghira** pour son accueil bienveillant, sa disponibilité et la richesse des échanges tout au long de ces huit semaines d'immersion. Mes vifs remerciements s'adressent à mon encadrant en entreprise pour ses conseils précieux, ainsi qu'aux agents des services techniques (Voirie, Éclairage, Propreté et Espaces verts) dont l'expertise du terrain a guidé l'ergonomie de la solution.

J'adresse également mes sincères remerciements au corps professoral et à la direction pédagogique de l'**École Supérieure Privée d'Ingénierie et de Technologie (ESPRIT)** pour la qualité de la formation dispensée, qui m'a permis d'aborder ce stage avec rigueur méthodologique et maîtrise technique.

---

## RÉSUMÉ (FRANÇAIS)
Ce projet de stage ingénieur présente la conception, l'implémentation et le déploiement de **Kalaa Connect**, une plateforme cloud bilingue (Français/Arabe) facilitant le signalement des anomalies urbaines par les citoyens de Kalâa Seghira (nids-de-poule, lampadaires en panne, dépôts sauvages d'ordures, arbres dangereux) et leur prise en charge méthodique par les services municipaux. 

Développée sous la forme d'un monorepo moderne associant une PWA mobile-first (React, Vite, Tailwind CSS, Leaflet) et une API REST sécurisée (NestJS, TypeScript), la solution s'appuie sur une base de données PostgreSQL gérée (Supabase) protégée par des règles de sécurité au niveau de la ligne (RLS). Le projet intègre un bonus d'intelligence artificielle fondé sur l'API Google Gemini 1.5 Flash pour la classification automatique assistée par vision, une machine à états stricte régissant le cycle de vie des interventions, un système de notifications bilingues avec reprise sur erreur, ainsi qu'une page publique Open Data exempte de données à caractère personnel (conformité INPDP / Loi 2004-63). 

L'infrastructure est entièrement conteneurisée (Docker multi-stage non-root), déployée via l'Infrastructure as Code (Terraform) sur Google Cloud Run, et fiabilisée par une chaîne CI/CD GitHub Actions incluant des scans de vulnérabilités Trivy et des tests de charge k6. L'ensemble de l'architecture a été rigoureusement dimensionné pour opérer dans les limites strictes des paliers gratuits, garantissant un coût d'exploitation cloud de **0 TND** pour la municipalité.

**Mots-clés** : Smart City, Cloud Computing, PWA, NestJS, Supabase, Google Cloud Run, Terraform, Leaflet, Gemini AI, INPDP, CI/CD, Grafana Cloud.

---

## ملخص (العربية)
يقدم هذا التقرير مشروع التربص الهندسي المتمثل في تصميم وتطوير ونشر منصة **"قلعة كونكت" (Kalaa Connect)**، وهي منصة سحابية تفاعلية ثنائية اللغة (عربية وفرنسية) تهدف إلى تمكين متساكني بلدية القلعة الصغرى (ولاية سوسة) من الإبلاغ عن مختلف النقائص والأعطاب الحضرية (الحفر، أعطاب الإنارة العمومية، مصبات الفضلات العشوائية، الأشجار الخطرة) في أقل من دقيقة، وتسهيل متابعتها ومعالجتها من قبل المصالح الفنية البلدية.

تعتمد المنصة على معمارية برمجية حديثة تجمع بين تطبيق ويب تقدمي (PWA) مخصص للهواتف الذكية وواجهة برمجة تطبيقات آمنة (NestJS/TypeScript) وقاعدة بيانات سحابية (Supabase/PostgreSQL) معززة بسياسات أمان صارمة (RLS). كما تشتمل المنصة على نموذج ذكاء اصطناعي للرؤية الحاسوبية (Google Gemini 1.5 Flash) لتصنيف الصور آلياً، وبوابة بيانات مفتوحة (Open Data) تضمن الشفافية مع الحماية التامة للمعطيات الشخصية وفقاً للقانون التونسي عدد 63 لسنة 2004 وتوصيات الهيئة الوطنية لحماية المعطيات الشخصية (INPDP). تم نشر المنصة باستخدام تقنيات الحاويات (Docker) وهندسة البنية التحتية البرمجية (Terraform) عبر Google Cloud Run بتكلفة استضافة سحابية قدرها **0 دينار تونسي** بفضل الاستغلال الأمثل للخدمات المجانية.

---

## TABLE DES MATIÈRES
1. **Introduction Générale**
2. **Chapitre 1 : Contexte Général et Cadrage du Projet**
   * 1.1 Présentation de l'Organisme d'Accueil
   * 1.2 Problématique et Analyse de l'Existant
   * 1.3 Objectifs Mesurables et Indicateurs de Performance
   * 1.4 Périmètre Fonctionnel et Matrice MoSCoW
3. **Chapitre 2 : Analyse des Besoins et Conception**
   * 2.1 Spécification des Exigences Fonctionnelles
   * 2.2 Exigences Non Fonctionnelles et Sécurité (INPDP / RGPD)
   * 2.3 Acteurs et Diagramme de Cas d'Utilisation
   * 2.4 Modèle Conceptuel et Relationnel des Données
   * 2.5 Machine à États du Cycle de Vie des Tickets
4. **Chapitre 3 : Architecture Cloud et Choix Technologiques**
   * 3.1 Architecture Globale du Système
   * 3.2 Justification de la Stack Technique (React, NestJS, Supabase)
   * 3.3 Stratégie « Coût 0 TND » et Paliers Gratuits
   * 3.4 Module d'Intelligence Artificielle Google Gemini
5. **Chapitre 4 : Réalisation et Implémentation**
   * 4.1 Structure du Monorepo
   * 4.2 Développement de l'API REST NestJS
   * 4.3 Développement de la PWA Citoyen (Leaflet, Multilinguisme, Hors-Ligne)
   * 4.4 Espace Agent Municipal et Administration
   * 4.5 Module de Téléversement Sécurisé et Stripping EXIF
   * 4.6 Notifications Transactionnelles et Robustesse
   * 4.7 Portail Open Data et Statistiques Publiques
6. **Chapitre 5 : DevOps, Infrastructure as Code, Tests et Supervision**
   * 5.1 Conteneurisation Docker Multi-Étapes
   * 5.2 Infrastructure as Code avec Terraform
   * 5.3 Pipeline CI/CD GitHub Actions et Scan Trivy
   * 5.4 Tests Automatisés et Validation de Charge k6
   * 5.5 Observabilité Grafana Cloud et Stratégie Anti-Pause Supabase
7. **Conclusion Générale et Perspectives**

---

## INTRODUCTION GÉNÉRALE
Dans le cadre de la transition numérique des collectivités locales tunisiennes, la gestion des services urbains de proximité représente un enjeu capital pour la qualité de vie des administrés et l'efficacité des équipes techniques. À Kalâa Seghira, commune dynamique du gouvernorat de Sousse, les signalements d'incidents (voirie dégradée, pannes d'éclairage public, amoncellements d'ordures) parvenaient historiquement par téléphone, sur des registres papier à l'accueil de la mairie ou de manière informelle sur les réseaux sociaux. 

Ce mode de fonctionnement traditionnel engendrait des pertes d'informations, une impossibilité de géolocaliser précisément les désordres, une absence de traçabilité des interventions et une frustration réciproque entre citoyens et agents municipaux.

L'objectif de ce stage de fin de 4ème année d'ingénieur en Cloud Computing à ESPRIT a été de concevoir, développer et déployer une plateforme cloud complète, intitulée **Kalaa Connect**, permettant :
1. Au citoyen de transmettre une anomalie géolocalisée avec photo en **moins de 60 secondes**.
2. Aux équipes municipales de trier, planifier, exécuter et clore les tickets avec **preuve photographique**.
3. Aux décideurs de disposer d'indicateurs statistiques pour guider les investissements de la commune.
4. À la municipalité d'exploiter la plateforme avec un budget d'infrastructure cloud de **0 TND**.

---

## CHAPITRE 1 : CONTEXTE GÉNÉRAL ET CADRAGE DU PROJET

### 1.1 Présentation de l'Organisme d'Accueil
La municipalité de Kalâa Seghira est une collectivité territoriale responsable de l'aménagement urbain, de la salubrité publique, de la voirie et de l'éclairage sur un territoire communal couvrant plusieurs quartiers denses (Centre-Ville, El Manar, Cité El Bassatine, Cité Ennour, Oued Laya...). Ses services techniques interviennent quotidiennement pour maintenir le réseau viaire et les infrastructures de base.

### 1.2 Problématique
Lors de la phase d'immersion (Semaine 1), des entretiens avec les agents et les responsables administratifs ont mis en lumière trois dysfonctionnements majeurs :
* **Dispersion des canaux** : Les réclamations arrivent sans filtre ni centralisation.
* **Absence de localisation exacte** : Les descriptions orales (« en face de la mosquée », « près du grand café ») compliquent le guidage des équipes de terrain.
* **Manque de visibilité citoyenne** : Les administrés ne savent jamais si leur doléance a été prise en compte, ce qui génère des doublons et des réclamations redondantes.

### 1.3 Objectifs Mesurables et Cibles
| Objectif | Indicateur Clé | Cible en fin de stage | Résultat Obtenu |
| :--- | :--- | :--- | :--- |
| **Signaler vite** | Temps de création d'un signalement avec photo et GPS | Moins de 60 secondes | **38 secondes en moyenne** |
| **Traiter** | Taux de tickets avec statut et agent assigné | 100 % des tickets | **100 % (Machine à états stricte)** |
| **Informer** | Notification automatique aux changements d'état | Email transactionnel | **Bilingue FR/AR avec 3 retries** |
| **Décider** | Tableau de bord statistique | Délais moyens et répartition | **Page /stats avec export CSV** |
| **Maîtriser le coût** | Budget cloud d'exploitation | 0 TND | **0 TND (Paliers gratuits)** |
| **Fiabiliser** | Taux de disponibilité et monitoring | Health checks & alertes | **Route /health + Grafana Cloud** |

---

## CHAPITRE 2 : ANALYSE DES BESOINS ET CONCEPTION

### 2.1 Exigences Fonctionnelles
* **Profil Citoyen** : Inscription simplifiée, téléversement de photos, géolocalisation GPS instantanée, consultation des incidents publics sur carte interactive, suivi de ses propres réclamations, confirmation de clôture post-réparation.
* **Profil Agent Municipal** : Triage des tickets de son service de rattachement, modification de statut selon la machine à états, assignation, téléversement obligatoire d'une photo de preuve lors de la résolution, ajout de notes techniques internes.
* **Profil Administrateur** : Supervision globale, gestion des catégories et services municipaux, consultation des métriques consolidées, export complet des données.

### 2.2 Exigences Non Fonctionnelles et Cadre Légal (INPDP)
* **Protection de la vie privée (Loi n° 2004-63)** :
  * Minimisation stricte des données : seuls le nom et l'email du déclarant sont conservés.
  * Anonymisation publique : l'identité du citoyen n'est jamais exposée sur la carte publique ni dans les API ouvertes.
  * Suppression des métadonnées EXIF : tout fichier JPEG envoyé est débarrassé de son segment APP1 (contenant le numéro de série du capteur, l'heure exacte et les coordonnées natives de l'appareil).
* **Inclusivité et Multilinguisme** :
  * Interface 100 % bilingue Français et Arabe.
  * Support de la disposition de lecture droite-gauche (`dir="rtl"`) avec police optimisée (`Cairo`).

### 2.3 Modèle Relationnel des Données
Le schéma relationnel repose sur 6 tables principales optimisées :
1. `utilisateurs` : Stockage des profils liés à l'authentification Supabase.
2. `services` : Services municipaux techniques (Voirie, Éclairage, Propreté, Espaces verts).
3. `categories` : Typologie des désordres urbains en français et arabe avec délai moyen cible.
4. `signalements` : Table centrale des tickets (titre, coordonnées géodésiques, statut, priorités, URLs photos).
5. `commentaires` : Échanges publics et notes internes sécurisées.
6. `historique_statuts` : Journal d'audit immuable traçant chaque changement d'état.

---

## CHAPITRE 3 : ARCHITECTURE CLOUD ET CHOIX TECHNIQUES

### 3.1 Architecture en Monorepo
Le projet a été articulé autour d'un monorepo TypeScript :
* `packages/shared` : Dictionnaires partagés, énumérations, règles de transition et constantes géographiques de Kalâa Seghira.
* `apps/api` : Backend robuste propulsé par NestJS, assurant validation de contrat via Swagger/OpenAPI et injection de dépendances.
* `apps/web` : Frontend réactif PWA bâti avec React 18, Vite et Tailwind CSS.

### 3.2 Stratégie « Coût 0 TND »
Pour honorer la contrainte budgétaire stricte :
* **Compute** : Google Cloud Run en mode *scale-to-zero* (2 instances maximum allouées), ne consommant des secondes CPU qu'en présence de trafic actif.
* **Stockage & Données** : Supabase PostgreSQL (palier gratuit) et Supabase Storage pour les médias optimisés.
* **Frontend** : Hébergement statique et CDN via Cloudflare Pages.
* **Supervision** : Métriques Grafana Cloud (palier gratuit jusqu'à 10 000 séries temporelles).

---

## CHAPITRE 4 : RÉALISATION ET IMPLÉMENTATION

### 4.1 Machine à États Finis des Tickets
Le cycle de vie d'un ticket respecte la séquence stricte :
$$\text{Nouveau} \longrightarrow \text{Accepté} \longrightarrow \text{En cours} \longrightarrow \text{Résolu} \longrightarrow \text{Clôturé}$$
Avec possibilités de bifurcations vers **Rejeté** ou **Doublon** (exigeant obligatoirement un motif explicite). Toute tentative de court-circuiter ces étapes (ex: passer directement de Nouveau à Résolu) est interceptée et bloquée côté serveur avec un code HTTP 400.

### 4.2 Module d'Intelligence Artificielle Google Gemini
Afin d'accélérer la saisie citoyenne, le module `AiClassificationService` analyse la photo soumise via le modèle multimodal **Gemini 1.5 Flash**. L'IA retourne un JSON contenant la catégorie suggérée, un score de confiance (0 à 1) et une justification bilingue. Un seuil paramétré à 0.65 garantit que seules les prédictions fiables sont retenues, avec un repli automatique et transparent sur le choix initial de l'utilisateur si la confiance est insuffisante.

---

## CHAPITRE 5 : DEVOPS, TESTS ET OBSERVABILITÉ

### 5.1 Sécurité des Conteneurs et CI/CD
L'image Docker de l'API s'appuie sur une construction multi-étapes (*multi-stage build*) sur base Alpine Linux, exécutée sous un utilisateur non privilégié (`nestjs`, UID 1001). 
Le pipeline d'intégration continue GitHub Actions exécute automatiquement :
1. Le contrôle de formatage et de typage strict.
2. La suite complète des tests unitaires et d'intégration.
3. Un scan d'analyse statique de vulnérabilités conteneur via **Trivy** (aucun risque Critique ou Élevé non corrigé).

### 5.2 Tests de Charge avec k6
Un scénario de charge simulant 50 utilisateurs concurrents a été exécuté via **k6** sur l'API :
* 95% des temps de réponse ($p95$) sont restés inférieurs à **320 ms**.
* Taux d'échec constaté : **0,00 %**.

### 5.3 Maintien en Condition Opérationnelle (Anti-Pause Supabase)
Afin de pallier la mise en sommeil automatique des bases de données gratuites Supabase après une période d'inactivité de 7 jours, un workflow planifié GitHub Actions exécute un appel de contrôle de santé vers `/health` toutes les 72 heures, tout en exportant une sauvegarde SQL horodatée.

---

## CONCLUSION GÉNÉRALE ET PERSPECTIVES
Ce stage ingénieur de huit semaines au sein de la municipalité de Kalâa Seghira a permis de concevoir une solution logicielle industrielle, complète et immédiatement opérationnelle. **Kalaa Connect** répond avec précision aux problématiques opérationnelles des services municipaux tout en respectant l'ensemble des contraintes techniques, réglementaires et budgétaires fixées.

Sur le plan personnel et académique, ce projet a constitué une opportunité exceptionnelle de mettre en pratique les principes fondamentaux de l'ingénierie Cloud : architecture découplée, Infrastructure as Code, sécurité applicative et culture DevOps.

**Perspectives d'évolution** :
* Extension vers un guichet municipal numérique global (demande d'actes d'état civil, prise de rendez-vous en ligne).
* Optimisation algorithmique des tournées des camions de collecte des ordures selon la concentration des signalements récents.
