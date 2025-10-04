#!/bin/bash

# Script to deploy with OpenTofu (works locally and in CI/CD)
# Usage: ./deploy.sh [environment] [project_name] [--ci]

set -e

# Default values
ENVIRONMENT=${1:-dev}
PROJECT_NAME=${2:-paris-licenses}
CI_MODE=${3:-false}
AWS_REGION=${AWS_DEFAULT_REGION:-us-east-1}

echo "🚀 Starting deployment with OpenTofu"
echo "Environment: $ENVIRONMENT"
echo "Project: $PROJECT_NAME"
echo "Region: $AWS_REGION"

# Check if OpenTofu is installed
if ! command -v tofu &> /dev/null; then
    echo "❌ OpenTofu is not installed. Please install it first:"
    echo "   sudo pacman -S opentofu"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please configure your credentials:"
    echo "   aws configure"
    exit 1
fi

echo "✅ Pre-flight checks completed"

# Build the application
echo "📦 Building application..."
npm install
npm run build

# Create optimized Lambda package
echo "📦 Creating optimized Lambda package..."
rm -rf lambda-build lambda.zip
mkdir -p lambda-build

# Copy compiled application
cp -r dist/* lambda-build/
cp package.json lambda-build/

# Copy static files (public directory)
if [ -d "public" ]; then
    echo "📁 Copying static files from public/..."
    cp -r public lambda-build/
else
    echo "⚠️  Warning: public/ directory not found"
fi

# Install only production dependencies
echo "📦 Installing production dependencies..."
cd lambda-build
npm install --production --no-optional --silent || { echo "Error: npm install failed"; exit 1; }

# Create Lambda package (excluding unnecessary files)
echo "📦 Creating Lambda package..."
zip -r ../lambda.zip . -x "*.map" "*.tsbuildinfo" "node_modules/.cache/*" >/dev/null || { echo "Error: zip command failed"; exit 1; }
cd ..

# Show package size
echo "📊 Lambda package size: $(ls -lh lambda.zip | awk '{print $5}')"

# Go to terraform directory
cd terraform

# Check if variables file exists
if [ ! -f "terraform.tfvars" ]; then
    echo "📝 Creating variables file..."
    if [[ "$CI_MODE" == "--ci" ]]; then
        # In CI mode, create terraform.tfvars with environment variables
        cat > terraform.tfvars << EOF
# AWS Configuration
aws_region = "$AWS_REGION"

# Project Configuration
project_name = "$PROJECT_NAME"
environment  = "$ENVIRONMENT"

# Lambda Configuration
lambda_timeout     = 30
lambda_memory_size = 512
EOF
    else
        # In local mode, copy example and ask user to edit
        cp terraform.tfvars.example terraform.tfvars
        echo "⚠️  Please edit terraform/terraform.tfvars with your values before continuing"
        exit 1
    fi
fi

# Initialize OpenTofu
echo "🔧 Initializing OpenTofu..."
echo "🔍 Debug: TF_BACKEND_BUCKET = $TF_BACKEND_BUCKET"
echo "🔍 Debug: CI_MODE = $CI_MODE"

if [[ -n "$TF_BACKEND_BUCKET" && "$CI_MODE" == "--ci" ]]; then
    echo "🌐 Using remote backend configuration..."
    echo "📦 Bucket: $TF_BACKEND_BUCKET"
    echo "🔑 Key: $TF_BACKEND_KEY"
    echo "🌍 Region: $TF_BACKEND_REGION"
    echo "🔒 DynamoDB: $TF_BACKEND_DYNAMODB_TABLE"
    
    tofu init \
      -backend-config="bucket=$TF_BACKEND_BUCKET" \
      -backend-config="key=$TF_BACKEND_KEY" \
      -backend-config="region=$TF_BACKEND_REGION" \
      -backend-config="encrypt=true" \
      -backend-config="dynamodb_table=$TF_BACKEND_DYNAMODB_TABLE"
else
    echo "💻 Using local backend..."
    tofu init
fi

# Plan the deployment
echo "📋 Planning deployment..."
tofu plan

# Ask for confirmation (skip in CI mode)
if [[ "$CI_MODE" != "--ci" ]]; then
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
else
    echo "🤖 CI mode: Skipping confirmation"
fi

# Apply infrastructure
echo "🚀 Applying infrastructure..."
tofu apply -auto-approve

# Get infrastructure information
BUCKET_NAME=$(tofu output -raw s3_bucket_name)
FUNCTION_NAME=$(tofu output -raw lambda_function_name)
FUNCTION_URL=$(tofu output -raw lambda_function_url)

echo "📤 Uploading Lambda code..."
aws s3 cp ../lambda.zip s3://$BUCKET_NAME/lambda.zip --region $AWS_REGION

echo "🔄 Updating Lambda function..."
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --s3-bucket $BUCKET_NAME \
  --s3-key lambda.zip \
  --region $AWS_REGION

echo "✅ Deployment completed!"
echo "🌐 API URL: $FUNCTION_URL"
echo "📊 Lambda Function: $FUNCTION_NAME"
echo "🪣 S3 Bucket: $BUCKET_NAME"
