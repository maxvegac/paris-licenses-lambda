export class BulkLicensesDto {
  licenses: Array<{
    licenseKey: string;
    productName?: string;
  }>;
}
