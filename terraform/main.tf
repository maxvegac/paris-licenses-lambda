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

# S3 Bucket to store Lambda code
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "${var.project_name}-lambda-deployments-${random_string.bucket_suffix.result}"
}

# S3 Bucket to store electronic invoices (boletas)
resource "aws_s3_bucket" "invoices_bucket" {
  bucket = "${var.project_name}-invoices-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_versioning" "invoices_bucket_versioning" {
  bucket = aws_s3_bucket.invoices_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "invoices_bucket_pab" {
  bucket = aws_s3_bucket.invoices_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_versioning" "lambda_bucket_versioning" {
  bucket = aws_s3_bucket.lambda_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  lifecycle {
    ignore_changes = [name]
  }
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.orders.arn,
          "${aws_dynamodb_table.orders.arn}/index/*",
          aws_dynamodb_table.licenses.arn,
          "${aws_dynamodb_table.licenses.arn}/index/*",
          aws_dynamodb_table.invoices.arn,
          "${aws_dynamodb_table.invoices.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.invoices_bucket.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.invoices_bucket.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "events:PutEvents",
          "events:DescribeRule",
          "events:ListRules"
        ]
        Resource = "*"
      }
    ]
  })
}

# Lambda Function
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api"
  s3_bucket     = aws_s3_bucket.lambda_bucket.id
  s3_key        = aws_s3_object.lambda_code.key
  runtime       = "nodejs22.x"
  handler       = "dist/lambda.handler"
  role          = aws_iam_role.lambda_role.arn
  timeout       = var.lambda_timeout
  memory_size   = 256  # Optimized for low volume usage

  environment {
    variables = {
      NODE_ENV            = var.environment
      PARIS_API_EMAIL     = var.paris_api_email
      PARIS_API_PASSWORD  = var.paris_api_password
      ORDERS_TABLE_NAME   = aws_dynamodb_table.orders.name
      LICENSES_TABLE_NAME = aws_dynamodb_table.licenses.name
      INVOICES_TABLE_NAME = aws_dynamodb_table.invoices.name
      INVOICES_BUCKET     = aws_s3_bucket.invoices_bucket.id
      SMTP_USER           = var.smtp_user
      SMTP_PASSWORD       = var.smtp_password
      SMTP_FROM_EMAIL     = var.smtp_from_email
      SMTP_FROM_NAME      = var.smtp_from_name
      DEV_EMAIL_REDIRECT  = var.dev_email_redirect
      DEV_EMAIL           = var.dev_email
      FACTO_TEST_MODE     = var.facto_test_mode
      FACTO_USER          = var.facto_user
      FACTO_PASS          = var.facto_pass
    }
  }

  depends_on = [
    aws_iam_role_policy.lambda_policy,
    aws_cloudwatch_log_group.lambda_logs
  ]
}

# EventBridge Rule for automatic sync
resource "aws_cloudwatch_event_rule" "sync_schedule" {
  name                = "${var.project_name}-sync-schedule"
  description         = "Trigger automatic sync of Paris orders"
  schedule_expression = "rate(2 hours)" # Run every 2 hours (optimized for free tier)

  tags = {
    Name        = "${var.project_name}-sync-schedule"
    Environment = var.environment
  }
}

# EventBridge Target to invoke Lambda
resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.sync_schedule.name
  target_id = "SyncLambdaTarget"
  arn       = aws_lambda_function.api.arn
}

# Lambda permission for EventBridge
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.sync_schedule.arn
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-api"
  retention_in_days = 14

  lifecycle {
    ignore_changes = [name]
  }
}

# Lambda Function URL
resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = false
    allow_origins     = ["*"]
    allow_methods     = ["*"]
    allow_headers     = ["date", "keep-alive"]
    expose_headers    = ["date", "keep-alive"]
    max_age          = 86400
  }
}

# DynamoDB Table for Orders State
resource "aws_dynamodb_table" "orders" {
  name           = "${var.project_name}-orders"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orderNumber"

  attribute {
    name = "orderNumber"
    type = "S"
  }

  attribute {
    name = "processedAt"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  # Global Secondary Index for querying by status
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "processedAt"
    projection_type = "ALL"
  }

  # TTL for automatic cleanup of old records (optional)
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "${var.project_name}-orders"
    Environment = var.environment
  }
}

# DynamoDB Table for Licenses
resource "aws_dynamodb_table" "licenses" {
  name           = "${var.project_name}-licenses"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "licenseKey"
  range_key      = "assignedAt"

  attribute {
    name = "licenseKey"
    type = "S"
  }

  attribute {
    name = "assignedAt"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "orderNumber"
    type = "S"
  }

  # Global Secondary Index for querying by status
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "assignedAt"
    projection_type = "ALL"
  }

  # Global Secondary Index for querying by order number
  global_secondary_index {
    name            = "OrderIndex"
    hash_key        = "orderNumber"
    range_key       = "assignedAt"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.project_name}-licenses"
    Environment = var.environment
  }
}

# DynamoDB Table for Invoices (Boletas)
resource "aws_dynamodb_table" "invoices" {
  name           = "${var.project_name}-invoices"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "orderNumber"
  range_key      = "folio"

  attribute {
    name = "orderNumber"
    type = "S"
  }

  attribute {
    name = "folio"
    type = "N"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  # Global Secondary Index for querying by status
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  # TTL for automatic cleanup of old records (optional)
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Name        = "${var.project_name}-invoices"
    Environment = var.environment
  }
}

# S3 Object for Lambda code (will be uploaded by deploy script)
resource "aws_s3_object" "lambda_code" {
  bucket = aws_s3_bucket.lambda_bucket.id
  key    = "lambda.zip"
  source = "../lambda.zip"
  etag   = filemd5("../lambda.zip")
  
  # This resource will be created/updated by the deploy script
  lifecycle {
    ignore_changes = [source, etag]
  }
}
