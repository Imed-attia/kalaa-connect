# Runbook d'Exploitation & Maintenance Opérationnelle — Kalaa Connect

**Projet** : Kalaa Connect  
**Auteure** : Nada SLAMA (Élève-Ingénieure ESPRIT)  
**Encadrante Professionnelle** : Mme Dalila KHLIFA (Municipalité de Kalâa Seghira)  
**Année Universitaire** : 2025–2026  

---

## 1. Procédures Quotidiennes et Contrôles de Routine

Les administrateurs système et l'équipe technique de la municipalité de Kalâa Seghira doivent effectuer les vérifications suivantes :

1. **Vérification de la santé globale de l'API** :
   ```bash
   curl -f http://localhost:3000/api/health/ready
   ```
2. **Consultation des métriques Prometheus** :
   Consulter `http://localhost:9090` ou le tableau de bord Grafana `http://localhost:3001` pour s'assurer que le taux d'erreur 5xx est nul et que l'empreinte mémoire RSS est inférieure à 300 Mo.
3. **Vérification de l'intégrité du stockage persistant** :
   Vérifier la présence et la taille du fichier `apps/api/data/kalaa_database.json`.

---

## 2. Procédure d'Intervention en Cas d'Incident (Incident Response)

### Scénario A : Alerte d'indisponibilité (Sonde Readiness en échec - 503)
1. **Consulter les journaux d'erreurs en temps réel** :
   ```bash
   docker logs --tail 100 -f kalaa-connect-api
   ```
2. **Tester la connectivité réseau avec Supabase** :
   ```bash
   curl -I https://<supabase-id>.supabase.co
   ```
3. **Redémarrage gracieux du conteneur en cas de blocage** :
   ```bash
   docker restart kalaa-connect-api
   ```

### Scénario B : Corruption ou Perte de Données
1. **Arrêter immédiatement le service API** :
   ```bash
   docker stop kalaa-connect-api
   ```
2. **Restaurer la dernière sauvegarde saine** :
   Copier le fichier de sauvegarde le plus récent depuis le répertoire de backup :
   ```bash
   cp apps/api/data/backups/kalaa_database_YYYYMMDD.json apps/api/data/kalaa_database.json
   ```
3. **Redémarrer le service et valider les sondes** :
   ```bash
   docker start kalaa-connect-api
   curl http://localhost:3000/api/health/ready
   ```

---

## 3. Gestion des Versions et Rollback Immédiat

En cas de régression constatée suite à un déploiement continu :
1. **Rollback Vercel (Frontend)** :
   Sélectionner le déploiement précédent dans le tableau de bord Vercel et cliquer sur **"Instant Rollback"** (changement effectif en moins de 10 secondes au niveau CDN).
2. **Rollback Docker (Backend)** :
   Redéployer le conteneur avec le tag de commit Git stable précédent :
   ```bash
   git checkout HEAD~1
   docker compose up -d --build api
   ```
