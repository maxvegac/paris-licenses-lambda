// Dashboard JavaScript Functions

let stats = {};
let failedOrders = [];
let processedOrders = [];
let currentView = 'failed'; // 'failed' or 'processed'

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadFailedOrders();
});

// Stats Functions
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
        showAlert('Error cargando estadísticas', 'danger');
    }
}

// Orders Functions
async function loadFailedOrders() {
    try {
        currentView = 'failed';
        updateOrdersSectionTitle();
        const response = await fetch('/orders/failed');
        failedOrders = await response.json();
        displayFailedOrders();
    } catch (error) {
        console.error('Error loading failed orders:', error);
        document.getElementById('orders-container').innerHTML = 
            '<div class="alert alert-danger">Error cargando órdenes fallidas</div>';
    }
}

async function loadProcessedOrders() {
    try {
        currentView = 'processed';
        updateOrdersSectionTitle();
        const response = await fetch('/orders/processed');
        processedOrders = await response.json();
        displayProcessedOrders();
    } catch (error) {
        console.error('Error loading processed orders:', error);
        document.getElementById('orders-container').innerHTML = 
            '<div class="alert alert-danger">Error cargando órdenes procesadas</div>';
    }
}

function updateOrdersSectionTitle() {
    const titleElement = document.getElementById('orders-section-title');
    if (currentView === 'failed') {
        titleElement.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Órdenes Fallidas';
    } else {
        titleElement.innerHTML = '<i class="bi bi-check-circle"></i> Órdenes Procesadas';
    }
}

function displayFailedOrders() {
    const container = document.getElementById('orders-container');
    
    if (failedOrders.length === 0) {
        container.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle"></i> No hay órdenes fallidas</div>';
        return;
    }

    container.innerHTML = failedOrders.map(order => 
        '<div class="order-item fade-in">' +
            '<div class="order-header">' +
                '<span class="order-number">Orden #' + order.orderNumber + '</span>' +
                '<span class="order-status status-failed">Fallida</span>' +
            '</div>' +
            '<div class="order-details">' +
                '<strong>Error:</strong> ' + order.errorMessage + '<br>' +
                '<strong>Fecha:</strong> ' + new Date(order.processedAt).toLocaleString() +
            '</div>' +
            '<button class="btn btn-success btn-sm" onclick="showAssignForm(\'' + order.orderNumber + '\')">' +
                '<i class="bi bi-key"></i> Asignar Licencia Manualmente' +
            '</button>' +
            '<div class="assign-form" id="form-' + order.orderNumber + '">' +
                '<div class="row">' +
                    '<div class="col-md-6">' +
                        '<div class="mb-3">' +
                            '<label class="form-label">Seleccionar licencia existente:</label>' +
                            '<select class="form-select" id="license-' + order.orderNumber + '">' +
                                '<option value="">Cargando licencias...</option>' +
                            '</select>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<div class="mb-3">' +
                            '<label class="form-label">O pegar nueva licencia:</label>' +
                            '<input type="text" class="form-control" id="new-license-' + order.orderNumber + '" placeholder="Pega aquí la clave de licencia">' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-md-6">' +
                        '<div class="mb-3">' +
                            '<label class="form-label">Producto (opcional):</label>' +
                            '<input type="text" class="form-control" id="product-' + order.orderNumber + '" placeholder="Ej: Windows 10 Pro">' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<div class="mb-3 d-flex align-items-end">' +
                            '<button class="btn btn-success me-2" onclick="assignLicense(\'' + order.orderNumber + '\')">' +
                                '<i class="bi bi-check"></i> Asignar Licencia' +
                            '</button>' +
                            '<button class="btn btn-primary me-2" onclick="createAndAssignLicense(\'' + order.orderNumber + '\')">' +
                                '<i class="bi bi-plus"></i> Crear y Asignar' +
                            '</button>' +
                            '<button class="btn btn-secondary" onclick="hideAssignForm(\'' + order.orderNumber + '\')">' +
                                '<i class="bi bi-x"></i> Cancelar' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'
    ).join('');

    // Load available licenses for each form
    failedOrders.forEach(order => {
        loadAvailableLicenses(order.orderNumber);
    });
}

