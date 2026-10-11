# Guide de Déploiement en Production — Kalaa Connect

**Projet** : Kalaa Connect  
**Auteure** : Nada SLAMA (Élève-Ingénieure ESPRIT)  
**Encadrante Professionnelle** : Mme Dalila KHLIFA (Municipalité de Kalâa Seghira)  
**Année Universitaire** : 2025–2026  

---

## 1. Architecture de Déploiement Séparée Frontend / Backend

Pour respecter les meilleures pratiques Cloud sans compromettre la sécurité ni la persistance :
- **Frontend SPA (React 19 / Vite)** : Hébergé sur **Vercel Edge Network** pour une distribution Anycast mondiale sub-30ms, une mise à l'échelle automatique et la gestion sans friction du protocole HTTPS.
- **Backend API (NestJS)** : Hébergé sous forme de conteneur Docker Linux Alpine sur une plateforme gérant les processus persistants (Render, Railway, Fly.io, Google Cloud Run ou VPS dédié).
- **Base de Données** : Cluster géré **Supabase PostgreSQL** avec SSL activé et sauvegardes automatiques.

---

## 2. Déploiement Frontend sur Vercel

### Configuration (`vercel.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build --workspace=apps/web",
  "outputDirectory": "apps/web/dist",
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://api.kalaaconnect.tn/api/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Étapes de Déploiement Vercel :
1. Lier le dépôt GitHub `Imed-attia/kalaa-connect` au compte Vercel.
2. Définir le répertoire racine (Root Directory) sur le projet monorepo.
3. Renseigner les variables d'environnement dans le tableau de bord Vercel :
   - `VITE_API_URL` : URL publique du backend de production.
   - `VITE_SUPABASE_URL` : Endpoint Supabase du projet municipal.
   - `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase.

---

## 3. Déploiement Backend via Docker

### Construction de l'image de production :
```bash
docker build -t kalaa-connect-api:prod -f apps/api/Dockerfile .
```

### Lancement avec Docker Compose :
```bash
docker compose up -d --build
```

---

## 4. Matrice des Variables d'Environnement Obligatoires

| Variable | Environnement | Description & Valeur d'exemple |
| :--- | :--- | :--- |
| `NODE_ENV` | Production / Staging | Défini à `production` pour désactiver les logs verbeux et activer les optimisations. |
| `PORT` | API | Port d'écoute du serveur HTTP (défaut : `3000`). |
| `JWT_SECRET` | API | Clé cryptographique forte (au moins 256 bits d'entropie) pour signer les jetons. |
| `SUPABASE_URL` | API & Web | URL de l'instance de base de données PostgreSQL managée. |
| `SUPABASE_SERVICE_ROLE_KEY` | API (Confidentiel) | Clé administrateur pour les opérations côté serveur. |
| `CORS_ORIGIN` | API | Domaines autorisés à consommer l'API (ex: `https://kalaa-connect.vercel.app`). |
| `STORAGE_PATH` | API | Chemin du volume persistant pour la réplication locale des données (`./data`). |
