variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "paris-licenses"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 512
}

variable "paris_api_email" {
  description = "Paris API email for authentication"
  type        = string
  sensitive   = true
}

variable "paris_api_password" {
  description = "Paris API password for authentication"
  type        = string
  sensitive   = true
}

variable "smtp_user" {
  description = "SMTP user for authentication"
  type        = string
  sensitive   = true
}

variable "smtp_password" {
  description = "SMTP password for authentication"
  type        = string
  sensitive   = true
}

variable "smtp_from_email" {
  description = "Email address to use as 'from' in sent emails"
  type        = string
  sensitive   = true
}

variable "smtp_from_name" {
  description = "Name to use as 'from' in sent emails"
  type        = string
  default     = "Equipo IVI"
}

variable "dev_email_redirect" {
  description = "Enable email redirection in development mode"
  type        = string
  default     = "false"
}

variable "dev_email" {
  description = "Development email for redirected emails"
  type        = string
  default     = ""
}

variable "facto_test_mode" {
  description = "Enable Facto test mode (use demo credentials)"
  type        = string
  default     = "true"
}

variable "facto_user" {
  description = "Facto API user for production"
  type        = string
  sensitive   = true
  default     = ""
}

variable "facto_pass" {
  description = "Facto API password for production"
  type        = string
  sensitive   = true
  default     = ""
}

