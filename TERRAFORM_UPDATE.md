# Actualización de Terraform - Variables de Email

## 🚨 **Problema Identificado**

Las nuevas variables de entorno para el sistema de emails **NO** estaban siendo publicadas por Terraform.

## ✅ **Solución Implementada**

### **1. Variables Agregadas a `variables.tf`:**

```hcl
variable "smtp_user" {
  description = "SMTP user for sending emails"
  type        = string
  sensitive   = true
}

variable "smtp_password" {
  description = "SMTP password for sending emails"
  type        = string
  sensitive   = true
}

variable "dev_email_redirect" {
  description = "Enable email redirection in development mode"
  type        = string
  default     = "false"
}

variable "dev_email" {
  description = "Development email for redirected emails"
  type        = string
  default     = ""
}
```

### **2. Variables de Entorno de Lambda Actualizadas:**

```hcl
environment {
  variables = {
    NODE_ENV            = var.environment
    PARIS_API_EMAIL     = var.paris_api_email
    PARIS_API_PASSWORD  = var.paris_api_password
    ORDERS_TABLE_NAME   = aws_dynamodb_table.orders.name
    LICENSES_TABLE_NAME = aws_dynamodb_table.licenses.name
    SMTP_USER           = var.smtp_user
    SMTP_PASSWORD       = var.smtp_password
    DEV_EMAIL_REDIRECT  = var.dev_email_redirect
    DEV_EMAIL           = var.dev_email
  }
}
```

### **3. Archivo de Ejemplo Actualizado:**

`terraform.tfvars.example` ahora incluye todas las variables necesarias.

## 🚀 **Cómo Aplicar los Cambios**

### **1. Actualizar tu archivo `terraform.tfvars`:**

```hcl
# SMTP Configuration (Gmail)
smtp_user     = "tu_gmail@gmail.com"
smtp_password = "tu_app_password_aqui"

# Development Email Settings
dev_email_redirect = "false"  # Cambiar a "true" para desarrollo
dev_email          = "tu_email_desarrollo@gmail.com"
```

### **2. Ejecutar Terraform:**

```bash
# Planificar cambios
terraform plan

# Aplicar cambios
terraform apply
```

### **3. Verificar Variables:**

```bash
# Verificar que las variables estén configuradas
aws lambda get-function-configuration \
  --function-name paris-licenses-api \
  --query 'Environment.Variables'
```

## 📊 **Estado de la Tabla de Licencias**

### **✅ La tabla SÍ soporta `replacementHistory`:**

- **Estructura:** DynamoDB puede almacenar cualquier JSON
- **Índices:** Configurados con `projection_type = "ALL"`
- **Compatibilidad:** No requiere cambios en el esquema

### **Estructura de la Tabla:**
```json
{
  "licenseKey": "LICENCIA-12345",
  "assignedAt": "2025-01-04T10:30:00Z",
  "status": "used",
  "orderNumber": "12345",
  "replacementHistory": [
    {
      "replacedAt": "2025-01-04T10:30:00Z",
      "previousLicenseKey": "LICENCIA-ANTERIOR",
      "reason": "Licencia defectuosa",
      "replacedBy": "admin",
      "orderNumber": "12345"
    }
  ]
}
```

## ⚠️ **Importante**

### **Variables Sensibles:**
- `smtp_user` y `smtp_password` están marcadas como `sensitive = true`
- No se mostrarán en los logs de Terraform
- Se almacenan de forma segura en AWS Lambda

### **Desarrollo vs Producción:**
- **Desarrollo:** `dev_email_redirect = "true"`
- **Producción:** `dev_email_redirect = "false"`

## 🎉 **Resultado**

Después de aplicar estos cambios:

✅ **Todas las variables de email** estarán disponibles en Lambda  
✅ **Sistema de reemplazo de licencias** funcionará correctamente  
✅ **Historial de reemplazos** se guardará en la base de datos  
✅ **Emails de desarrollo** se redirigirán correctamente  

¡El sistema está completamente configurado para producción! 🚀
