output "lambda_function_url" {
  description = "URL of the Lambda Function"
  value       = aws_lambda_function_url.api.function_url
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "ARN of the Lambda function"
  value       = aws_lambda_function.api.arn
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for Lambda deployments"
  value       = aws_s3_bucket.lambda_bucket.bucket
}

output "invoices_bucket_name" {
  description = "Name of the S3 bucket for storing electronic invoices"
  value       = aws_s3_bucket.invoices_bucket.bucket
}

output "invoices_table_name" {
  description = "Name of the DynamoDB table for tracking invoices"
  value       = aws_dynamodb_table.invoices.name
}
