import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { StatementEntry } from '../types';

export default function LiquidationStatement() {
  const [data, setData] = useState<StatementEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    assignor: '',
    currency: ''
  });

  const fmt = (v: number, cur: string) =>
    new Intl.NumberFormat(cur === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency: cur }).format(v);

  async function load() {
    setLoading(true);
    try {
      const res = await api.getStatement({
        page,
        size: 10,
        ...filters
      });
      
      setData(res.content || []);
      setTotal(res.totalElements || 0);
    } catch (error) {
      console.error("Erro no extrato:", error);
      setData([]); 
    } finally {
      setLoading(false);
    }
  }

  
  useEffect(() => { load(); }, [page]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
          Consulta de Extrato
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input 
            type="date" 
            className="text-xs border rounded-lg p-2" 
            value={filters.startDate}
            onChange={e => setFilters({...filters, startDate: e.target.value})} 
          />
          <input 
            type="date" 
            className="text-xs border rounded-lg p-2" 
            value={filters.endDate}
            onChange={e => setFilters({...filters, endDate: e.target.value})} 
          />
          <input 
            type="text" 
            placeholder="Cedente..." 
            className="text-xs border rounded-lg p-2"
            value={filters.assignor}
            onChange={e => setFilters({...filters, assignor: e.target.value})}
          />
          <select 
            className="text-xs border rounded-lg p-2"
            value={filters.currency}
            onChange={e => setFilters({...filters, currency: e.target.value})}
          >
            <option value="">Moedas</option>
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </select>
          
          
          <button 
            onClick={() => { setPage(0); load(); }}
            className="bg-slate-800 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-slate-700 uppercase tracking-widest transition-all"
>
            Aplicar Filtros
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-bold">
            <tr>
              <th className="px-6 py-3 text-left">Data</th>
              <th className="px-6 py-3 text-left">Cedente</th>
              <th className="px-6 py-3 text-right">V. Face</th>
              <th className="px-6 py-3 text-right">V. Presente</th>
              <th className="px-6 py-3 text-right">Taxa Ptax</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 italic text-slate-400">Processando consulta...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-slate-400">Nenhum resultado para os filtros aplicados.</td></tr>
            ) : data.map(t => (
              <tr key={t.transactionId} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-slate-500">{t.date ? new Date(t.date).toLocaleDateString() : '---'}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{t.assignorName}</td>
                <td className="px-6 py-4 text-right text-slate-400">{fmt(t.faceValue, t.originalCurrency)}</td>
                <td className="px-6 py-4 text-right font-bold text-blue-600">{fmt(t.presentValue, t.paymentCurrency)}</td>
                <td className="px-6 py-4 text-right font-mono text-xs">
                    {t.exchangeRateUsed ? t.exchangeRateUsed.toFixed(4) : '1.0000'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}