import { useState } from 'react';
import { api } from '../services/api';
import type { ReceivableRequest, SimulationResult, CurrencyCode } from '../types';

interface Props {
  onCreated: () => void;
}

export default function OperatorPanel({ onCreated }: Props) {
  
  const [form, setForm] = useState<ReceivableRequest>({
    assignorId: 1,    
    productId: 1,       
    faceValue: 0,
    dueDate: '',
    currencyCode: 'BRL',
    termMonths: 1,     
  });

  const [paymentCurrency, setPaymentCurrency] = useState<CurrencyCode>('BRL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  
  const handleChange = (field: keyof ReceivableRequest, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  async function handleSubmit() {
    setError('');
    setSuccess('');
    setSimulation(null);

    
    if (form.faceValue <= 0 || !form.dueDate) {
      setError('Por favor, preencha o valor e a data de vencimento.');
      return;
    }

    setLoading(true);
    try {
    
      const createdReceivable = await api.createReceivable(form);
      
      setSuccess(`Recebível #${createdReceivable.id} cadastrado com sucesso!`);

     
      try {
        const simResult = await api.simulate(createdReceivable.id, paymentCurrency);
        setSimulation(simResult);
      } catch (simError) {
        console.error("Erro na simulação:", simError);
      }

      setForm({
        assignorId: 1,
        productId: 1,
        faceValue: 0,
        dueDate: '',
        currencyCode: 'BRL',
        termMonths: 1,
      });
      onCreated();

    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-sm font-bold text-slate-600 mb-6 uppercase tracking-wider">
        Novo Recebível
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Cedente - No backend é um ID (Long) */}
        <div className="col-span-2">
          <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">ID do Cedente</label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.assignorId}
            onChange={e => handleChange('assignorId', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Valor Face */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Valor Face</label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="0.00"
            value={form.faceValue || ''}
            onChange={e => handleChange('faceValue', parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Vencimento */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Vencimento</label>
          <input
            type="date"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.dueDate}
            onChange={e => handleChange('dueDate', e.target.value)}
          />
        </div>

        {/* Tipo (Mapeado para productId no backend) */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Tipo de Ativo</label>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.productId}
            onChange={e => handleChange('productId', parseInt(e.target.value))}
          >
            <option value={1}>Duplicata Mercantil</option>
            <option value={2}>Cheque Pré-datado</option>
          </select>
        </div>

        {/* Prazo (termMonths) */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Prazo (Meses)</label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.termMonths}
            onChange={e => handleChange('termMonths', parseInt(e.target.value) || 1)}
          />
        </div>

        {/* Moeda Original */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Moeda Original</label>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={form.currencyCode}
            onChange={e => handleChange('currencyCode', e.target.value as CurrencyCode)}
          >
            <option value="BRL">BRL (Real)</option>
            <option value="USD">USD (Dólar)</option>
          </select>
        </div>

        {/* Moeda de Pagamento (Usada apenas na Liquidação/Simulação) */}
        <div>
          <label className="text-[11px] font-bold text-slate-500 mb-1 block uppercase">Moeda de Liquidação</label>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={paymentCurrency}
            onChange={e => setPaymentCurrency(e.target.value as CurrencyCode)}
          >
            <option value="BRL">BRL</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* Resultados da Simulação do Backend */}
      {simulation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-blue-600 font-bold uppercase">Valor Presente Líquido</span>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(simulation.presentValue, simulation.paymentCurrency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-2">
            <span className="text-[10px] text-blue-500 uppercase">Desconto (Deságio):</span>
            <span className="text-xs font-semibold text-blue-800">
              {formatCurrency(simulation.discount, simulation.originalCurrency)}
            </span>
          </div>
          {simulation.exchangeRateUsed > 0 && simulation.originalCurrency !== simulation.paymentCurrency && (
            <p className="text-[9px] text-blue-400 mt-2 italic text-right">
              Taxa de câmbio aplicada: {simulation.exchangeRateUsed.toFixed(4)}
            </p>
          )}
        </div>
      )}

      {/* Mensagens de Feedback */}
      {error && <p className="mt-4 text-xs text-red-500 font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>}
      {success && <p className="mt-4 text-xs text-green-600 font-medium bg-green-50 p-2 rounded border border-green-100">{success}</p>}

      {/* Botão Principal */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white text-xs font-bold py-3 rounded-lg transition-all shadow-md active:transform active:scale-95"
      >
        {loading ? 'PROCESSANDO...' : 'CADASTRAR RECEBÍVEL'}
      </button>
    </div>
  );
}