export interface InvoiceRecord {
  orderNumber: string;
  folio: number;
  status: number; // 0 = success, 1 = error, 2 = draft
  message?: string;
  createdAt: string;
  s3Files?: {
    pdf?: string;
    xml?: string;
    pdfCedible?: string;
    timbre?: string;
  };
  originalLinks?: {
    pdf?: string;
    xml?: string;
    pdfCedible?: string;
    timbre?: string;
  };
  ttl?: number; // For automatic cleanup
}

export interface InvoiceS3File {
  key: string;
  bucket: string;
  url: string;
  contentType: string;
  size: number;
}
