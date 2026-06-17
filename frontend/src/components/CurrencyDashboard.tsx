import React, { useState, useEffect } from 'react';
import { type ExchangeRate, Currency } from '../types';
import { ApiService } from '../services/api';
import { 
  TrendingUp, 
  RefreshCw, 
  Plus, 
  Calendar, 
  DollarSign, 
  ArrowRight,
  Database,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CurrencyDashboardProps {
  refreshTrigger: number;
  onRatesUpdated: () => void;
}

export default function CurrencyDashboard({ refreshTrigger, onRatesUpdated }: CurrencyDashboardProps) {
  const [ratesList, setRatesList] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  // Inputs for Manual Rate
  const [manualDate, setManualDate] = useState('2026-06-16');
  const [manualRate, setManualRate] = useState('5.45');

  // Inputs for Bacen Sync
  const [syncDate, setSyncDate] = useState('2026-06-16');
  const [isSyncing, setIsSyncing] = useState(false);

  // Active Rate hover index in Chart
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const history = await ApiService.getExchangeHistory();
      // sort chronologically for chart plotting
      const sortedHistory = [...history].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setRatesList(sortedHistory);
    } catch (err) {
      console.error('Error listing rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [refreshTrigger]);

  // Handle Manual Rate Submit
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg({ text: '', type: '' });
    const parsedRate = parseFloat(manualRate);

    if (isNaN(parsedRate) || parsedRate <= 0) {
      setStatusMsg({ text: 'Informe um valor de taxa cambial positivo válido.', type: 'error' });
      return;
    }

    if (!manualDate) {
      setStatusMsg({ text: 'Informe uma data para a cotação.', type: 'error' });
      return;
    }

    try {
      await ApiService.addExchangeRate({
        date: manualDate,
        rate: parsedRate,
        sourceCurrency: Currency.USD,
        targetCurrency: Currency.BRL
      });
      setStatusMsg({ text: `Cotação de USD/BRL registrada: R$ ${parsedRate.toFixed(4)} para o dia ${manualDate}`, type: 'success' });
      onRatesUpdated();
      fetchRates();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Falha ao salvar cotação.', type: 'error' });
    }
  };

  // Handle BACEN Sync trigger
  const handleSyncBacen = async () => {
    if (!syncDate) {
      setStatusMsg({ text: 'Selecione uma data para sincronizar.', type: 'error' });
      return;
    }

    setIsSyncing(true);
    setStatusMsg({ text: '', type: '' });

    try {
      const res = await ApiService.syncBacenPtax(syncDate);
      setStatusMsg({ 
        text: `Sincronização PTAX concluída com sucesso! Taxa: R$ ${res.rate.toFixed(4)}`, 
        type: 'success' 
      });
      onRatesUpdated();
      fetchRates();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Erro durante sincronização com BACEN.', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculate SVG Graph Coordinates based on recent rates (limit to last 7-10 entries)
  const chartRates = ratesList.slice(-10); // last 10 entries
  const maxRate = Math.max(...chartRates.map(r => r.rate), 5.50) + 0.02;
  const minRate = Math.min(...chartRates.map(r => r.rate), 5.25) - 0.02;

  const width = 500;
  const height = 180;
  const padding = 25;

  const points = chartRates.map((r, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(chartRates.length - 1, 1);
    const y = height - padding - ((r.rate - minRate) * (height - padding * 2)) / (maxRate - minRate);
    return { x, y, rate: r.rate, date: r.date };
  });

  const linePath = points.length > 0 
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` 
    : '';

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`
    : '';

  return (
    <div id="currency-dashboard-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Chart & General Trends (Col span 2 on large screens) */}
      <div id="currency-chart-card" className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
        
        {/* Header */}
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Histórico Cambial (USD ➜ BRL)</h2>
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Taxa de Câmbio PTAX
          </p>
        </div>

        {/* Dynamic Chart space */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          {points.length > 1 ? (
            <div className="relative">
              {/* Responsive SVG Chart */}
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                {/* Horizontal reference Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const yVal = padding + ratio * (height - padding * 2);
                  const rateVal = maxRate - ratio * (maxRate - minRate);
                  return (
                    <g key={i}>
                      <line 
                        x1={padding} 
                        y1={yVal} 
                        x2={width - padding} 
                        y2={yVal} 
                        stroke="#f1f5f9" 
                        strokeWidth="1" 
                      />
                      <text 
                        x={padding - 5} 
                        y={yVal + 3} 
                        fill="#94a3b8" 
                        fontSize="8" 
                        fontWeight="600"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {rateVal.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area underneath the sparkline */}
                <path 
                  d={areaPath} 
                  fill="url(#emeraldGradient)" 
                  className="opacity-10" 
                />

                {/* Line Path */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Linear Gradients descriptor */}
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>

                {/* Date nodes */}
                {points.map((p, index) => (
                  <g 
                    key={index}
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    {/* Pulsing overlay circle on hover */}
                    {hoveredPoint === index && (
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="8" 
                        fill="#10b981" 
                        opacity="0.2" 
                      />
                    )}
                    {/* Real node circle */}
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={hoveredPoint === index ? "5" : "3.5"} 
                      fill={hoveredPoint === index ? "#047857" : "#10b981"} 
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all"
                    />
                  </g>
                ))}
              </svg>

              {/* Float Tooltip */}
              <AnimatePresence>
                {hoveredPoint !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-semibold"
                  >
                    <span className="font-mono text-emerald-400">
                      R$ {points[hoveredPoint].rate.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
                      {points[hoveredPoint].date.split('-').reverse().join('/')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-slate-400 text-xs">
              Carregando dados históricos de câmbio...
            </div>
          )}

          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-50 pt-2.5 px-2">
            <span>Mais Antigo ({chartRates.length > 0 ? chartRates[0].date.split('-').reverse().slice(0,2).join('/') : ''})</span>
            <span>Câmbito Comercial Brasil PTAX</span>
            <span>Cotação Hoje ({chartRates.length > 0 ? chartRates[chartRates.length - 1].date.split('-').reverse().slice(0,2).join('/') : ''})</span>
          </div>
        </div>

      </div>

      {/* 2. Sync Backends / PTAX controls panel */}
      <div id="currency-sync-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5 mb-2">
            <Database className="h-4 w-4 text-emerald-500" />
            Sincronizador Bacen
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Importação via Bacen PTAX pública pelo dia selecionado das cotações de fechamento.
          </p>

          {/* Alert Status feedback banner */}
          {statusMsg.text && (
            <div className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                : 'bg-red-50 text-red-800 border-red-100'
            }`}>
              {statusMsg.text}
            </div>
          )}

          <div className="space-y-4">
            {/* Sync tool form */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Selecione o Dia de Referência
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white outline-none"
                  value={syncDate}
                  onChange={(e) => setSyncDate(e.target.value)}
                />
                <button
                  onClick={handleSyncBacen}
                  disabled={isSyncing}
                  className="bg-slate-900 border border-slate-950 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors shadow-sm active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Sincronizar'
                  )}
                </button>
              </div>
            </div>

            {/* Manual override tool */}
            <form onSubmit={handleManualSubmit} className="border-t border-slate-100 pt-4 space-y-3">
              <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                Definir Taxa Manualmente
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1">Data</label>
                  <input
                    type="date"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white outline-none"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mb-1">Taxa (R$ / $1)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[8px] font-bold text-slate-400">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.01"
                      className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white outline-none"
                      value={manualRate}
                      onChange={(e) => setManualRate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] py-2 border border-slate-200 rounded-xl transition-all cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Registrar Cotação Manual
              </button>
            </form>

          </div>
        </div>

        <div className="text-[10px] text-slate-400 mt-4 border-l-2 border-emerald-500 bg-slate-50 p-2.5 rounded-r">
          A PTAX do dia dita as transações cross-currency (BRL x USD e vice-versa) simuladas no painel.
        </div>

      </div>

    </div>
  );
}
