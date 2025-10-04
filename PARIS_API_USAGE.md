# Paris API Usage

## Configuration

1. Create a `.env` file in the project root with the following variables:

```env
# Environment Configuration
NODE_ENV=development

# AWS Configuration (for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Application Configuration
PORT=3000

# Paris API Configuration
PARIS_API_EMAIL=tu_email@ejemplo.com
PARIS_API_PASSWORD=tu_password_aqui
```

2. Replace `tu_email@ejemplo.com` and `tu_password_aqui` with your actual Paris credentials.

## Available Endpoints

### GET /orders

Gets all Paris orders in JSON format.

**URL:** `http://localhost:3000/orders`

**Method:** GET

**Response:**
```json
[
  {
    "orderNumber": "12345",
    "returnNumber": "",
    "customerName": "Juan Pérez",
    "documentNumber": "12345678-9",
    "customerEmail": "juan@ejemplo.com",
    "customerPhone": "+56912345678",
    "purchaseDate": "2025-01-15",
    "courierDeliveryDate": "2025-01-16",
    "promisedDeliveryDate": "2025-01-18",
    "productName": "Producto Ejemplo",
    "price": "10000",
    "customerPaymentPrice": "12000",
    "shippingCost": "2000",
    "commune": "Santiago",
    "shippingAddress": "Av. Principal 123",
    "region": "Metropolitana",
    "marketplaceSku": "SKU123",
    "sellerSku": "SELLER123",
    "status": "Entregado",
    "document": "Boleta",
    "businessName": "Empresa Ejemplo",
    "rut": "12345678-9",
    "businessType": "Venta al por menor",
    "billingAddress": "Av. Principal 123",
    "fulfillment": "Paris",
    "opl": "OPL123"
  }
]
```

## Column Mapping

The service automatically maps Spanish column names from the Excel to English property names:

| Spanish Column (Excel) | English Property (JSON) |
|------------------------|-------------------------|
| Nro_orden | orderNumber |
| Nro_Devolucion | returnNumber |
| Nombre_Cliente | customerName |
| Número de documento | documentNumber |
| Email_cliente | customerEmail |
| Telefono_cliente | customerPhone |
| Fecha_de_compra | purchaseDate |
| Fecha de entrega al courier | courierDeliveryDate |
| Fecha de entrega prometida al cliente | promisedDeliveryDate |
| Nombre_Producto | productName |
| Precio | price |
| Precio pago cliente | customerPaymentPrice |
| Costo_despacho | shippingCost |
| Comuna | commune |
| Dirección de envío | shippingAddress |
| Region | region |
| Sku_marketplace | marketplaceSku |
| Sku_seller | sellerSku |
| Estado | status |
| Documento | document |
| Razón social | businessName |
| Rut | rut |
| Giro | businessType |
| Dirección facturación | billingAddress |
| Fulfillment | fulfillment |
| OPL | opl |

## How it Works

1. **Automatic Authentication**: The service automatically logs into Paris API using configured credentials.

2. **Token Management**: JWT is automatically renewed when it's about to expire.

3. **Excel Processing**: Base64 Excel is automatically converted to JSON with all columns mapped to English property names.

4. **Logging**: The service logs all important operations to facilitate debugging.

## Execution

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Or run in production mode
npm run build
npm run start:prod
```

## Important Notes

- Credentials are handled securely through environment variables.
- The service automatically handles JWT token renewal.
- Query parameters are hardcoded according to the provided example, but can be modified in the code if needed.
- The service includes error handling and detailed logging.

## Deployment with GitHub Secrets

For production deployment, the application uses GitHub Secrets to securely store Paris API credentials:

1. **Configure GitHub Secrets** (see [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)):
   - `PARIS_API_EMAIL`: Your Paris API email
   - `PARIS_API_PASSWORD`: Your Paris API password

2. **Automatic Deployment**:
   - Push to `develop` branch → deploys to development environment
   - Push to `main` branch → deploys to production environment

3. **Lambda Environment Variables**:
   - Credentials are automatically injected into the Lambda function
   - No manual configuration required after initial setup

## Security

- ✅ All credentials are encrypted and stored securely
- ✅ No sensitive data in code or configuration files
- ✅ Environment variables are encrypted in transit and at rest
- ✅ GitHub Secrets are masked in all logs and outputs
