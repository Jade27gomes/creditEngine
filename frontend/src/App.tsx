// import { useState } from 'react';
// import Header from './components/Header';
// import OperatorPanel from './components/OperatorPanel';
// import ReceivablesGrid from './components/ReceivablesGrid';
// import CurrencyDashboard from './components/CurrencyDashboard';
// import LiquidationStatement from './components/LiquidationStatement';

// export default function App() {
//   const [refreshTrigger, setRefreshTrigger] = useState(0);

//   const refreshAllData = () => {
//     setRefreshTrigger(prev => prev + 1);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
//       <Header />

//       <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
//           {/* Coluna da Esquerda: Cadastro e Câmbio */}
//           <div className="flex flex-col gap-6">
//             <OperatorPanel onCreated={refreshAllData} />
//             <CurrencyDashboard />
//           </div>

//           {/* Coluna da Direita: Operação e Histórico */}
//           <div className="lg:col-span-2 flex flex-col gap-6">
            
//             <ReceivablesGrid 
//               refreshTrigger={refreshTrigger} 
//               onLiquidated={refreshAllData} 
//             />
            
//             <LiquidationStatement key={refreshTrigger} />
            
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OperatorPanel from './components/OperatorPanel';
import ReceivablesGrid from './components/ReceivablesGrid';
import CurrencyDashboard from './components/CurrencyDashboard';
import { ApiService } from './services/api';
import { type Receivable, ReceivableStatus, Currency } from './types';
import { 
  Briefcase, 
  Coins, 
  Layers, 
  ArrowUpRight, 
  DollarSign, 
  Activity, 
  TrendingUp,
  FileCheck2,
  Clock
} from 'lucide-react';

