export type CurrencyCode = 'BRL' | 'USD';
export type StatusType = 'PENDING' | 'LIQUIDATED';
export type ReceivableType = 'DUPLICATA' | 'CHEQUE';

export interface ExchangeRate {
  id?: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  createdAt: string;
}

export interface Receivable {
  id: number;
  faceValue: number;
  dueDate: string;
  currencyCode: CurrencyCode;
  status: StatusType;
  assignorName: string; 
  productName: string;
}

export interface ReceivableRequest {
  assignorId: number;
  productId: number;
  currencyCode: CurrencyCode;
  faceValue: number;
  dueDate: string;
  termMonths: number;
}

export interface SimulationResult {
  faceValue: number;
  originalCurrency: string;
  paymentCurrency: string;
  presentValue: number;
  discount: number;
  exchangeRateUsed: number;
  productName: string;
  termMonths: number;
}

export interface StatementEntry {
  transactionId: number;
  date: string;
  assignorName: string;
  productName: string;
  faceValue: number;
  originalCurrency: string;
  paymentCurrency: string;
  presentValue: number;
  discount: number;
  exchangeRateUsed: number;
}

export interface StatementResponse {
  content: StatementEntry[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}