function displayProcessedOrders() {
    const container = document.getElementById('orders-container');
    
    if (processedOrders.length === 0) {
        container.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> No hay órdenes procesadas</div>';
        return;
    }

    container.innerHTML = processedOrders.map(order => 
        '<div class="order-item fade-in">' +
            '<div class="order-header">' +
                '<span class="order-number">Orden #' + order.orderNumber + '</span>' +
                '<span class="order-status status-processed">Procesada</span>' +
            '</div>' +
            '<div class="order-details">' +
                '<strong>Cliente:</strong> ' + order.customerName + '<br>' +
                '<strong>Email:</strong> ' + order.customerEmail + '<br>' +
                '<strong>Producto:</strong> ' + order.productName + '<br>' +
                '<strong>Licencia:</strong> <code>' + order.licenseKey + '</code><br>' +
                '<strong>Fecha de Compra:</strong> ' + (order.purchaseDate !== 'Unknown' ? order.purchaseDate : 'No disponible') + '<br>' +
                '<strong>Fecha de Procesamiento:</strong> ' + new Date(order.processedAt).toLocaleString() +
            '</div>' +
            '<div class="order-actions">' +
                '<button class="btn btn-primary btn-sm me-2" onclick="resendOrderEmail(\'' + order.orderNumber + '\')">' +
                    '<i class="bi bi-envelope"></i> Reenviar Email' +
                '</button>' +
                '<button class="btn btn-warning btn-sm me-2" onclick="showReplaceLicenseForm(\'' + order.orderNumber + '\', \'' + order.licenseKey + '\')">' +
                    '<i class="bi bi-arrow-repeat"></i> Reemplazar Licencia' +
                '</button>' +
                '<button class="btn btn-success btn-sm" onclick="generateInvoiceForOrder(\'' + order.orderNumber + '\')">' +
                    '<i class="bi bi-receipt"></i> Generar Boleta' +
                '</button>' +
            '</div>' +
        '</div>'
    ).join('');
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
    const form = document.getElementById('form-' + orderNumber);
    form.style.display = 'block';
    form.classList.add('fade-in');
}

function hideAssignForm(orderNumber) {
    const form = document.getElementById('form-' + orderNumber);
    form.style.display = 'none';
}

async function assignLicense(orderNumber) {
    const licenseKey = document.getElementById('license-' + orderNumber).value;
    
    if (!licenseKey) {
        showAlert('Por favor selecciona una licencia', 'warning');
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
            showAlert('✅ ' + result.message, 'success');
            hideAssignForm(orderNumber);
            loadStats();
            loadFailedOrders();
        } else {
            showAlert('❌ ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error assigning license:', error);
        showAlert('Error asignando la licencia', 'danger');
    }
}

async function createAndAssignLicense(orderNumber) {
    const licenseKey = document.getElementById('new-license-' + orderNumber).value.trim();
    const productName = document.getElementById('product-' + orderNumber).value.trim();

    if (!licenseKey) {
        showAlert('Por favor ingresa una clave de licencia', 'warning');
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
            showAlert('❌ Error creando la licencia: ' + error, 'danger');
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
            showAlert('✅ ' + result.message, 'success');
            hideAssignForm(orderNumber);
            loadStats();
            loadFailedOrders();
            loadAvailableLicensesList();
        } else {
            showAlert('❌ ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error creating and assigning license:', error);
        showAlert('❌ Error creando y asignando la licencia', 'danger');
    }
}