export default function App() {
  // Global config states
  const [apiMode, setApiMode] = useState<'offline' | 'api'>(ApiService.getApiMode());
  const [baseRate, setBaseRate] = useState<number>(ApiService.getBaseMonthlyRate());
  const [apiUrl, setApiUrl] = useState<string>(ApiService.getApiUrl());
  
  // Refresh trigger to broadcast fetch updates to all grid cells
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Stats Card state
  const [stats, setStats] = useState({
    pendingBrl: 0,
    pendingUsd: 0,
    liquidatedEquivalent: 0,
    currentRate: 5.44,
  });

  const triggerGlobalRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleModeChange = (newMode: 'offline' | 'api') => {
    ApiService.setApiMode(newMode);
    setApiMode(newMode);
    triggerGlobalRefresh();
  };

  const handleBaseRateChange = (newRate: number) => {
    setBaseRate(newRate);
    triggerGlobalRefresh();
  };

  const handleApiUrlChange = (newUrl: string) => {
    setApiUrl(newUrl);
    triggerGlobalRefresh();
  };

  const handleReset = () => {
    setBaseRate(0.01);
    triggerGlobalRefresh();
  };

  // Compute Statistics from simulated database for senior executive bento layout
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all receivables unfiltered to extract metrics
        const data = await ApiService.getReceivables({
          page: 0,
          pageSize: 1000, // retrieve everything for state calculations
        });
        const list = data.content;

        let pBrl = 0;
        let pUsd = 0;
        let liqEquiv = 0;

        const currentPtax = ApiService.getExchangeRateForDate('2026-06-16');

        list.forEach((rec: Receivable) => {
          if (rec.status === ReceivableStatus.PENDING) {
            if (rec.originalCurrency === Currency.BRL) {
              pBrl += rec.value;
            } else {
              pUsd += rec.value;
            }
          } else if (rec.status === ReceivableStatus.LIQUIDATED) {
            // Convert everything to BRL for the Liquidated Equivalent display
            if (rec.paymentCurrency === Currency.USD) {
              const usedRate = rec.exchangeRateUsed || currentPtax;
              // USD to BRL equivalent
              liqEquiv += (rec.convertedValue || 0) * usedRate;
            } else {
              liqEquiv += rec.convertedValue || rec.calculatedPresentValue || rec.value;
            }
          }
        });

        setStats({
          pendingBrl: pBrl,
          pendingUsd: pUsd,
          liquidatedEquivalent: liqEquiv,
          currentRate: currentPtax,
        });

      } catch (err) {
        console.error('Stats formulation failed:', err);
      }
    };

    fetchStats();
  }, [refreshTrigger, apiMode]);

  const formatMonetary = (val: number, cur: Currency) => {
    return new Intl.NumberFormat(cur === Currency.BRL ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: cur,
    }).format(val);
  };

  return (
    <div id="application-container" className="bg-[#f8fafc] min-h-screen font-sans antialiased text-slate-800 flex flex-col justify-between">
      
      {/* 1. Header component */}
      <Header
        apiMode={apiMode}
        onModeChange={handleModeChange}
        baseRate={baseRate}
        onBaseRateChange={handleBaseRateChange}
        apiUrl={apiUrl}
        onApiUrlChange={handleApiUrlChange}
        onResetData={handleReset}
      />

      {/* 2. Main Content Wrapper */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-8 animate-in fade-in duration-350">
        
        {/* Banner/Introduction header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-850 px-6 py-5 rounded-2xl text-white shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block h-2.5 w-2.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">Mesa Ativa</span>
            </div>
            <h2 className="text-lg font-black tracking-tight text-white mb-1">Painel Consolidado de Crédito</h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Simule descontos, calcule deságios baseados no risco de crédito (Strategy Pattern) e liquide recebíveis em cross-currency com garantias ACID robustas.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400 font-medium bg-slate-860 p-3 rounded-xl border border-slate-800">
            <div>Data Base: <span className="text-white font-bold">16/06/2026 (Hoje)</span></div>
            <div>Taxa CDI: <span className="text-emerald-400 font-bold">{(baseRate * 100).toFixed(2)}% a.m.</span></div>
          </div>
        </div>

        {/* 3. Executive Bento Stats Cards Area */}
        <div id="bento-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card A: Volume Pendente BRL */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Volume Pendente BRL</span>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                {formatMonetary(stats.pendingBrl, Currency.BRL)}
              </h3>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                <Clock className="w-2.5 h-2.5" /> Aguardando liquidação
              </span>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <Coins className="h-5 w-5" />
            </div>
          </div>

          {/* Card B: Volume Pendente USD */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Volume Pendente USD</span>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                {formatMonetary(stats.pendingUsd, Currency.USD)}
              </h3>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                <Clock className="w-2.5 h-2.5" /> Aguardando liquidação
              </span>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>

          {/* Card C: Total Liquidado (BRL Equivalente) */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Resgates Liquidados</span>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                {formatMonetary(stats.liquidatedEquivalent, Currency.BRL)}
              </h3>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <FileCheck2 className="w-2.5 h-2.5" /> Operações concluídas
              </span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>

          {/* Card D: Taxa PTAX Dólar Hoje */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow transition-shadow flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Taxa PTAX Hoje</span>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                R$ {stats.currentRate.toFixed(4)}
              </h3>
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                <Activity className="w-2.5 h-2.5 animate-pulse" /> Atualizado comercial
              </span>
            </div>
            <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

        </div>

        {/* 4. Column block layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operator Calculation Card (Span 1) */}
          <div className="lg:col-span-1">
            <OperatorPanel
              baseMonthlyRate={baseRate}
              onReceivableCreated={triggerGlobalRefresh}
            />
          </div>

          {/* Currency Dashboard Plotting (Span 2) */}
          <div className="lg:col-span-2">
            <CurrencyDashboard
              refreshTrigger={refreshTrigger}
              onRatesUpdated={triggerGlobalRefresh}
            />
          </div>
        </div>

        {/* 5. Full width Transactions Grid */}
        <div className="w-full">
          <ReceivablesGrid
            apiMode={apiMode}
            refreshTrigger={refreshTrigger}
            onStateChange={triggerGlobalRefresh}
          />
        </div>

      </main>

      {/* 5. Footer branding info */}
      <footer id="app-footer" className="bg-slate-900 border-t border-slate-800 text-slate-500 py-6 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SRM Credit Engine. Desafio Técnico - Jade Gomes. Todos os Direitos Reservados.</p>
          <p className="text-[10px] text-slate-600 mt-1">
            Desenvolvido com padrão de Projeto Strategy e Câmbio Integrado Bacen PTAX.
          </p>
        </div>
      </footer>

    </div>
  );
}
