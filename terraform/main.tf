# ==============================================================
# Kalaa Connect — Infrastructure as Code (Terraform)
# Cible : Google Cloud Run, Artifact Registry, Secret Manager, IAM
# Objectif de coût : 0 TND (Paliers gratuits respectés)
# ==============================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.25.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Registre d'images conteneurs (Artifact Registry)
resource "google_artifact_registry_repository" "api_repo" {
  location      = var.region
  repository_id = "kalaa-connect-registry"
  description   = "Dépôt d'images Docker pour l'API Kalaa Connect"
  format        = "DOCKER"
}

# 2. Compte de service dédié au moindre privilège (Principe de sécurité)
resource "google_service_account" "cloud_run_sa" {
  account_id   = "kalaa-api-runner"
  display_name = "Compte de service Cloud Run API Kalaa Connect"
}

# 3. Secret Manager pour les variables sensibles
resource "google_secret_manager_secret" "supabase_key" {
  secret_id = "supabase-service-key"
  replication {
    auto {}
  }
}

# Autorisation minimale : lecture du secret par le compte de service
resource "google_secret_manager_secret_iam_member" "secret_access" {
  secret_id = google_secret_manager_secret.supabase_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloud_run_sa.email}"
}

# 4. Service Google Cloud Run pour l'API NestJS
resource "google_cloud_run_v2_service" "api_service" {
  name     = "kalaa-connect-api"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = 0 # 0 instance à froid (0 TND quand inactive)
      max_instance_count = var.max_instances # Plafond strict pour éviter tout surcoût
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.api_repo.repository_id}/kalaa-api:${var.image_tag}"

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PORT"
        value = "8080"
      }
    }
  }
}

# 5. Règle d'accès public pour l'API
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  name     = google_cloud_run_v2_service.api_service.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
