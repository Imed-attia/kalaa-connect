output "api_service_url" {
  description = "URL publique de l'API déployée sur Google Cloud Run"
  value       = google_cloud_run_v2_service.api_service.uri
}

output "artifact_registry_repo" {
  description = "Chemin du dépôt Artifact Registry pour pousser les images Docker"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.api_repo.repository_id}"
}
