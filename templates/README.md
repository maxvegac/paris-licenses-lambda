# 📧 Email Templates

Este directorio contiene los templates HTML para los correos electrónicos del sistema.

## 📁 Estructura

```
templates/
└── email/
    └── license-delivery.html    # Template para entrega de licencias
```

## 🎨 Template de Entrega de Licencias

**Archivo:** `email/license-delivery.html`

### Variables Disponibles

El template utiliza Handlebars y acepta las siguientes variables:

- `{{orderNumber}}` - Número de orden
- `{{customerName}}` - Nombre del cliente
- `{{customerEmail}}` - Email del cliente
- `{{productName}}` - Nombre del producto
- `{{licenseKey}}` - Clave de licencia

### Características del Template

- ✅ **Responsive Design** - Se adapta a dispositivos móviles
- ✅ **Estilo Profesional** - Colores corporativos y tipografía clara
- ✅ **Información Completa** - Incluye instrucciones de activación
- ✅ **Contacto** - Información de soporte y WhatsApp
- ✅ **Fallback** - Si el template falla, usa HTML inline como respaldo

### Personalización

Para modificar el template:

1. **Edita** `templates/email/license-delivery.html`
2. **Usa variables** con sintaxis Handlebars: `{{variableName}}`
3. **Reinicia** el servidor para aplicar cambios
4. **Prueba** el envío de emails

### Ejemplo de Uso

```typescript
const emailData = {
  orderNumber: "3008753940",
  customerName: "Juan Carlos Gonzalez",
  customerEmail: "juan@example.com",
  productName: "Windows 11 Pro: Licencia Original",
  licenseKey: "NP9DX-T7QHK-VR44C-6J9MD-7T9TT"
};

await emailService.sendLicenseEmail(emailData);
```

### Fallback

Si el template no se puede cargar, el sistema automáticamente usa un HTML inline simple como respaldo, asegurando que el email siempre se envíe.

### Dependencias

- **Handlebars** - Motor de templates
- **fs** - Lectura de archivos
- **path** - Manejo de rutas

### Mantenimiento

- Los templates se cargan en tiempo de ejecución
- No requiere recompilación para cambios en templates
- Logs de errores si hay problemas con el template
