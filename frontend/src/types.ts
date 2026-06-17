export enum ReceivableType {
  DUPLICATA = 'DUPLICATA',
  CHEQUE = 'CHEQUE',
}

export enum ReceivableStatus {
  PENDING = 'PENDING',
  LIQUIDATED = 'LIQUIDATED',
}

export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
}

export interface Receivable {
  id: string | number;
  value: number; 
  dueDate: string; 
  type: ReceivableType;
  status: ReceivableStatus;
  originalCurrency: Currency;
  paymentCurrency?: Currency;
  termDays?: number; 
  spreadApplied?: number; 
  calculatedPresentValue?: number; 
  convertedValue?: number; 
  exchangeRateUsed?: number; 
  creationDate?: string;
  liquidationDate?: string;
}

export interface ExchangeRate {
  id?: string | number;
  date: string; 
  rate: number; 
  sourceCurrency: Currency;
  targetCurrency: Currency;
  isCustom?: boolean;
}

export interface PricingStrategy {
  type: ReceivableType;
  baseMonthlyRate: number; 
  spread: number; 
}

export interface SimulationResult {
  presentValue: number;
  termDays: number;
  appliedMonthlyRate: number;
  convertedValue: number;
  exchangeRateUsed: number;
  crossCurrencyApplied: boolean;
}
