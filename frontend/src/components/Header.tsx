export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-900">SRM Credit Engine</h1>
          <p className="text-xs text-slate-500">Plataforma de Cessão de Crédito</p>
        </div>
      </div>
      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
        Operador
      </span>
    </header>
  );
}
