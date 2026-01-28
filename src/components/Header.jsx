import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ title, subtitle, actions, showSearch = true }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const styles = {
      'administrador': 'bg-purple-100 text-purple-700',
      'agente': 'bg-blue-100 text-blue-700',
      'cliente': 'bg-green-100 text-green-700'
    };
    return styles[role] || 'bg-slate-100 text-slate-700';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'administrador': 'admin_panel_settings',
      'agente': 'support_agent',
      'cliente': 'person'
    };
    return icons[role] || 'person';
  };

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

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">
                  {getRoleIcon(user.role)}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
