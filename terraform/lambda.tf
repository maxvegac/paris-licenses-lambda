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
