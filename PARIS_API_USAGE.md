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

### GET /sync

Synchronizes new orders from the Paris API. This endpoint:
- Fetches all orders from Paris API
- Filters out already processed orders
- Marks new orders as processed in DynamoDB
- Returns only new orders and processing statistics

**URL:** `http://localhost:3000/sync`

**Method:** GET

**Response:**
```json
{
  "newOrders": [
    {
      "orderNumber": "67890",
      "customerName": "Jane Smith",
      "customerEmail": "jane@example.com",
      "purchaseDate": "2025-01-15",
      "productName": "New Product",
      "price": "15000",
      "status": "Processing"
    }
  ],
  "stats": {
    "totalProcessed": 150,
    "totalFailed": 3,
    "lastProcessed": "2025-01-15T10:30:00Z"
  }
}
```

### GET /stats

Returns processing statistics for orders.

**URL:** `http://localhost:3000/stats`

**Method:** GET

**Response:**
```json
{
  "totalProcessed": 150,
  "totalFailed": 3,
  "lastProcessed": "2025-01-15T10:30:00Z"
}
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

4. **Automatic Sync**: CloudWatch Events triggers automatic synchronization every 15 minutes to fetch new orders and assign licenses.

5. **License Assignment**: New orders automatically receive available licenses from the pool.

6. **Logging**: The service logs all important operations to facilitate debugging.

## Automatic Synchronization

The system includes automatic synchronization via AWS EventBridge:

- **Schedule**: Runs every 15 minutes automatically
- **Process**: 
  1. Fetches new orders from Paris API
  2. Assigns available licenses to new orders
  3. Marks orders as processed in DynamoDB
  4. Logs results to CloudWatch
- **Monitoring**: Check CloudWatch logs for sync results and any errors

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
