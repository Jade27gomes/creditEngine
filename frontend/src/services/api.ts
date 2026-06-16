import axios from 'axios';
import type { 
  Receivable, 
  ReceivableRequest, 
  SimulationResult, 
  ExchangeRate, 
  StatementResponse 
} from '../types';

const http = axios.create({ baseURL: '/api' });

export const api = {
  async getPendingReceivables(): Promise<Receivable[]> {
    const res = await http.get<Receivable[]>('/receivables/pending');
    return res.data;
  },

  async createReceivable(payload: ReceivableRequest): Promise<Receivable> {
    const res = await http.post<Receivable>('/receivables', payload);
    return res.data;
  },

  async simulate(id: number, paymentCurrency: string): Promise<SimulationResult> {
    const res = await http.get<SimulationResult>(`/receivables/${id}/simulate`, {
      params: { paymentCurrency },
    });
    return res.data;
  },

  async liquidate(receivableId: number, paymentCurrencyCode: string) {
    return await http.post('/liquidations', { receivableId, paymentCurrencyCode });
  },

  async getRateHistory(): Promise<ExchangeRate[]> {
    const res = await http.get<ExchangeRate[]>('/currencies/rates/history');
    return res.data;
  },

  async syncPtax(date: string) {
    const [y, m, d] = date.split('-');
    const formattedDate = `${m}-${d}-${y}`;
    await http.post('/currencies/rates/sync-bacen', null, { params: { date: formattedDate } });
  },

  async getStatement(params: any): Promise<StatementResponse> {
    const res = await http.get('/statement', { params });
    return res.data;
  }
};