# GitHub Secrets Configuration

This document explains how to configure GitHub Secrets for the Paris API credentials to enable secure deployment of the Lambda function.

## Required GitHub Secrets

You need to configure the following secrets in your GitHub repository:

### 1. AWS Credentials (if not already configured)
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

### 2. Paris API Credentials
- `PARIS_API_EMAIL`: Your Paris API email address
- `PARIS_API_PASSWORD`: Your Paris API password

## How to Configure GitHub Secrets

### Step 1: Navigate to Repository Settings
1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click on **Secrets and variables** → **Actions**

### Step 2: Add Repository Secrets
1. Click **New repository secret**
2. Add each secret with the following names and values:

#### AWS_ACCESS_KEY_ID
- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: Your AWS access key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)

#### AWS_SECRET_ACCESS_KEY
- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: Your AWS secret access key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)

#### PARIS_API_EMAIL
- **Name**: `PARIS_API_EMAIL`
- **Value**: Your Paris API email (e.g., `max@ivi.cl`)

#### PARIS_API_PASSWORD
- **Name**: `PARIS_API_PASSWORD`
- **Value**: Your Paris API password (e.g., `piGma13$%$%`)

### Step 3: Verify Secrets
After adding all secrets, you should see them listed in the **Repository secrets** section. The values will be masked for security.

## How It Works

### Development Environment
When you push to the `develop` branch:
1. GitHub Actions reads the secrets
2. Sets them as environment variables for Terraform
3. Terraform passes them to the Lambda function as environment variables
4. The Lambda function uses these credentials to authenticate with Paris API

### Production Environment
When you push to the `main` branch:
1. Same process as development
2. Uses the same secrets but deploys to production environment
3. Lambda function gets the credentials securely

## Security Features

- ✅ Secrets are encrypted at rest in GitHub
- ✅ Secrets are masked in logs (never visible in CI/CD output)
- ✅ Terraform variables are marked as `sensitive = true`
- ✅ Lambda environment variables are encrypted in transit and at rest
- ✅ No credentials are stored in code or configuration files

## Environment Variables in Lambda

The deployed Lambda function will have these environment variables:
- `NODE_ENV`: Set to `dev` or `prod` based on deployment
- `PARIS_API_EMAIL`: Your Paris API email from GitHub Secrets
- `PARIS_API_PASSWORD`: Your Paris API password from GitHub Secrets

## Troubleshooting

### Common Issues

1. **Missing Secrets Error**
   - Ensure all required secrets are configured in GitHub
   - Check secret names match exactly (case-sensitive)

2. **Authentication Failed**
   - Verify Paris API credentials are correct
   - Check if credentials have expired or been changed

3. **Deployment Failed**
   - Check GitHub Actions logs for specific error messages
   - Ensure AWS credentials have proper permissions

### Verification Steps

1. **Check Secrets Configuration**:
   ```bash
   # In GitHub repository settings, verify all secrets are listed
   ```

2. **Test Deployment**:
   ```bash
   # Push to develop branch to trigger deployment
   git push origin develop
   ```

3. **Verify Lambda Environment**:
   ```bash
   # Check Lambda function environment variables in AWS Console
   # Or use AWS CLI:
   aws lambda get-function-configuration --function-name paris-licenses-api
   ```

## Best Practices

- 🔒 Never commit credentials to code
- 🔄 Rotate credentials regularly
- 📝 Use different credentials for dev/prod if needed
- 🔍 Monitor Lambda logs for authentication issues
- 🚫 Don't share secrets in pull requests or issues

## Local Development

For local development, create a `.env` file (not committed to git):

```env
PARIS_API_EMAIL=your_email@example.com
PARIS_API_PASSWORD=your_password_here
```

This file is already in `.gitignore` to prevent accidental commits.
