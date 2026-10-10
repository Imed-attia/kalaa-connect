import http from 'k6/http';
import { check, sleep } from 'k6';

// Scénario de test de charge k6 pour Kalaa Connect (J30)
// Objectif : Valider 50 utilisateurs simultanés sans dépasser les quotas gratuits Cloud Run
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Montée en charge
    { duration: '1m', target: 50 },  // Palier 50 utilisateurs simultanés
    { duration: '30s', target: 0 },  // Descente
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent répondre en moins de 500ms
    http_req_failed: ['rate<0.01'],   // Moins de 1% d'erreurs
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';

export default function () {
  // 1. Consultation des catégories
  const resCat = http.get(`${BASE_URL}/reports/categories`);
  check(resCat, {
    'catégories status 200': (r) => r.status === 200,
  });

  // 2. Consultation de la carte publique et liste des signalements
  const resReports = http.get(`${BASE_URL}/reports?limit=20`);
  check(resReports, {
    'liste signalements status 200': (r) => r.status === 200,
    'temps de réponse < 400ms': (r) => r.timings.duration < 400,
  });

  // 3. Consultation de la page Open Data
  const resStats = http.get(`${BASE_URL}/stats`);
  check(resStats, {
    'stats status 200': (r) => r.status === 200,
  });

  sleep(1);
}
