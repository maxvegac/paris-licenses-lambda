#!/bin/bash

# Script to setup Terraform/OpenTofu S3 backend
# Usage: ./setup-backend.sh [region] [project_name]

set -e

AWS_REGION=${1:-us-east-1}
PROJECT_NAME=${2:-paris-licenses}
STATE_BUCKET_NAME="${PROJECT_NAME}-terraform-state-$(date +%s)"

echo "🚀 Setting up Terraform S3 backend"
echo "Region: $AWS_REGION"
echo "Project: $PROJECT_NAME"
echo "State bucket: $STATE_BUCKET_NAME"

# Create S3 bucket for Terraform state
echo "📦 Creating S3 bucket for Terraform state..."
aws s3 mb s3://$STATE_BUCKET_NAME --region $AWS_REGION

# Enable versioning
echo "🔄 Enabling versioning..."
aws s3api put-bucket-versioning \
  --bucket $STATE_BUCKET_NAME \
  --versioning-configuration Status=Enabled

# Enable encryption
echo "🔒 Enabling encryption..."
aws s3api put-bucket-encryption \
  --bucket $STATE_BUCKET_NAME \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "AES256"
        }
      }
    ]
  }'

# Block public access
echo "🛡️ Blocking public access..."
aws s3api put-public-access-block \
  --bucket $STATE_BUCKET_NAME \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# Create DynamoDB table for state locking
echo "🔒 Creating DynamoDB table for state locking..."
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region $AWS_REGION

# Wait for table to be created
echo "⏳ Waiting for DynamoDB table to be created..."
aws dynamodb wait table-exists --table-name terraform-state-lock --region $AWS_REGION

echo "✅ S3 backend and DynamoDB setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Initialize Terraform with the new backend:"
echo "   cd terraform"
echo "   tofu init -backend-config=\"bucket=$STATE_BUCKET_NAME\" -backend-config=\"key=$PROJECT_NAME/terraform.tfstate\" -backend-config=\"region=$AWS_REGION\" -backend-config=\"encrypt=true\" -backend-config=\"dynamodb_table=terraform-state-lock\""
echo ""
echo "2. Migrate existing state:"
echo "   tofu init -migrate-state"
echo ""
echo "3. Update your GitHub Actions workflow with these backend config values"
echo ""
echo "🔧 Backend configuration:"
echo "   bucket         = \"$STATE_BUCKET_NAME\""
echo "   key            = \"$PROJECT_NAME/terraform.tfstate\""
echo "   region         = \"$AWS_REGION\""
echo "   encrypt        = true"
echo "   dynamodb_table = \"terraform-state-lock\""
