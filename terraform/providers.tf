terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
  
  backend "s3" {
    # This will be configured via terraform init -backend-config
    # bucket  = "your-terraform-state-bucket"
    # key     = "paris-licenses/terraform.tfstate"
    # region  = "us-east-1"
    # encrypt = true
    # dynamodb_table = "terraform-state-lock"
  }
}

provider "aws" {
  region = var.aws_region
}
