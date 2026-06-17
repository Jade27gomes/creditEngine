import React, { useState, useEffect } from 'react';
import { ReceivableType, Currency, type SimulationResult } from '../types';
import { ApiService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  PlusCircle, 
  TrendingDown, 
  Calendar, 
  Coins, 
  Info,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface OperatorPanelProps {
  baseMonthlyRate: number;
  onReceivableCreated: () => void;
}

export default function OperatorPanel({ baseMonthlyRate, onReceivableCreated }: OperatorPanelProps) {
  // Form State
  const [value, setValue] = useState<string>('15000.00');
  const [dueDate, setDueDate] = useState<string>('2026-07-16'); // 30 days ahead
  const [type, setType] = useState<ReceivableType>(ReceivableType.DUPLICATA);
  const [originalCurrency, setOriginalCurrency] = useState<Currency>(Currency.BRL);
  const [paymentCurrency, setPaymentCurrency] = useState<Currency>(Currency.BRL);

  // Simulation state
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Daily system date
  const systemDate = '2026-06-16';

  // Run real-time simulation on changes
  useEffect(() => {
    const valFloat = parseFloat(value);
    if (!isNaN(valFloat) && valFloat > 0 && dueDate) {
      try {
        const simRes = ApiService.simulateReceivableOffline(
          valFloat,
          dueDate,
          type,
          originalCurrency,
          paymentCurrency,
          baseMonthlyRate
        );
        setSimulation(simRes);
        setErrorMessage('');
      } catch (err) {
        setSimulation(null);
      }
    } else {
      setSimulation(null);
    }
  }, [value, dueDate, type, originalCurrency, paymentCurrency, baseMonthlyRate]);

  // Handle registration creation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const valFloat = parseFloat(value);
    if (isNaN(valFloat) || valFloat <= 0) {
      setErrorMessage('Por favor, informe um valor de face válido maior que zero.');
      return;
    }

    if (!dueDate) {
      setErrorMessage('Por favor, especifique uma data de vencimento.');
      return;
    }

    const today = new Date(systemDate);
    const selectedDate = new Date(dueDate);
    if (selectedDate <= today) {
      setErrorMessage(`O vencimento deve ser uma data futura ao dia atual (${systemDate}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await ApiService.createReceivable({
        value: valFloat,
        dueDate,
        type,
        originalCurrency,
      });

      setSuccessMessage('Recebível registrado com sucesso (status: PENDING)!');
      setValue('10000.00');
      // trigger update in list grid
      onReceivableCreated();
      
      // Auto dismiss success message
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao registrar recebível.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedCurrency = (val: number, currency: Currency) => {
    return new Intl.NumberFormat(currency === Currency.BRL ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: currency,
    }).format(val);
  };

  return (
    <div id="operator-panel-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-bold tracking-tight">Painel do Operador</h2>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
          Precificação de Ativos
        </span>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Error and Success banners */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium"
              >
                {errorMessage}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium"
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Input Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Valor de Face */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-slate-400" />
                Valor de Face
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs font-mono font-medium">
                    {originalCurrency === Currency.BRL ? 'R$' : '$'}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Data de Vencimento */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Vencimento do Título
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              />
            </div>

            {/* Tipo de Recebível (Spread strategy selection) */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                Tipo de Recebível
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ReceivableType)}
                className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              >
                <option value={ReceivableType.DUPLICATA}>Duplicata Mercantil (Spread: 1.5% a.m.)</option>
                <option value={ReceivableType.CHEQUE}>Cheque Pré-datado (Spread: 2.5% a.m.)</option>
              </select>
            </div>

            {/* Original Currency (Moeda do ativo) */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                Moeda do Título
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOriginalCurrency(Currency.BRL);
                    // auto trigger fallback currency matching by default
                    setPaymentCurrency(Currency.BRL);
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    originalCurrency === Currency.BRL
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  R$ (BRL)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOriginalCurrency(Currency.USD);
                    setPaymentCurrency(Currency.USD);
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    originalCurrency === Currency.USD
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  $ (USD)
                </button>
              </div>
            </div>

            {/* Payment Currency (Moeda de Quitação - para cross-currency) */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-slate-400" />
                Moeda de Liquidação (Simular Cross-Currency)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentCurrency(Currency.BRL)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    paymentCurrency === Currency.BRL
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Receber em Reais (BRL)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentCurrency(Currency.USD)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    paymentCurrency === Currency.USD
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Receber em Dólar (USD)
                </button>
              </div>
            </div>

          </div>
        </form>

        {/* Real-time present value calculation output block */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-slate-400" />
            Memória de Cálculo (Simulação)
          </h3>

          {simulation ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
              
              {/* Present Value Highlight */}
              <div className="flex justify-between items-baseline border-b border-slate-200/60 pb-3">
                <span className="text-xs text-slate-500 font-semibold">Valor Presente Líquido:</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formattedCurrency(simulation.presentValue, originalCurrency)}
                </span>
              </div>

              {/* Cross-Currency payout if cross applied */}
              {simulation.crossCurrencyApplied && (
                <div className="flex justify-between items-baseline border-b border-slate-200/30 pb-3 bg-emerald-50/50 -mx-4 px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">
                      Cross-Currency (Câmbio)
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Ptax estimada: $1 = R$ {simulation.exchangeRateUsed.toFixed(4)}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">
                    {formattedCurrency(simulation.convertedValue, paymentCurrency)}
                  </span>
                </div>
              )}

              {/* Calculations line items */}
              <div className="grid grid-cols-2 gap-y-2.5 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resgate</span>
                  <span className="font-semibold text-slate-700">{simulation.termDays} Dias Úteis</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taxa Mensal</span>
                  <span className="font-semibold text-slate-700">{simulation.appliedMonthlyRate.toFixed(2)}% a.m.</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-0.5">
                    Spread Risco
                    <span className="relative group cursor-help">
                      <Info className="h-2.5 w-2.5 text-slate-400" />
                      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-normal rounded p-1 w-36 hidden group-hover:block transition-all z-10">
                        Spread definido pelo tipo de produto (1.5% Duplicata / 2.5% Cheque)
                      </span>
                    </span>
                  </span>
                  <span className="font-medium text-slate-600">
                    {type === ReceivableType.DUPLICATA ? '1.50%' : '2.50%'} a.m.
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deságio Líquido</span>
                  <span className="font-semibold text-slate-600">
                    {formattedCurrency(parseFloat(value) - simulation.presentValue, originalCurrency)}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs py-10 transition-colors">
              Preencha os dados do recebível acima para exibir a simulação do valor líquido em tempo real.
            </div>
          )}

          {/* Form Create trigger buttons */}
          <div className="mt-5">
            <button
              onClick={handleRegister}
              disabled={isSubmitting || !simulation}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                isSubmitting || !simulation
                  ? 'bg-slate-300 border-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-950 active:scale-[0.99] hover:shadow-lg'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              {isSubmitting ? 'Registrando à API...' : 'Registrar Recebível (PENDING)'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
