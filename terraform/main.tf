# Paris Licenses Infrastructure
# 
# Este archivo main.tf ahora actúa como un punto de entrada que organiza
# todos los recursos de infraestructura en archivos separados por funcionalidad.
#
# Estructura de archivos:
# - providers.tf: Configuración de providers y backend
# - s3.tf: Recursos de S3 (buckets para Lambda e invoices)
# - iam.tf: Roles y políticas de IAM para Lambda
# - lambda.tf: Función Lambda y su URL
# - dynamodb.tf: Tablas de DynamoDB (orders, licenses, invoices)
# - eventbridge.tf: EventBridge rules y CloudWatch logs
# - variables.tf: Variables de entrada
# - outputs.tf: Valores de salida
#
# Para aplicar cambios:
# terraform plan
# terraform apply
