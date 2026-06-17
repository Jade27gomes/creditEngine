import { type Receivable, ReceivableType, ReceivableStatus, Currency, type ExchangeRate, type SimulationResult } from '../types';

const API_MODE_KEY = 'srm_api_mode'; 
const API_URL_KEY = 'srm_api_url';
const BASE_RATE_KEY = 'srm_base_rate';

export class ApiService {
  
  static getApiMode(): 'offline' | 'api' { 
    return (localStorage.getItem(API_MODE_KEY) === 'api' ? 'api' : 'offline'); 
  }
  
  static setApiMode(mode: 'offline' | 'api') { 
    localStorage.setItem(API_MODE_KEY, mode); 
  }

  static getApiUrl() { 
    return localStorage.getItem(API_URL_KEY) || '';
  }

  static setApiUrl(url: string) { 
    localStorage.setItem(API_URL_KEY, url); 
  }

  static getBaseMonthlyRate(): number { 
    return parseFloat(localStorage.getItem(BASE_RATE_KEY) || '0.01'); 
  }

  static setBaseMonthlyRate(rate: number) { 
    localStorage.setItem(BASE_RATE_KEY, rate.toString()); 
  }

  static resetToDefault() { 
    localStorage.clear(); 
    window.location.reload(); 
  }

  static getExchangeRateForDate(_dateStr: string): number {
    return 5.44; 
  }

  static async getReceivables(_filters: any): Promise<{ content: Receivable[]; totalElements: number; totalPages: number }> {
    if (this.getApiMode() === 'api') {
      try {
        const res = await fetch(`${this.getApiUrl()}/api/receivables/pending`);
        const data = await res.json();
        
        const rawList = Array.isArray(data) ? data : (data.content || []);
        const mappedList = rawList.map((item: any) => ({
          ...item,
          id: item.id,
          value: item.faceValue,          
          originalCurrency: item.currencyCode,
          type: item.productName?.toUpperCase().includes('CHEQUE') ? ReceivableType.CHEQUE : ReceivableType.DUPLICATA,
          status: item.status as ReceivableStatus,
          dueDate: item.dueDate,
          calculatedPresentValue: item.faceValue
        }));

        return { content: mappedList, totalElements: mappedList.length, totalPages: 1 };
      } catch (err) {
        return { content: [], totalElements: 0, totalPages: 1 };
      }
    }
    return { content: [], totalElements: 0, totalPages: 1 };
  }

  static async createReceivable(data: any) {
    const payload = {
      assignorId: 1, 
      productId: data.type === ReceivableType.DUPLICATA ? 1 : 2, 
      faceValue: parseFloat(data.value),
      dueDate: data.dueDate,
      currencyCode: data.originalCurrency,
      termMonths: 1
    };

    const res = await fetch(`${this.getApiUrl()}/api/receivables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.errors ? err.errors.join(", ") : 'Erro no cadastro');
    }
    return res.json();
  }

  static async liquidateReceivable(receivableId: any, paymentCurrencyCode: string) {
    const res = await fetch(`${this.getApiUrl()}/api/liquidations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        receivableId: typeof receivableId === 'string' ? parseInt(receivableId) : receivableId, 
        paymentCurrencyCode 
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Erro na liquidação');
    }
    return res.json();
  }

  static async getExchangeHistory(): Promise<ExchangeRate[]> {
  try {
    const res = await fetch(`${this.getApiUrl()}/api/currencies/rates/history`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(item => ({
        ...item,
        date: item.date || (item.createdAt ? item.createdAt.split('T')[0] : '2026-06-16')
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
}
  static async syncBacenPtax(date: string) {
    const parts = date.split('-'); 
    const formattedDate = `${parts[1]}-${parts[2]}-${parts[0]}`; 

    const res = await fetch(`${this.getApiUrl()}/api/currencies/rates/sync-bacen?date=${formattedDate}`, {
      method: 'POST'
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Falha na integração com Bacen');
    }
    return res.json();
  }

  static async addExchangeRate(payload: any) {
    const res = await fetch(`${this.getApiUrl()}/api/currencies/rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  static simulateReceivableOffline(value: number, _dueDate: string, _type: any, origCur: any, payCur: any, baseRate?: number): SimulationResult {
    const rate = baseRate || 0.02;
    return {
      presentValue: value * (1 - rate),
      termDays: 30,
      appliedMonthlyRate: rate * 100,
      convertedValue: value * (1 - rate),
      exchangeRateUsed: 1,
      crossCurrencyApplied: origCur !== payCur
    };
  }
}