async function syncOrders() {
    try {
        const response = await fetch('/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const result = await response.json();
        
        showAlert('Sincronización completada. ' + result.newOrders.length + ' nuevas órdenes procesadas.', 'success');
        loadStats();
        if (currentView === 'failed') {
            loadFailedOrders();
        } else {
            loadProcessedOrders();
        }
    } catch (error) {
        console.error('Error syncing orders:', error);
        showAlert('Error en la sincronización', 'danger');
    }
}

async function resendOrderEmail(orderNumber) {
    if (!confirm('¿Estás seguro de que quieres reenviar el email para la orden ' + orderNumber + '?')) {
        return;
    }

    try {
        const response = await fetch('/orders/' + orderNumber + '/resend-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            showAlert('✅ ' + result.message, 'success');
        } else {
            showAlert('❌ ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error resending email:', error);
        showAlert('Error reenviando el email', 'danger');
    }
}

function showReplaceLicenseForm(orderNumber, currentLicenseKey) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'replaceLicenseModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Reemplazar Licencia</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">Orden:</label>
                        <input type="text" class="form-control" value="${orderNumber}" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Licencia Actual:</label>
                        <input type="text" class="form-control" value="${currentLicenseKey}" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nueva Licencia:</label>
                        <input type="text" class="form-control" id="newLicenseKey" placeholder="Ingresa la nueva licencia">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Motivo del Reemplazo:</label>
                        <select class="form-select" id="replacementReason">
                            <option value="">Selecciona un motivo</option>
                            <option value="Licencia defectuosa">Licencia defectuosa</option>
                            <option value="Error en asignación">Error en asignación</option>
                            <option value="Solicitud del cliente">Solicitud del cliente</option>
                            <option value="Problema de activación">Problema de activación</option>
                            <option value="Licencia expirada">Licencia expirada</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="mb-3" id="customReasonDiv" style="display: none;">
                        <label class="form-label">Motivo Personalizado:</label>
                        <input type="text" class="form-control" id="customReason" placeholder="Describe el motivo">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-warning" onclick="replaceLicense('${orderNumber}')">Reemplazar Licencia</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Show custom reason field when "Otro" is selected
    document.getElementById('replacementReason').addEventListener('change', function() {
        const customDiv = document.getElementById('customReasonDiv');
        if (this.value === 'Otro') {
            customDiv.style.display = 'block';
        } else {
            customDiv.style.display = 'none';
        }
    });

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

async function replaceLicense(orderNumber) {
    const newLicenseKey = document.getElementById('newLicenseKey').value.trim();
    const reason = document.getElementById('replacementReason').value;
    const customReason = document.getElementById('customReason').value.trim();

    if (!newLicenseKey) {
        showAlert('❌ Por favor ingresa la nueva licencia', 'danger');
        return;
    }

    if (!reason) {
        showAlert('❌ Por favor selecciona un motivo', 'danger');
        return;
    }

    const finalReason = reason === 'Otro' ? customReason : reason;
    if (!finalReason) {
        showAlert('❌ Por favor ingresa el motivo personalizado', 'danger');
        return;
    }

    if (!confirm(`¿Estás seguro de que quieres reemplazar la licencia para la orden ${orderNumber}?\n\nNueva licencia: ${newLicenseKey}\nMotivo: ${finalReason}`)) {
        return;
    }

    try {
        const response = await fetch('/orders/' + orderNumber + '/replace-license', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                newLicenseKey: newLicenseKey,
                reason: finalReason,
                replacedBy: 'admin'
            })
        });

        const result = await response.json();

        if (result.success) {
            showAlert('✅ ' + result.message, 'success');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('replaceLicenseModal'));
            modal.hide();
            // Reload processed orders to show the new license
            loadProcessedOrders();
        } else {
            showAlert('❌ ' + result.message, 'danger');
        }
    } catch (error) {
        console.error('Error replacing license:', error);
        showAlert('Error reemplazando la licencia', 'danger');
    }
}

// License Management Functions
function toggleLicenseManager() {
    const manager = document.getElementById('license-manager');
    if (manager.style.display === 'none') {
        manager.style.display = 'block';
        manager.classList.add('fade-in');
        loadAvailableLicensesList();
    } else {
        manager.style.display = 'none';
    }
}

async function addSingleLicense() {
    const licenseKey = document.getElementById('single-license-key').value.trim();
    const productName = document.getElementById('single-license-product').value.trim();

    if (!licenseKey) {
        showAlert('Por favor ingresa una clave de licencia', 'warning');
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
            showAlert('✅ Licencia agregada exitosamente', 'success');
            document.getElementById('single-license-key').value = '';
            document.getElementById('single-license-product').value = '';
            loadAvailableLicensesList();
            loadStats();
        } else {
            const error = await response.text();
            showAlert('❌ Error: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error adding license:', error);
        showAlert('❌ Error agregando la licencia', 'danger');
    }
}

