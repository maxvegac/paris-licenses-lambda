export interface License {
  licenseKey: string;
  assignedAt: string;
  status: 'available' | 'used';
  orderNumber?: string;
  assignedTo?: string; // customer email or name
  productName?: string;
  createdAt?: string;
  expiresAt?: string;
  replacementHistory?: LicenseReplacement[];
}

export interface LicenseReplacement {
  replacedAt: string;
  previousLicenseKey: string;
  reason: string;
  replacedBy: string; // admin or system
  orderNumber: string;
}
