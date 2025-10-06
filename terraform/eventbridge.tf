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
