import React, { useState, useEffect } from 'react';
import { type Receivable, ReceivableType, ReceivableStatus, Currency, type SimulationResult } from '../types';
import { ApiService } from '../services/api';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingDown, 
  Globe, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReceivablesGridProps {
  apiMode: 'offline' | 'api';
  refreshTrigger: number;
  onStateChange: () => void;
}

export default function ReceivablesGrid({ apiMode, refreshTrigger, onStateChange }: ReceivablesGridProps) {
  // Grid Data & Pagination State
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Filters State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ReceivableType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ReceivableStatus | 'ALL'>('ALL');
  const [currencyFilter, setCurrencyFilter] = useState<Currency | 'ALL'>('ALL');

  // Sorting State
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDesc, setSortDesc] = useState<boolean>(true);

  // Loading and Error boundaries
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Liquidation Modal Wizard State
  const [selectedLiquidationItem, setSelectedLiquidationItem] = useState<Receivable | null>(null);
  const [payoutCurrency, setPayoutCurrency] = useState<Currency>(Currency.BRL);
  const [liquidationSim, setLiquidationSim] = useState<SimulationResult | null>(null);
  const [isLiquidating, setIsLiquidating] = useState(false);

  // Fetch items from API or Mock Engine on state dependencies
  const loadReceivables = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await ApiService.getReceivables({
        type: typeFilter,
        status: statusFilter,
        currency: currencyFilter,
        search: search,
        page: currentPage,
        pageSize: pageSize,
        sortBy: sortBy,
        sortDesc: sortDesc,
      });
      setReceivables(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar os dados de recebíveis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceivables();
  }, [
    typeFilter,
    statusFilter,
    currencyFilter,
    search,
    currentPage,
    pageSize,
    sortBy,
    sortDesc,
    apiMode,
    refreshTrigger,
  ]);

  // Handle live calculation on payout currency toggle in Liquidation drawer
  useEffect(() => {
    if (selectedLiquidationItem) {
      try {
        const sim = ApiService.simulateReceivableOffline(
          selectedLiquidationItem.value,
          selectedLiquidationItem.dueDate,
          selectedLiquidationItem.type,
          selectedLiquidationItem.originalCurrency,
          payoutCurrency
        );
        setLiquidationSim(sim);
      } catch (err) {
        setLiquidationSim(null);
      }
    } else {
      setLiquidationSim(null);
    }
  }, [selectedLiquidationItem, payoutCurrency]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(field);
      setSortDesc(true);
    }
    setCurrentPage(0); // reset page
  };

  // Execute actual asset liquidation
  const confirmLiquidation = async () => {
    if (!selectedLiquidationItem) return;
    setIsLiquidating(true);
    try {
      await ApiService.liquidateReceivable(selectedLiquidationItem.id, payoutCurrency);
      setSelectedLiquidationItem(null);
      onStateChange(); // refresh dashboard
      loadReceivables(); // reload local list
    } catch (err: any) {
      alert(err.message || 'Erro ao liquidar recebível.');
    } finally {
      setIsLiquidating(false);
    }
  };

  const formatMoney = (val: number, cur: Currency) => {
    return new Intl.NumberFormat(cur === Currency.BRL ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: cur,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };
  const filteredReceivables = receivables.filter(rec => {
  const matchSearch = search === '' || 
    rec.id.toString().includes(search) || 
    rec.value.toString().includes(search);
    
  const matchType = typeFilter === 'ALL' || rec.type === typeFilter;
  const matchStatus = statusFilter === 'ALL' || rec.status === statusFilter;
  const matchCurrency = currencyFilter === 'ALL' || rec.originalCurrency === currencyFilter;
  
  return matchSearch && matchType && matchStatus && matchCurrency;
});


  return (
    <div id="receivables-grid-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Title block */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Grade de Operações de Crédito</h2>
          <p className="text-xs text-slate-500">Histórico de títulos, descontos e liquidação auditável multimoedas</p>
        </div>
        <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full self-start">
          Total: <span className="font-bold text-slate-900">{totalElements}</span> de recebíveis
        </div>
      </div>

      {/* Dynamic Filters Rails */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            id="dyn-search-input"
            type="text"
            className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            placeholder="Pesquisar por ID ou Valor..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        {/* Filter by Type */}
        <div className="flex items-center space-x-2">
          <Filter className="h-3.5 w-3.5 text-slate-400 hidden lg:block" />
          <select
            id="type-filter-select"
            className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(0);
            }}
          >
            <option value="ALL">Todos os Produtos</option>
            <option value={ReceivableType.DUPLICATA}>Duplicata Mercantil</option>
            <option value={ReceivableType.CHEQUE}>Cheque Pré-datado</option>
          </select>
        </div>

        {/* Filter by Status */}
        <div>
          <select
            id="status-filter-select"
            className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(0);
            }}
          >
            <option value="ALL">Todos os Status</option>
            <option value={ReceivableStatus.PENDING}>PENDING (Vigentes)</option>
            <option value={ReceivableStatus.LIQUIDATED}>LIQUIDATED (Liquidados)</option>
          </select>
        </div>

        {/* Filter by Original Currency */}
        <div>
          <select
            id="currency-filter-select"
            className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-emerald-500"
            value={currencyFilter}
            onChange={(e) => {
              setCurrencyFilter(e.target.value as any);
              setCurrentPage(0);
            }}
          >
            <option value="ALL">Todas as Moedas</option>
            <option value={Currency.BRL}>Somente BRL (Real)</option>
            <option value={Currency.USD}>Somente USD (Dólar)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('id')}>
                <div className="flex items-center gap-1">
                  ID Operação <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-6">Produto</th>
              <th className="py-3.5 px-6 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('value')}>
                <div className="flex items-center justify-end gap-1">
                  Valor de Face <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('dueDate')}>
                <div className="flex items-center gap-1">
                  Vencimento <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6 text-right">Valor Líquido (VP)</th>
              <th className="py-3.5 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                  Carregando registros da mesa...
                </td>
              </tr>
            ) : errorMsg ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-red-500 font-medium">
                  {errorMsg}
                </td>
              </tr>
            ) : receivables.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  Nenhum recebível cadastrado ou localizado com os critérios informados.
                </td>
              </tr>
            ) : (
              receivables.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/55 transition-colors">
                  {/* ID */}
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">{rec.id}</td>
                  {/* Produto */}
                  <td className="py-4 px-6 font-medium text-slate-700">
                    {rec.type === ReceivableType.DUPLICATA ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                        Duplicata
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/50">
                        Cheque
                      </span>
                    )}
                  </td>
                  {/* Valor Face */}
                  <td className="py-4 px-6 text-right font-bold text-slate-900">
                    {formatMoney(rec.value, rec.originalCurrency)}
                  </td>
                  {/* Vencimento */}
                  <td className="py-4 px-6 font-semibold text-slate-500">
                    {formatDate(rec.dueDate)}
                  </td>
                  {/* Status */}
                  <td className="py-4 px-6">
                    {rec.status === ReceivableStatus.LIQUIDATED ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/40">
                        <CheckCircle className="h-3 w-3" /> LIQUIDADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200/40">
                        <Clock className="h-3 w-3" /> PENDING
                      </span>
                    )}
                  </td>
                  {/* Valor Líquido Presente */}
                  <td className="py-4 px-6 text-right font-bold text-slate-800">
                    {rec.status === ReceivableStatus.LIQUIDATED && rec.convertedValue ? (
                      <div className="flex flex-col text-right">
                        <span>{formatMoney(rec.convertedValue, rec.paymentCurrency || rec.originalCurrency)}</span>
                        {rec.paymentCurrency && rec.paymentCurrency !== rec.originalCurrency && (
                          <span className="text-[9px] text-slate-400 font-normal">
                            Orig: {formatMoney(rec.calculatedPresentValue || 0, rec.originalCurrency)}
                          </span>
                        )}
                      </div>
                    ) : (
                      formatMoney(rec.calculatedPresentValue || rec.value, rec.originalCurrency)
                    )}
                  </td>
                  {/* Ações */}
                  <td className="py-4 px-6 text-center">
                    {rec.status === ReceivableStatus.PENDING ? (
                      <button
                        onClick={() => {
                          setSelectedLiquidationItem(rec);
                          // default target currency choice matches origin
                          setPayoutCurrency(rec.originalCurrency);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg transition-colors border border-emerald-600 cursor-pointer shadow-sm hover:shadow"
                      >
                        Liquidar
                      </button>
                    ) : (
                      <button
                        disabled
                        className="bg-slate-100 text-slate-400 font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg border border-slate-200/40 cursor-not-allowed"
                      >
                        Pago
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <div className="flex items-center space-x-2">
          <span>Exibir</span>
          <select
            className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(0);
            }}
          >
            <option value={5}>5 itens</option>
            <option value={10}>10 itens</option>
            <option value={20}>20 itens</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0 || loading}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 font-mono text-slate-700 bg-white border border-slate-200 rounded">
            Página {currentPage + 1} de {totalPages || 1}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage >= totalPages - 1 || loading}
            className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modern Liquidation Wizard Modal Dialog */}
      <AnimatePresence>
        {selectedLiquidationItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold">Liquidar Recebível: {selectedLiquidationItem.id}</h3>
                </div>
                <button
                  onClick={() => setSelectedLiquidationItem(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                
                {/* Original Item Summary Banner */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">
                      Valor de Face Original
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {formatMoney(selectedLiquidationItem.value, selectedLiquidationItem.originalCurrency)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black uppercase tracking-widest">
                      Vencimento do Título
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatDate(selectedLiquidationItem.dueDate)}
                    </span>
                  </div>
                </div>

                {/* Currency Payment Strategy Selectors */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Moeda De Pagamento (Recebimento)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPayoutCurrency(Currency.BRL)}
                      className={`py-3 px-4 font-bold text-xs rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        payoutCurrency === Currency.BRL
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Real (BRL)</span>
                      {selectedLiquidationItem.originalCurrency !== Currency.BRL && (
                        <span className="text-[10px] font-normal text-slate-400">(Conversão cambial)</span>
                      )}
                    </button>
                    <button
                      onClick={() => setPayoutCurrency(Currency.USD)}
                      className={`py-3 px-4 font-bold text-xs rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        payoutCurrency === Currency.USD
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 ring-1 ring-emerald-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>Dólar (USD)</span>
                      {selectedLiquidationItem.originalCurrency !== Currency.USD && (
                        <span className="text-[10px] font-normal text-slate-400">(Conversão cambial)</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulation block */}
                {liquidationSim && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs space-y-3">
                    <div className="flex justify-between items-baseline font-semibold text-slate-500">
                      <span>Dias de resgate (Prazo corrido):</span>
                      <span className="font-bold text-slate-900">{liquidationSim.termDays} dias</span>
                    </div>
                    
                    <div className="flex justify-between items-baseline font-semibold text-slate-500">
                      <span>Deságio do ativo ({liquidationSim.appliedMonthlyRate.toFixed(2)}% a.m.):</span>
                      <span className="font-bold text-slate-900 font-mono">
                        -{formatMoney(selectedLiquidationItem.value - liquidationSim.presentValue, selectedLiquidationItem.originalCurrency)}
                      </span>
                    </div>

                    {liquidationSim.crossCurrencyApplied ? (
                      <div className="border-t border-slate-200 pt-3 flex flex-col gap-1 bg-emerald-50/50 -mx-4 px-4 py-2">
                        <div className="flex justify-between items-center text-slate-500">
                          <span className="font-bold text-emerald-800">Cotação cambial aplicada:</span>
                          <span className="font-bold text-emerald-900">R$ {liquidationSim.exchangeRateUsed.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="font-black text-slate-700">Valor Final Convertido:</span>
                          <span className="text-lg font-black text-slate-900 font-mono">
                            {formatMoney(liquidationSim.convertedValue, payoutCurrency)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                        <span className="font-bold text-slate-600">Valor Líquido creditado:</span>
                        <span className="text-lg font-black text-slate-900 font-mono">
                          {formatMoney(liquidationSim.presentValue, selectedLiquidationItem.originalCurrency)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-blue-50 text-[10px] p-3 rounded-xl border border-blue-100 text-blue-700 font-medium">
                  Nota: A liquidação fechará este título de forma definitiva. Operação ACID com travas de concorrência pessimistas (Safe Lock).
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedLiquidationItem(null)}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLiquidation}
                  disabled={isLiquidating}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-[0.98]"
                >
                  Confirmar Liquidação
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
