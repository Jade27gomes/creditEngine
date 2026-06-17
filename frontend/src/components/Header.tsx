import React, { useState } from 'react';
import { ApiService } from '../services/api';
import { ToggleLeft, ToggleRight, Wifi, WifiOff, Settings2, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  apiMode: 'offline' | 'api';
  onModeChange: (mode: 'offline' | 'api') => void;
  baseRate: number;
  onBaseRateChange: (rate: number) => void;
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
  onResetData: () => void;
}

export default function Header({
  apiMode,
  onModeChange,
  baseRate,
  onBaseRateChange,
  apiUrl,
  onApiUrlChange,
  onResetData,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(apiUrl);
  const [ratePercent, setRatePercent] = useState((baseRate * 100).toFixed(2));

  const handleApplyUrl = () => {
    ApiService.setApiUrl(inputUrl);
    onApiUrlChange(inputUrl);
  };

  const handleRateSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setRatePercent(val.toFixed(2));
    const normalized = val / 100;
    ApiService.setBaseMonthlyRate(normalized);
    onBaseRateChange(normalized);
  };

  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Branding */}
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg font-bold tracking-wider flex items-center justify-center shadow-emerald-500/20 shadow-md">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              SRM Credit Engine
            </h1>
            <p className="text-xs text-slate-400 font-medium">Plataforma de Cessão de Crédito Multimoedas</p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div 
            id="mode-toggle-pill"
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
              apiMode === 'api' 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/80 shadow-inner' 
                : 'bg-amber-950/30 text-amber-400 border-amber-900/60'
            }`}
            onClick={() => onModeChange(apiMode === 'api' ? 'offline' : 'api')}
          >
            {apiMode === 'api' ? (
              <>
                <Wifi className="h-3.5 w-3.5 animate-pulse" />
                <span>API Conectada:</span>
                <span className="underline font-mono">{apiUrl}</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>Modo Simulação (Offline)</span>
              </>
            )}
            <button className="focus:outline-none ml-2">
              {apiMode === 'api' ? (
                <ToggleRight className="h-5 w-5 text-emerald-400" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-amber-500" />
              )}
            </button>
          </div>

          {/* Quick Settings Action Toggle */}
          <button
            id="toggle-settings-btn"
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg border text-slate-300 hover:text-white hover:bg-slate-800 transition-colors ${
              isOpen ? 'bg-slate-800 text-white border-slate-700' : 'border-slate-800'
            }`}
            title="Ajustar Parâmetros da Plataforma"
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Advanced Settings Drawer (Accordion-style) */}
      {isOpen && (
        <div id="settings-accordion-panel" className="bg-slate-950 border-b border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Target URL Setup */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  URL da API SRM (Backend Local)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    placeholder="http://localhost:8080"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                  >
                    Salvar
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Configura o endpoint base da sua API de Cessão desenvolvida localmente.
                </p>
              </div>
            </div>

            {/* Base Interest Rate (Taxa Base a.m. - CDI/SELIC) */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Taxa Base Mensal (Benchmark / CDI)
                  </label>
                  <span className="text-xs font-bold text-emerald-400">{ratePercent}% a.m.</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="5.00"
                  step="0.05"
                  value={parseFloat(ratePercent)}
                  onChange={handleRateSlider}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-2">
                  Taxa financeira de referência (ex: CDI) acrescida do Spread de risco no cálculo do deságio.
                </p>
              </div>
            </div>

            {/* Simulated Database Controls */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Persistência Local (Simulador)
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Deseja realmente restaurar os dados de simulação padrão? Novas transações serão perdidas.')) {
                        ApiService.resetToDefault();
                        onResetData();
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-amber-950/40 text-amber-400 hover:bg-amber-950/60 border border-amber-900/60 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Resetar Base Mock
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  Restaura o estado inicial com taxas históricas e lote de recebíveis de exemplo.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
