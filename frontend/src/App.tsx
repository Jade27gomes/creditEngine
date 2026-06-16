import { useState } from 'react';
import Header from './components/Header';
import OperatorPanel from './components/OperatorPanel';
import ReceivablesGrid from './components/ReceivablesGrid';
import CurrencyDashboard from './components/CurrencyDashboard';
import LiquidationStatement from './components/LiquidationStatement';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAllData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna da Esquerda: Cadastro e Câmbio */}
          <div className="flex flex-col gap-6">
            <OperatorPanel onCreated={refreshAllData} />
            <CurrencyDashboard />
          </div>

          {/* Coluna da Direita: Operação e Histórico */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            <ReceivablesGrid 
              refreshTrigger={refreshTrigger} 
              onLiquidated={refreshAllData} 
            />
            
            <LiquidationStatement key={refreshTrigger} />
            
          </div>
        </div>
      </main>
    </div>
  );
}