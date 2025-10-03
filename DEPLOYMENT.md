# Deployment Guide - Paris Licenses

This project is configured to automatically deploy to AWS Lambda using OpenTofu and GitHub Actions.

## Architecture

- **NestJS**: Node.js framework
- **AWS Lambda**: Serverless execution for the application
- **Lambda Function URL**: HTTP endpoint to expose the API
- **S3**: Storage for Lambda code
- **OpenTofu**: Infrastructure as code
- **GitHub Actions**: CI/CD pipeline

## Initial Setup

### 1. Configure AWS Credentials

You need to configure the following environment variables in GitHub Secrets:

- `AWS_ACCESS_KEY_ID`: Your AWS Access Key
- `AWS_SECRET_ACCESS_KEY`: Your AWS Secret Access Key

### 2. Configure OpenTofu

1. Copy the example variables file:
   ```bash
   cp terraform/terraform.tfvars.example terraform/terraform.tfvars
   ```

2. Edit `terraform/terraform.tfvars` with your values:
   ```hcl
   aws_region = "us-east-1"
   project_name = "paris-licenses"
   environment = "dev"
   ```

### 3. Local Deployment

#### Prerequisites

1. **Install OpenTofu**:
   ```bash
   # Arch Linux (CachyOS)
   sudo pacman -S opentofu
   
   # Or download from GitHub
   wget https://github.com/opentofu/opentofu/releases/download/v1.6.0/tofu_1.6.0_linux_amd64.zip
   unzip tofu_1.6.0_linux_amd64.zip
   sudo mv tofu /usr/local/bin/
   ```

2. **Configure AWS Credentials**:
   ```bash
   aws configure
   # Or set environment variables:
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"
   export AWS_DEFAULT_REGION="us-east-1"
   ```

#### Quick Deployment

Use the provided script for easy deployment:

```bash
# Make script executable
chmod +x deploy-local.sh

# Deploy to dev environment
./deploy-local.sh dev paris-licenses

# Deploy to prod environment
./deploy-local.sh prod paris-licenses
```

#### Manual Deployment

If you prefer to deploy manually:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Create Lambda package
cd dist
zip -r ../lambda.zip . ../node_modules ../package.json
cd ..

# Configure OpenTofu
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
# Edit terraform/terraform.tfvars with your values

# Deploy infrastructure
cd terraform
tofu init
tofu plan -var="environment=dev" -var="project_name=paris-licenses"
tofu apply -var="environment=dev" -var="project_name=paris-licenses"

# Upload Lambda code
BUCKET_NAME=$(tofu output -raw s3_bucket_name)
FUNCTION_NAME=$(tofu output -raw lambda_function_name)
aws s3 cp ../lambda.zip s3://$BUCKET_NAME/lambda.zip
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --s3-bucket $BUCKET_NAME \
  --s3-key lambda.zip

# Get API URL
tofu output lambda_function_url
```

## CI/CD Flow

### Branches and Environments

- **`develop`**: Automatically deploys to DEV
- **`main`**: Automatically deploys to PROD

### GitHub Actions Pipeline

1. **Test**: Runs linter, tests and build
2. **Deploy DEV** (only on `develop`):
   - Builds the application
   - Creates Lambda package
   - Applies OpenTofu for DEV environment
   - Updates Lambda function
3. **Deploy PROD** (only on `main`):
   - Builds the application
   - Creates Lambda package
   - Applies OpenTofu for PROD environment
   - Updates Lambda function
   - Creates a GitHub release

## File Structure

```
├── src/
│   ├── lambda.ts          # Main handler for Lambda
│   ├── main.ts            # Traditional entry point
│   └── ...
├── terraform/
│   ├── main.tf            # Main resources
│   ├── variables.tf       # OpenTofu variables
│   ├── outputs.tf         # OpenTofu outputs
│   └── terraform.tfvars.example
├── .github/workflows/
│   └── deploy.yml         # CI/CD pipeline
└── package.json           # Dependencies and scripts
```

## API URLs

After deployment, the API will be available at:

- **DEV**: Lambda Function URL (output from OpenTofu)
- **PROD**: Lambda Function URL (output from OpenTofu)

## Monitoring

- **CloudWatch Logs**: `/aws/lambda/paris-licenses-api`
- **Lambda Function URL**: Metrics available in AWS Console

## Troubleshooting

### Permission errors
Make sure your AWS credentials have the necessary permissions:
- Lambda: CreateFunction, UpdateFunctionCode, InvokeFunction
- S3: CreateBucket, PutObject, GetObject
- IAM: CreateRole, AttachRolePolicy

### Timeout errors
If the Lambda times out, adjust the value in `terraform/variables.tf`:
```hcl
lambda_timeout = 60  # seconds
```

### Memory errors
If the Lambda runs out of memory, adjust the value in `terraform/variables.tf`:
```hcl
lambda_memory_size = 1024  # MB
```

## Local Development

For local development, you can use the traditional server:

```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`
