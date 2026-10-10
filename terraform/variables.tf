variable "project_id" {
  description = "ID du projet Google Cloud (ex: kalaa-connect-prod)"
  type        = string
  default     = "kalaa-connect-stage"
}

variable "region" {
  description = "Région GCP de déploiement (sélectionnée pour faible latence et palier gratuit)"
  type        = string
  default     = "europe-west1" # Belgique
}

variable "image_tag" {
  description = "Tag de l'image Docker à déployer"
  type        = string
  default     = "latest"
}

variable "max_instances" {
  description = "Nombre maximal d'instances Cloud Run pour garantir un budget de 0 TND"
  type        = number
  default     = 2
}
