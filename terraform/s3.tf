# Random string for bucket suffix
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# S3 Bucket to store Lambda code
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "${var.project_name}-lambda-deployments-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_versioning" "lambda_bucket_versioning" {
  bucket = aws_s3_bucket.lambda_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
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