async function addBulkLicenses() {
    const licensesText = document.getElementById('bulk-licenses').value.trim();
    const productName = document.getElementById('bulk-license-product').value.trim();

    if (!licensesText) {
        showAlert('Por favor ingresa al menos una licencia', 'warning');
        return;
    }

    const licenseKeys = licensesText.split('\n')
        .map(key => key.trim())
        .filter(key => key.length > 0);

    if (licenseKeys.length === 0) {
        showAlert('No se encontraron licencias válidas', 'warning');
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
            showAlert('✅ ' + result.count + ' licencias agregadas exitosamente', 'success');
            document.getElementById('bulk-licenses').value = '';
            document.getElementById('bulk-license-product').value = '';
            loadAvailableLicensesList();
            loadStats();
        } else {
            const error = await response.text();
            showAlert('❌ Error: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error adding bulk licenses:', error);
        showAlert('❌ Error agregando las licencias', 'danger');
    }
}

async function loadAvailableLicensesList() {
    try {
        const response = await fetch('/licenses/available');
        const licenses = await response.json();
        
        const container = document.getElementById('available-licenses-list');
        
        if (licenses.length === 0) {
            container.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle"></i> No hay licencias disponibles</div>';
            return;
        }

        container.innerHTML = licenses.map(license => 
            '<div class="license-item fade-in">' +
                '<div>' +
                    '<div class="license-key">' + license.licenseKey + '</div>' +
                    '<div class="license-product">' + (license.productName || 'Sin producto') + '</div>' +
                '</div>' +
                '<div class="license-actions">' +
                    '<button class="btn btn-danger btn-sm" onclick="releaseLicense(\'' + license.licenseKey + '\')">' +
                        '<i class="bi bi-trash"></i> Liberar' +
                    '</button>' +
                '</div>' +
            '</div>'
        ).join('');
    } catch (error) {
        console.error('Error loading licenses:', error);
        document.getElementById('available-licenses-list').innerHTML = 
            '<div class="alert alert-danger">Error cargando licencias</div>';
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
            showAlert('✅ Licencia liberada exitosamente', 'success');
            loadAvailableLicensesList();
            loadStats();
        } else {
            const error = await response.text();
            showAlert('❌ Error: ' + error, 'danger');
        }
    } catch (error) {
        console.error('Error releasing license:', error);
        showAlert('❌ Error liberando la licencia', 'danger');
    }
}

// Utility Functions
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-dismissible');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + type + ' alert-dismissible fade show position-fixed';
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = 
        message + 
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Billing Functions - Updated: 2025-10-04 23:37
function toggleBillingManager() {
    const billingManager = document.getElementById('billing-manager');
    const licenseManager = document.getElementById('license-manager');
    
    if (billingManager.style.display === 'none') {
        billingManager.style.display = 'block';
        licenseManager.style.display = 'none';
    } else {
        billingManager.style.display = 'none';
    }
}

async function testBillingConnection() {
    const statusDiv = document.getElementById('billing-connection-status');
    statusDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>Probando conexión...';
    
    try {
        const response = await fetch('/billing/test-connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            statusDiv.innerHTML = '<div class="alert alert-success mb-0"><i class="bi bi-check-circle"></i> ' + result.message + '</div>';
        } else {
            statusDiv.innerHTML = '<div class="alert alert-danger mb-0"><i class="bi bi-x-circle"></i> ' + result.message + '</div>';
        }
    } catch (error) {
        console.error('Error testing billing connection:', error);
        statusDiv.innerHTML = '<div class="alert alert-danger mb-0"><i class="bi bi-x-circle"></i> Error al probar la conexión</div>';
    }
}

