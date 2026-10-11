# Analyse des Coûts Cloud & Compromis d'Ingénierie — Kalaa Connect

**Projet** : Kalaa Connect  
**Auteure** : Nada SLAMA (Élève-Ingénieure ESPRIT)  
**Encadrante Professionnelle** : Mme Dalila KHLIFA (Municipalité de Kalâa Seghira)  
**Année Universitaire** : 2025–2026  

---

## 1. Modèle Économique & Coût Total de Possession (TCO)

Le choix de l'architecture de **Kalaa Connect** répond à un impératif fondamental pour une municipalité de taille moyenne comme Kalâa Seghira : **maximiser la fiabilité et la sécurité tout en minimisant les coûts opérationnels récurrents**.

### Comparatif Budgétaire Mensuel :

| Service Cloud | Phase d'Expérimentation & Pilote (Actuel) | Phase de Production Municipale Généralisée |
| :--- | :--- | :--- |
| **Vercel (Frontend & CDN)** | **0 $ / mois** (Tier Hobby — Bande passante 100GB) | **20 $ / mois** (Tier Pro — SLA 99.99%, domaines personnalisés illimités) |
| **Supabase (PostgreSQL & Storage)** | **0 $ / mois** (Tier Gratuit — 500MB DB, 1GB Stockage) | **25 $ / mois** (Tier Pro — 8GB DB, 100GB Stockage, sauvegardes quotidiennes 7 jours) |
| **Backend API (Container Runtime)** | **0 $ / mois** (Hébergement VPS existant ou Render Free) | **7 $ - 15 $ / mois** (Instance 1 vCPU / 1GB RAM avec haute disponibilité) |
| **Prometheus & Grafana (Monitoring)** | **0 $ / mois** (Auto-hébergé dans Docker) | **0 $ / mois** (Auto-hébergé sur serveur d'administration municipal) |
| **Certificats SSL & DNS (Cloudflare)** | **0 $ / mois** (Tier Gratuit avec protection DDoS) | **0 $ / mois** (Tier Gratuit suffisant pour le trafic municipal) |
| **TOTAL MENSUEL ESTIMÉ** | **0 $ / mois (100% Gratuit)** | **~ 52 $ - 60 $ / mois (~ 160 à 190 TND / mois)** |

Ce budget extrêmement maîtrisé démontre la faisabilité financière du projet pour la commune de Kalâa Seghira, sans nécessiter d'investissements matériels lourds.

---

## 2. Analyse des Compromis Techniques (Architecture Trade-offs)

### Compromis 1 : Monolithe Modulaire (NestJS) vs Microservices
- **Choix Retenu** : Monolithe modulaire en couches.
- **Raisonnement** : Pour une équipe municipale réduite, une architecture en microservices aurait introduit une complexité opérationnelle disproportionnée (orchestration de services multiples, latence réseau inter-services, distribution des transactions). Le monolithe modulaire NestJS offre un cloisonnement strict du code via des modules indépendants tout en simplifiant le déploiement sur une instance unique.

### Compromis 2 : Single Page Application (SPA React) vs Rendu Côté Serveur (SSR / Next.js)
- **Choix Retenu** : SPA React 19 compilée statiquement et distribuée via Vercel Edge CDN.
- **Raisonnement** : La SPA permet une mise en cache globale ultra-performante sur le CDN sans consommer de CPU serveur pour générer les pages HTML. L'expérience utilisateur est instantanée lors des transitions d'écran, et le coût d'hébergement est nul sur le réseau Edge.

### Compromis 3 : Double Stratégie de Persistance (Supabase Cloud + Fichier Local Atomique)
- **Choix Retenu** : Écriture synchrone sur base PostgreSQL managée avec réplication locale de secours sur volume persistant.
- **Raisonnement** : Ce compromis assure une résilience absolue (Zero Data Loss) : même en cas de coupure temporaire de la connexion internet municipale ou de latence externe vers Supabase, le service continue de fonctionner sans blocage pour les agents sur place.
