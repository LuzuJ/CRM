import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'dashboard', label: 'Dashboard' },
    { path: '/mailroom', icon: 'inbox', label: 'Mailroom', filled: true },
    { path: '/ocr-extraction', icon: 'mark_email_read', label: 'Verificación OCR' },
    { path: '/cases', icon: 'folder_shared', label: 'Cases', filled: true },
    { path: '/appointments', icon: 'calendar_month', label: 'Agendamiento' },
    { path: '/deadlines', icon: 'calendar_clock', label: 'Deadlines Tower', filled: true },
    { path: '/compliance', icon: 'verified', label: 'Validación Legal' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">gavel</span>
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                CRM Legal
              </span>
              <span className="text-xs text-slate-500">Enterprise Suite</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined ${item.filled && isActive ? 'icon-filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="hidden lg:block text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
              JD
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-semibold text-slate-800 dark:text-white">
                Jane Doe
              </span>
              <span className="text-xs text-slate-500">Agente Legal</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