async function generateInvoiceForOrder(orderNumber) {
    // If orderNumber is not provided, get it from the input field
    if (!orderNumber) {
        orderNumber = document.getElementById('invoice-order-number').value.trim();
        if (!orderNumber) {
            showAlert('❌ Por favor ingresa un número de orden', 'danger');
            return;
        }
    }
    
    const statusDiv = document.getElementById('invoice-generation-status');
    if (statusDiv) {
        statusDiv.innerHTML = '<div class="spinner-border spinner-border-sm me-2" role="status"></div>Generando boleta...';
    }
    
    try {
        // First, get the order details
        const ordersResponse = await fetch('/orders');
        const orders = await ordersResponse.json();
        const order = orders.find(o => o.orderNumber === orderNumber);
        
        if (!order) {
            showAlert('❌ Orden no encontrada: ' + orderNumber, 'danger');
            if (statusDiv) statusDiv.innerHTML = '';
            return;
        }
        
        // Create invoice data according to Koywe API structure
        const totalAmount = order.totalAmount || 50000;
        // En Chile el IVA es exactamente 19%
        const netAmount = Math.round(totalAmount / 1.19);
        const taxAmount = totalAmount - netAmount;
        
        console.log(`Cálculos de impuestos para Boleta Electrónica:
        Total con IVA: ${totalAmount}
        Neto (sin IVA): ${netAmount}
        IVA (19%): ${taxAmount}
        Verificación: ${netAmount} + ${taxAmount} = ${netAmount + taxAmount}
        Estructura Koywe: net_amount=${netAmount}, taxes_amount=${taxAmount}, total_amount=${netAmount + taxAmount}`);
        
        // For Koywe, net_amount should equal the sum of total_amount_line in details
        // So we need to send net price in details, not total price
        
        const invoiceData = {
            header: {
                account_id: 423, // ID de cuenta según documentación
                document_type_id: 37, // Boleta electrónica (como string)
                received_issued_flag: 1,
                issue_date: new Date().toISOString().split('T')[0],
                issuer_tax_id_code: "76373632-6",
                issuer_tax_id_type: "CL-RUT", // Formato correcto para Chile
                issuer_legal_name: "IVI SpA",
                issuer_address: "Dirección de la empresa",
                issuer_district: "Santiago",
                issuer_city: "Santiago",
                issuer_country_id: "253", // ID de Chile según documentación
                issuer_phone: "+56 9 3456 7998",
                issuer_activity: "Venta de software",
                receiver_tax_id_code: order.customerRut || "12345678-9",
                receiver_tax_id_type: "CL-RUT", // Formato correcto para Chile
                receiver_legal_name: order.customerName || "Cliente",
                receiver_address: "",
                receiver_district: "",
                receiver_city: "",
                receiver_country_id: "253", // ID de Chile según documentación
                receiver_phone: "",
                receiver_activity: "",
                payment_conditions: "0", // Según documentación
                currency_id: 39 // ID de CLP según documentación
            },
            details: [{
                quantity: 1,
                sku: `LIC-${orderNumber}`, // SKU único para la licencia
                line_description: order.productName || "Licencia de Software",
                unit_measure: "UN",
                unit_price: netAmount, // Precio unitario sin impuestos
                long_description: `Orden: ${orderNumber} - Licencia: ${order.licenseKey || 'N/A'}`,
                modifier_amount: 0, // Sin modificadores
                total_taxes: taxAmount, // Impuestos de esta línea
                modifier_percentage: 0, // Sin modificadores porcentuales
                total_amount_line: netAmount, // Total de la línea sin impuestos
                taxes: [{
                    tax_type_id: "387", // ID del IVA según documentación
                    tax_percentage: 19, // 19% IVA
                    tax_amount: taxAmount
                }]
            }],
            totals: {
                net_amount: netAmount,
                taxes_amount: taxAmount,
                total_amount: netAmount + taxAmount // Total final = neto + impuestos
            }
        };
        
        console.log('Sending invoice data:', JSON.stringify(invoiceData, null, 2));
        
        // Send invoice creation request
        const response = await fetch('/billing/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(invoiceData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('✅ ' + result.message, 'success');
            if (statusDiv) {
                statusDiv.innerHTML = '<div class="alert alert-success mb-0"><i class="bi bi-check-circle"></i> Boleta generada exitosamente</div>';
            }
            // Clear the input field
            document.getElementById('invoice-order-number').value = '';
        } else {
            showAlert('❌ ' + result.message, 'danger');
            if (statusDiv) {
                statusDiv.innerHTML = '<div class="alert alert-danger mb-0"><i class="bi bi-x-circle"></i> Error al generar boleta</div>';
            }
        }
    } catch (error) {
        console.error('Error generating invoice:', error);
        showAlert('❌ Error al generar la boleta', 'danger');
        if (statusDiv) {
            statusDiv.innerHTML = '<div class="alert alert-danger mb-0"><i class="bi bi-x-circle"></i> Error al generar boleta</div>';
        }
    }
}
