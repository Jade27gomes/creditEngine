import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { ExchangeRate } from '../types';

export default function CurrencyDashboard() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncDate, setSyncDate] = useState(new Date().toISOString().split('T')[0]);
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const data = await api.getRateHistory();
      setRates(data);
    } catch {
      setRates([]);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSync() {
    setSyncing(true);
    setMsg('');
    try {
      await api.syncPtax(syncDate);
      setMsg('PTAX sincronizada com sucesso!');
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? 'Erro ao sincronizar PTAX.');
    } finally {
      setSyncing(false);
    }
  }

  const latest = rates[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
        Câmbio
      </h2>

      {latest && (
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-xs text-slate-500 mb-1">{latest.fromCurrency}/{latest.toCurrency} (PTAX)</p>
          <p className="text-2xl font-semibold text-slate-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(latest.rate)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(latest.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <input
          type="date"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={syncDate}
          onChange={e => setSyncDate(e.target.value)}
        />
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
        >
          {syncing ? '...' : 'Sync PTAX'}
        </button>
      </div>

      {msg && <p className="text-xs text-slate-600 mt-1">{msg}</p>}

      {rates.length > 1 && (
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">Histórico</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {rates.slice(0, 10).map((r, i) => (
              <div key={i} className="flex justify-between text-xs text-slate-600 py-1 border-b border-slate-50">
                <span>{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                <span className="font-mono">{r.rate.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}