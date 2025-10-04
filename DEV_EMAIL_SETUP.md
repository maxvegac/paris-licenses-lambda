# Configuración de Emails en Desarrollo

## 🎯 **Redirección de Emails en Modo Desarrollo**

Para evitar enviar emails reales a clientes durante el desarrollo, puedes configurar la redirección de emails a tu dirección personal.

## ⚙️ **Configuración**

### 1. **Variables de Entorno**

Agrega estas variables a tu archivo `.env`:

```bash
# Desarrollo - Redirección de emails
DEV_EMAIL_REDIRECT=true
DEV_EMAIL=tu_email@gmail.com
```

### 2. **Variables Disponibles**

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DEV_EMAIL_REDIRECT` | Activa/desactiva la redirección | `false` |
| `DEV_EMAIL` | Email destino para redirección | `SMTP_USER` |
| `NODE_ENV` | Si es `development`, activa redirección | - |

## 🚀 **Cómo Funciona**

### **Modo Producción** (DEV_EMAIL_REDIRECT=false)
```
Cliente: cliente@example.com
Asunto: Orden 12345 - Entrega de licencia Windows 10 Pro
```

### **Modo Desarrollo** (DEV_EMAIL_REDIRECT=true)
```
Cliente: tu_email@gmail.com (redirigido)
Asunto: [DEV] Orden 12345 - Entrega de licencia Windows 10 Pro (Original: cliente@example.com)
```

## 🧪 **Probar Emails**

Para probar el envío de emails, puedes usar el endpoint de reenvío de emails existente con una orden procesada:

```bash
curl -X POST http://localhost:3000/orders/{orderNumber}/resend-email
```

## 📋 **Logs de Desarrollo**

Cuando la redirección está activa, verás logs como:
```
[DEV MODE] Redirecting email from cliente@example.com to tu_email@gmail.com for order 12345
Email sent successfully to tu_email@gmail.com for order 12345
```

## 🔧 **Configuraciones Adicionales**

### **Solo para Testing**
```bash
# Solo redirigir cuando NODE_ENV=development
NODE_ENV=development
DEV_EMAIL_REDIRECT=true
DEV_EMAIL=tu_email@gmail.com
```

### **Redirección Manual**
```bash
# Forzar redirección independientemente de NODE_ENV
DEV_EMAIL_REDIRECT=true
DEV_EMAIL=tu_email@gmail.com
```

## ⚠️ **Importante**

- **En producción**: Asegúrate de que `DEV_EMAIL_REDIRECT=false`
- **El template HTML**: Se mantiene igual, solo cambia el destinatario
- **Los logs**: Siempre muestran el email original del cliente
- **Fallback**: Si `DEV_EMAIL` no está configurado, usa `SMTP_USER`

## 🎉 **Beneficios**

✅ **No spam a clientes reales**  
✅ **Pruebas seguras del template**  
✅ **Debugging fácil**  
✅ **Desarrollo sin riesgos**  
✅ **Logs informativos**
