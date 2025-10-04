export interface OrderState {
  orderNumber: string;
  processedAt: string;
  status: 'pending' | 'processed' | 'failed';
  orderData?: any;
  errorMessage?: string;
  licenseKey?: string; // License assigned to the order
  ttl?: number; // For automatic cleanup
}

export interface ParisOrder {
  orderNumber: string;
  returnNumber: string;
  customerName: string;
  documentNumber: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  courierDeliveryDate: string;
  promisedDeliveryDate: string;
  productName: string;
  price: string;
  customerPaymentPrice: string;
  shippingCost: string;
  commune: string;
  shippingAddress: string;
  region: string;
  marketplaceSku: string;
  sellerSku: string;
  status: string;
  document: string;
  businessName: string;
  rut: string;
  businessType: string;
  billingAddress: string;
  fulfillment: string;
  opl: string;
  assignedLicense?: string; // License key assigned to this order
}
