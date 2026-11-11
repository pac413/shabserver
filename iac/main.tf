terraform {
  backend "s3" {
    bucket = "shabbat-backend"
    key    = "shabbat-terraform/terraform.tfstate"
    region = "us-east-2"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 1.1.2"
}

provider "aws" {
  profile = "default"
  region  = "us-east-2"
}

locals {
  queue_names = [
    "dev",
    "staging",
    "uat",
    "production",
    "local-yehudah",
    "local-raymond",
    "local-chris",
    "local-ronald"
  ]
}
