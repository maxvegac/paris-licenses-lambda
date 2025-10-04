import { Controller, Get, Post, Body, Res, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { ParisService, ParisOrder } from './paris.service';
import { LicensesService } from './licenses.service';
import { OrdersStateService } from './orders-state.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly parisService: ParisService,
    private readonly licensesService: LicensesService,
    private readonly ordersStateService: OrdersStateService,
  ) {}

  @Get()
  getDashboard(@Res() res: Response): void {
    res.sendFile('index.html', { root: 'public' });
  }

  @Get('old-dashboard')
  getOldDashboard(@Res() res: Response): void {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Paris Licenses Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header h1 { color: #333; margin-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-card h3 { color: #666; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; }
        .stat-number { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .stat-number.processed { color: #10b981; }
        .stat-number.failed { color: #ef4444; }
        .stat-number.available { color: #3b82f6; }
        .actions { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .btn { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px; margin-bottom: 10px; }
        .btn:hover { background: #2563eb; }
        .btn.success { background: #10b981; }
        .btn.success:hover { background: #059669; }
        .btn.danger { background: #ef4444; }
        .btn.danger:hover { background: #dc2626; }
        .orders-section { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .order-item { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 10px; }
        .order-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .order-number { font-weight: bold; color: #333; }
        .order-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-processed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        .order-details { color: #666; font-size: 14px; }
        .loading { text-align: center; padding: 20px; color: #666; }
        .error { background: #fee2e2; color: #991b1b; padding: 10px; border-radius: 6px; margin: 10px 0; }
        .success { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 6px; margin: 10px 0; }
        .assign-form { display: none; background: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 10px; }
        .form-group { margin-bottom: 10px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; }
        .license-manager { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .license-section { border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin-bottom: 20px; }
        .license-section h4 { color: #374151; margin-bottom: 15px; }
        .license-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 5px; background: #f9fafb; }
        .license-key { font-family: monospace; font-weight: bold; }
        .license-product { color: #6b7280; font-size: 14px; }
        .license-actions { display: flex; gap: 5px; }
        .btn-small { padding: 4px 8px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 Paris Licenses Dashboard</h1>
            <p>Gestión de licencias y órdenes</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <h3>Órdenes Procesadas</h3>
                <div class="stat-number processed" id="processed-count">-</div>
            </div>
            <div class="stat-card">
                <h3>Órdenes Fallidas</h3>
                <div class="stat-number failed" id="failed-count">-</div>
            </div>
            <div class="stat-card">
                <h3>Licencias Disponibles</h3>
                <div class="stat-number available" id="available-count">-</div>
            </div>
        </div>

        <div class="actions">
            <h3>Acciones</h3>
            <button class="btn" onclick="syncOrders()">🔄 Sincronizar Órdenes</button>
            <button class="btn success" onclick="loadFailedOrders()">📋 Ver Órdenes Fallidas</button>
            <button class="btn" onclick="loadStats()">📊 Actualizar Estadísticas</button>
            <button class="btn" onclick="showLicenseManager()">🔑 Gestionar Licencias</button>
        </div>

        <div class="license-manager" id="license-manager" style="display: none;">
            <h3>🔑 Gestión de Licencias</h3>
            
            <div class="license-section">
                <h4>Agregar Licencias Individuales</h4>
                <div class="form-group">
                    <label>Clave de Licencia:</label>
                    <input type="text" id="single-license-key" placeholder="Ej: ABCDE-12345-FGHIJ-67890-KLMNO">
                </div>
                <div class="form-group">
                    <label>Producto (opcional):</label>
                    <input type="text" id="single-license-product" placeholder="Ej: Windows 10 Pro">
                </div>
                <button class="btn success" onclick="addSingleLicense()">➕ Agregar Licencia</button>
            </div>

            <div class="license-section">
                <h4>Agregar Licencias en Masa</h4>
                <div class="form-group">
                    <label>Licencias (una por línea):</label>
                    <textarea id="bulk-licenses" rows="10" placeholder="ABCDE-12345-FGHIJ-67890-KLMNO&#10;PQRST-67890-UVWXY-12345-ZABCD&#10;EFGHI-54321-JKLMN-09876-OPQRS"></textarea>
                </div>
                <div class="form-group">
                    <label>Producto (opcional):</label>
                    <input type="text" id="bulk-license-product" placeholder="Ej: Windows 10 Pro">
                </div>
                <button class="btn success" onclick="addBulkLicenses()">📦 Agregar Licencias en Masa</button>
            </div>

            <div class="license-section">
                <h4>Licencias Disponibles</h4>
                <div id="available-licenses-list">
                    <div class="loading">Cargando licencias...</div>
                </div>
            </div>
        </div>

        <div class="orders-section">
            <h3>Órdenes Fallidas</h3>
            <div id="orders-container">
                <div class="loading">Cargando órdenes...</div>
            </div>
        </div>
    </div>

    <script>
        let stats = {};
        let failedOrders = [];

        async function loadStats() {
            try {
                const response = await fetch('/stats');
                stats = await response.json();
                
                document.getElementById('processed-count').textContent = stats.totalProcessed || 0;
                document.getElementById('failed-count').textContent = stats.totalFailed || 0;
                
                // Load license stats
                const licenseResponse = await fetch('/licenses/stats');
                const licenseStats = await licenseResponse.json();
                document.getElementById('available-count').textContent = licenseStats.totalAvailable || 0;
                
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        }

        async function loadFailedOrders() {
            try {
                const response = await fetch('/orders/failed');
                failedOrders = await response.json();
                displayFailedOrders();
            } catch (error) {
                console.error('Error loading failed orders:', error);
                document.getElementById('orders-container').innerHTML = '<div class="error">Error cargando órdenes fallidas</div>';
            }
        }

        function displayFailedOrders() {
            const container = document.getElementById('orders-container');
            
            if (failedOrders.length === 0) {
                container.innerHTML = '<div class="success">✅ No hay órdenes fallidas</div>';
                return;
            }

            container.innerHTML = failedOrders.map(order => 
                '<div class="order-item">' +
                    '<div class="order-header">' +
                        '<span class="order-number">Orden #' + order.orderNumber + '</span>' +
                        '<span class="order-status status-failed">Fallida</span>' +
                    '</div>' +
                    '<div class="order-details">' +
                        '<strong>Error:</strong> ' + order.errorMessage + '<br>' +
                        '<strong>Fecha:</strong> ' + new Date(order.processedAt).toLocaleString() +
                    '</div>' +
                    '<button class="btn success" onclick="showAssignForm(\\'' + order.orderNumber + '\\')">' +
                        '🔑 Asignar Licencia Manualmente' +
                    '</button>' +
                    '<div class="assign-form" id="form-' + order.orderNumber + '">' +
                        '<div class="form-group">' +
                            '<label>Seleccionar licencia existente:</label>' +
                            '<select id="license-' + order.orderNumber + '">' +
                                '<option value="">Cargando licencias...</option>' +
                            '</select>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>O pegar nueva licencia:</label>' +
                            '<input type="text" id="new-license-' + order.orderNumber + '" placeholder="Pega aquí la clave de licencia">' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>Producto (opcional):</label>' +
                            '<input type="text" id="product-' + order.orderNumber + '" placeholder="Ej: Windows 10 Pro">' +
                        '</div>' +
                        '<button class="btn success" onclick="assignLicense(\\'' + order.orderNumber + '\\')">' +
                            '✅ Asignar Licencia' +
                        '</button>' +
                        '<button class="btn" onclick="createAndAssignLicense(\\'' + order.orderNumber + '\\')">' +
                            '➕ Crear y Asignar' +
                        '</button>' +
                        '<button class="btn danger" onclick="hideAssignForm(\\'' + order.orderNumber + '\\')">' +
                            '❌ Cancelar' +
                        '</button>' +
                    '</div>' +
                '</div>'
            ).join('');

            // Load available licenses for each form
            failedOrders.forEach(order => {
                loadAvailableLicenses(order.orderNumber);
            });
        }

        async function loadAvailableLicenses(orderNumber) {
            try {
                const response = await fetch('/licenses/available');
                const licenses = await response.json();
                
                const select = document.getElementById('license-' + orderNumber);
                select.innerHTML = '<option value="">Seleccionar licencia...</option>';
                
                licenses.forEach(license => {
                    const option = document.createElement('option');
                    option.value = license.licenseKey;
                    option.textContent = license.licenseKey + ' (' + (license.productName || 'Sin producto') + ')';
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Error loading licenses:', error);
            }
        }

        function showAssignForm(orderNumber) {
            document.getElementById('form-' + orderNumber).style.display = 'block';
        }

        function hideAssignForm(orderNumber) {
            document.getElementById('form-' + orderNumber).style.display = 'none';
        }

        async function assignLicense(orderNumber) {
            const licenseKey = document.getElementById('license-' + orderNumber).value;
            
            if (!licenseKey) {
                alert('Por favor selecciona una licencia');
                return;
            }

            try {
                const response = await fetch('/orders/' + orderNumber + '/assign-license', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ licenseKey })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ ' + result.message);
                    hideAssignForm(orderNumber);
                    loadStats(); // Refresh stats
                    loadFailedOrders(); // Refresh the list
                } else {
                    alert('❌ ' + result.message);
                }
            } catch (error) {
                console.error('Error assigning license:', error);
                alert('Error asignando la licencia');
            }
        }

        async function syncOrders() {
            try {
                const response = await fetch('/sync');
                const result = await response.json();
                
                alert('Sincronización completada. ' + result.newOrders.length + ' nuevas órdenes procesadas.');
                loadStats();
                loadFailedOrders();
            } catch (error) {
                console.error('Error syncing orders:', error);
                alert('Error en la sincronización');
            }
        }

        // License Management Functions
        function showLicenseManager() {
            const manager = document.getElementById('license-manager');
            if (manager.style.display === 'none') {
                manager.style.display = 'block';
                loadAvailableLicensesList();
            } else {
                manager.style.display = 'none';
            }
        }

        async function addSingleLicense() {
            const licenseKey = document.getElementById('single-license-key').value.trim();
            const productName = document.getElementById('single-license-product').value.trim();

            if (!licenseKey) {
                alert('Por favor ingresa una clave de licencia');
                return;
            }

            try {
                const response = await fetch('/licenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        licenseKey, 
                        productName: productName || undefined 
                    })
                });

                if (response.ok) {
                    alert('✅ Licencia agregada exitosamente');
                    document.getElementById('single-license-key').value = '';
                    document.getElementById('single-license-product').value = '';
                    loadAvailableLicensesList();
                    loadStats();
                } else {
                    const error = await response.text();
                    alert('❌ Error: ' + error);
                }
            } catch (error) {
                console.error('Error adding license:', error);
                alert('❌ Error agregando la licencia');
            }
        }

        async function addBulkLicenses() {
            const licensesText = document.getElementById('bulk-licenses').value.trim();
            const productName = document.getElementById('bulk-license-product').value.trim();

            if (!licensesText) {
                alert('Por favor ingresa al menos una licencia');
                return;
            }

            const licenseKeys = licensesText.split('\\n')
                .map(key => key.trim())
                .filter(key => key.length > 0);

            if (licenseKeys.length === 0) {
                alert('No se encontraron licencias válidas');
                return;
            }

            try {
                const licenses = licenseKeys.map(key => ({
                    licenseKey: key,
                    productName: productName || undefined
                }));

                const response = await fetch('/licenses/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ licenses })
                });

                if (response.ok) {
                    const result = await response.json();
                    alert('✅ ' + result.count + ' licencias agregadas exitosamente');
                    document.getElementById('bulk-licenses').value = '';
                    document.getElementById('bulk-license-product').value = '';
                    loadAvailableLicensesList();
                    loadStats();
                } else {
                    const error = await response.text();
                    alert('❌ Error: ' + error);
                }
            } catch (error) {
                console.error('Error adding bulk licenses:', error);
                alert('❌ Error agregando las licencias');
            }
        }

        async function loadAvailableLicensesList() {
            try {
                const response = await fetch('/licenses/available');
                const licenses = await response.json();
                
                const container = document.getElementById('available-licenses-list');
                
                if (licenses.length === 0) {
                    container.innerHTML = '<div class="success">No hay licencias disponibles</div>';
                    return;
                }

                container.innerHTML = licenses.map(license => 
                    '<div class="license-item">' +
                        '<div>' +
                            '<div class="license-key">' + license.licenseKey + '</div>' +
                            '<div class="license-product">' + (license.productName || 'Sin producto') + '</div>' +
                        '</div>' +
                        '<div class="license-actions">' +
                            '<button class="btn btn-small danger" onclick="releaseLicense(\\'' + license.licenseKey + '\\')">' +
                                '🗑️ Liberar' +
                            '</button>' +
                        '</div>' +
                    '</div>'
                ).join('');
            } catch (error) {
                console.error('Error loading licenses:', error);
                document.getElementById('available-licenses-list').innerHTML = 
                    '<div class="error">Error cargando licencias</div>';
            }
        }

        async function releaseLicense(licenseKey) {
            if (!confirm('¿Estás seguro de que quieres liberar la licencia ' + licenseKey + '?')) {
                return;
            }

            try {
                const response = await fetch('/licenses/release', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ licenseKey })
                });

                if (response.ok) {
                    alert('✅ Licencia liberada exitosamente');
                    loadAvailableLicensesList();
                    loadStats();
                } else {
                    const error = await response.text();
                    alert('❌ Error: ' + error);
                }
            } catch (error) {
                console.error('Error releasing license:', error);
                alert('❌ Error liberando la licencia');
            }
        }

        async function createAndAssignLicense(orderNumber) {
            const licenseKey = document.getElementById('new-license-' + orderNumber).value.trim();
            const productName = document.getElementById('product-' + orderNumber).value.trim();

            if (!licenseKey) {
                alert('Por favor ingresa una clave de licencia');
                return;
            }

            try {
                // First create the license
                const createResponse = await fetch('/licenses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        licenseKey, 
                        productName: productName || undefined 
                    })
                });

                if (!createResponse.ok) {
                    const error = await createResponse.text();
                    alert('❌ Error creando la licencia: ' + error);
                    return;
                }

                // Then assign it to the order
                const assignResponse = await fetch('/orders/' + orderNumber + '/assign-license', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ licenseKey })
                });
                
                const result = await assignResponse.json();
                
                if (result.success) {
                    alert('✅ ' + result.message);
                    hideAssignForm(orderNumber);
                    loadStats();
                    loadFailedOrders();
                    loadAvailableLicensesList();
                } else {
                    alert('❌ ' + result.message);
                }
            } catch (error) {
                console.error('Error creating and assigning license:', error);
                alert('❌ Error creando y asignando la licencia');
            }
        }

        // Load data on page load
        loadStats();
        loadFailedOrders();
    </script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('orders')
  async getOrders(): Promise<ParisOrder[]> {
    return await this.parisService.getOrders();
  }

  @Get('sync')
  async syncOrders(): Promise<{
    newOrders: ParisOrder[];
    stats: {
      totalProcessed: number;
      totalFailed: number;
      lastProcessed?: string;
      failedOrders?: Array<{
        orderNumber: string;
        errorMessage: string;
        processedAt: string;
      }>;
    };
  }> {
    const newOrders = await this.parisService.getNewOrders();
    const stats = await this.parisService.getOrderStats();

    return {
      newOrders,
      stats,
    };
  }

  @Get('stats')
  async getStats(): Promise<{
    totalProcessed: number;
    totalFailed: number;
    lastProcessed?: string;
    failedOrders?: Array<{
      orderNumber: string;
      errorMessage: string;
      processedAt: string;
    }>;
  }> {
    return await this.parisService.getOrderStats();
  }

  @Get('orders/failed')
  async getFailedOrders(): Promise<
    Array<{
      orderNumber: string;
      errorMessage: string;
      processedAt: string;
    }>
  > {
    return await this.parisService.getFailedOrders();
  }

  // License Management Endpoints

  @Post('licenses')
  async addLicense(
    @Body()
    body: {
      licenseKey: string;
      productName?: string;
      expiresAt?: string;
    },
  ): Promise<{ message: string }> {
    await this.licensesService.addLicense(
      body.licenseKey,
      body.productName,
      body.expiresAt,
    );
    return { message: 'License added successfully' };
  }

  @Post('licenses/bulk')
  async addLicenses(
    @Body()
    body: {
      licenses: Array<{
        licenseKey: string;
        productName?: string;
        expiresAt?: string;
      }>;
    },
  ): Promise<{ message: string; count: number }> {
    await this.licensesService.addLicenses(body.licenses);
    return {
      message: 'Licenses added successfully',
      count: body.licenses.length,
    };
  }

  @Get('licenses/available')
  async getAvailableLicenses(
    @Body() body?: { productName?: string },
  ): Promise<any[]> {
    return await this.licensesService.getAvailableLicenses(body?.productName);
  }

  @Get('licenses/used')
  async getUsedLicenses(): Promise<any[]> {
    return await this.licensesService.getUsedLicenses();
  }

  @Get('licenses/stats')
  async getLicenseStats(): Promise<{
    totalAvailable: number;
    totalUsed: number;
    totalByProduct: {
      [productName: string]: { available: number; used: number };
    };
  }> {
    return await this.licensesService.getLicenseStats();
  }

  @Get('licenses/order/:orderNumber')
  async getLicensesByOrder(orderNumber: string): Promise<any[]> {
    return await this.licensesService.getLicensesByOrder(orderNumber);
  }

  @Post('licenses/release')
  async releaseLicense(
    @Body() body: { licenseKey: string },
  ): Promise<{ message: string }> {
    await this.licensesService.releaseLicense(body.licenseKey);
    return { message: 'License released successfully' };
  }

  @Post('orders/:orderNumber/assign-license')
  async assignLicenseToOrder(
    @Param('orderNumber') orderNumber: string,
    @Body() body: { licenseKey: string },
  ): Promise<{ message: string; success: boolean }> {
    try {
      // Get the order details first
      const orders = await this.parisService.getOrders();
      const order = orders.find((o) => o.orderNumber === orderNumber);

      if (!order) {
        return { message: 'Order not found', success: false };
      }

      // Assign the license manually (we already have the license key)
      // First, mark the license as used
      await this.licensesService.assignLicenseToOrder(
        orderNumber,
        order.customerEmail,
        order.productName,
      );

      // Mark order as processed
      const orderWithLicense = {
        ...order,
        assignedLicense: body.licenseKey,
      };

      await this.ordersStateService.markOrderAsProcessed(
        orderNumber,
        orderWithLicense,
      );

      return {
        message: `License ${body.licenseKey} assigned to order ${orderNumber}`,
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return {
        message: `Failed to assign license: ${errorMessage}`,
        success: false,
      };
    }
  }
}
