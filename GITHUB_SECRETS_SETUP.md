# 🔐 Configuración de GitHub Secrets

Este documento explica cómo configurar los secrets de GitHub Actions necesarios para el despliegue automático de la aplicación.

## 📋 **Secrets Requeridos**

Para que el CI/CD funcione correctamente, debes configurar los siguientes secrets en tu repositorio de GitHub:

### **AWS Credentials**
- `AWS_ACCESS_KEY_ID` - ID de clave de acceso de AWS
- `AWS_SECRET_ACCESS_KEY` - Clave secreta de AWS

### **Paris API Credentials**
- `PARIS_API_EMAIL` - Email para autenticación en la API de Paris
- `PARIS_API_PASSWORD` - Contraseña para autenticación en la API de Paris

### **SMTP Configuration (Gmail)**
- `SMTP_USER` - Email de Gmail para autenticación SMTP
- `SMTP_PASSWORD` - Contraseña de aplicación de Gmail
- `SMTP_FROM_EMAIL` - Email que aparecerá como remitente (puede ser diferente al SMTP_USER)
- `SMTP_FROM_NAME` - Nombre que aparecerá como remitente (ej: "Equipo IVI")

### **Development Email Settings**
- `DEV_EMAIL_REDIRECT` - `"true"` o `"false"` para redireccionar emails en desarrollo
- `DEV_EMAIL` - Email para recibir emails redirigidos en desarrollo

## 🚀 **Cómo Configurar los Secrets**

1. **Ve a tu repositorio en GitHub**
2. **Navega a Settings → Secrets and variables → Actions**
3. **Haz clic en "New repository secret"**
4. **Agrega cada secret con su valor correspondiente**

## 📝 **Ejemplo de Configuración**

```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=wJalrXUtn...
PARIS_API_EMAIL=tu_email@example.com
PARIS_API_PASSWORD=tu_password_paris
SMTP_USER=tu_gmail@gmail.com
SMTP_PASSWORD=tu_app_password_gmail
SMTP_FROM_EMAIL=noreply@tudominio.com
SMTP_FROM_NAME=Equipo IVI
DEV_EMAIL_REDIRECT=false
DEV_EMAIL=tu_email_desarrollo@gmail.com
```

## 📧 **Configuración de Email**

### **Diferencia entre SMTP_USER y SMTP_FROM_EMAIL**

- **`SMTP_USER`**: Email usado para **autenticarse** con el servidor SMTP (debe ser el email de Gmail)
- **`SMTP_FROM_EMAIL`**: Email que aparecerá como **remitente** en los emails enviados (puede ser diferente)

**Ejemplo práctico:**
```
SMTP_USER=mi_gmail@gmail.com          # Para autenticarse con Gmail
SMTP_FROM_EMAIL=noreply@mydomain.com  # Aparece como remitente
SMTP_FROM_NAME=Equipo IVI             # Nombre del remitente
```

**Resultado:** Los emails se envían desde `"Equipo IVI" <noreply@mydomain.com>` pero se autentican con `mi_gmail@gmail.com`.

## ⚠️ **Consideraciones de Seguridad**

- **Nunca** commits estos valores en el código
- **Usa contraseñas de aplicación** para Gmail (no tu contraseña principal)
- **Rota las credenciales** periódicamente
- **Usa diferentes valores** para desarrollo y producción

## 🔄 **Variables por Entorno**

### **Desarrollo (develop branch)**
- `DEV_EMAIL_REDIRECT=true` (recomendado)
- `DEV_EMAIL=tu_email_desarrollo@gmail.com`

### **Producción (main branch)**
- `DEV_EMAIL_REDIRECT=false`
- `DEV_EMAIL=""` (vacío)

## 🧪 **Verificación**

Una vez configurados los secrets, el CI/CD debería:

1. ✅ **Pasar los tests** en el job `test`
2. ✅ **Desplegar correctamente** en desarrollo (branch `develop`)
3. ✅ **Desplegar correctamente** en producción (branch `main`)
4. ✅ **Inyectar todas las variables** en la función Lambda

## 📊 **Monitoreo**

Puedes verificar que las variables se están inyectando correctamente:

1. **Ve a AWS Console → Lambda**
2. **Selecciona tu función Lambda**
3. **Ve a Configuration → Environment variables**
4. **Verifica que todas las variables estén presentes**

---

**Nota**: Si algún secret no está configurado, el despliegue fallará con un error de variable no encontrada.
