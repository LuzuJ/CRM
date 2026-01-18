const Header = ({ title, subtitle, actions, showSearch = true }) => {
  return (
    <header className="h-16 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 hover:text-slate-700">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex flex-col">
          {title && (
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg">
            <span className="material-symbols-outlined text-slate-400 text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar trámites, documentos..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 w-64"
            />
          </div>
        )}

        {/* Notifications */}
        <button className="relative text-slate-400 hover:text-slate-600">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Custom Actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
};

export default Header;
