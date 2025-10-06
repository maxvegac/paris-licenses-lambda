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
