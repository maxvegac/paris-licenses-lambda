# Infraestructura Paris Licenses

Este directorio contiene la configuración de Terraform para la infraestructura de Paris Licenses, organizada en archivos modulares para mejor mantenibilidad.

## Estructura de Archivos

### Archivos de Configuración
- **`main.tf`** - Archivo principal con documentación de la estructura
- **`providers.tf`** - Configuración de providers (AWS, Random) y backend S3
- **`variables.tf`** - Variables de entrada para la configuración
- **`outputs.tf`** - Valores de salida de la infraestructura

### Recursos por Servicio
- **`s3.tf`** - Buckets S3 para almacenamiento de código Lambda e invoices
- **`iam.tf`** - Roles y políticas IAM para la función Lambda
- **`lambda.tf`** - Función Lambda y su URL de acceso
- **`dynamodb.tf`** - Tablas DynamoDB (orders, licenses, invoices)
- **`eventbridge.tf`** - Reglas EventBridge y logs CloudWatch

## Uso

### Inicialización
```bash
terraform init
```

### Planificación
```bash
terraform plan
```

### Aplicación
```bash
terraform apply
```

### Destrucción
```bash
terraform destroy
```

## Variables Requeridas

Asegúrate de configurar las variables en `terraform.tfvars` o como variables de entorno:

- `project_name` - Nombre del proyecto
- `aws_region` - Región de AWS
- `environment` - Entorno (dev, staging, prod)
- `paris_api_email` - Email para API de Paris
- `paris_api_password` - Contraseña para API de Paris
- `smtp_user` - Usuario SMTP
- `smtp_password` - Contraseña SMTP
- `smtp_from_email` - Email remitente
- `smtp_from_name` - Nombre remitente
- `dev_email_redirect` - Email de redirección para desarrollo
- `dev_email` - Email de desarrollo
- `facto_test_mode` - Modo de prueba para Facto
- `facto_user` - Usuario Facto
- `facto_pass` - Contraseña Facto
- `lambda_timeout` - Timeout de Lambda

## Recursos Creados

### S3
- Bucket para deployments de Lambda
- Bucket para almacenamiento de invoices electrónicas

### Lambda
- Función Lambda con Node.js 22.x
- URL de función para acceso HTTP
- Variables de entorno configuradas

### DynamoDB
- Tabla `orders` - Estado de órdenes
- Tabla `licenses` - Licencias asignadas
- Tabla `invoices` - Facturas electrónicas

### EventBridge
- Regla de sincronización automática cada 2 horas
- Logs de CloudWatch con retención de 14 días

### IAM
- Rol de ejecución para Lambda
- Políticas con permisos necesarios para DynamoDB, S3 y EventBridge
