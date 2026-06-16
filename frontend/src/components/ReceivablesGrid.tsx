import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Receivable, CurrencyCode } from '../types';

interface Props {
  refreshTrigger: number;
  onLiquidated: () => void;
}

export default function ReceivablesGrid({ refreshTrigger, onLiquidated }: Props) {
  const [data, setData] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState(false);
  const [payCurrency, setPayCurrency] = useState<CurrencyCode>('BRL');

  async function load() {
    setLoading(true);
    try {
      const result = await api.getPendingReceivables();
      setData(result || []);
    } catch (error) {
      console.error("Erro ao carregar pendentes", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [refreshTrigger]);

  const handleLiquidate = async (id: number) => {
    try {
      await api.liquidate(id, payCurrency);
      alert("Liquidação efetuada!");
      onLiquidated(); 
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao liquidar");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-50/20">
        <h2 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Títulos Disponíveis para Liquidação</h2>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Moeda de Pagamento:</span>
            <select 
                className="text-xs border rounded p-1 outline-none"
                value={payCurrency}
                onChange={e => setPayCurrency(e.target.value as CurrencyCode)}
            >
                <option value="BRL">BRL</option>
                <option value="USD">USD</option>
            </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] text-slate-400 border-b uppercase font-bold bg-slate-50/50">
              <th className="px-6 py-3 text-left">Cedente</th>
              <th className="px-6 py-3 text-right">Valor Face</th>
              <th className="px-6 py-3 text-left">Vencimento</th>
              <th className="px-6 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-6 text-slate-400 italic">Carregando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-slate-400">Nenhum título pendente para liquidação.</td></tr>
            ) : data.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{r.assignorName}</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                    {r.faceValue.toLocaleString('pt-BR', {style: 'currency', currency: r.currencyCode})}
                </td>
                <td className="px-6 py-4 text-slate-500">
                    {new Date(r.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleLiquidate(r.id)}
                    className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-700 uppercase transition-all shadow-sm"
                  >
                    Liquidar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}