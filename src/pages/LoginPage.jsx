import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { login, demoUsers } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      showToast('Por favor ingresa usuario y contraseña', 'warning');
      return;
    }

    setLoading(true);
    
    // Simular delay de autenticación
    setTimeout(() => {
      const result = login(username, password);
      
      if (result.success) {
        showToast(`Bienvenido, ${result.user.name}`, 'success');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        showToast(result.error, 'error');
      }
      
      setLoading(false);
    }, 800);
  };

  const handleQuickLogin = (user) => {
    setUsername(user.username);
    setPassword(user.password);
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-primary/5 flex items-center justify-center p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <span className="material-symbols-outlined text-white text-[32px]">
              gavel
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            CRM Legal Migration
          </h1>
          <p className="text-slate-600">
            Sistema de Gestión de Trámites Migratorios
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    person
                  </span>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    lock
                  </span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Botón de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    progress_activity
                  </span>
                  Verificando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Usuarios de Demostración</span>
            </div>
          </div>

          {/* Toggle Demo Users */}
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="w-full py-2 text-primary hover:text-primary-dark font-medium text-sm flex items-center justify-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {showDemo ? 'expand_less' : 'expand_more'}
            </span>
            {showDemo ? 'Ocultar' : 'Ver'} usuarios de prueba
          </button>

          {/* Demo Users Grid */}
          {showDemo && (
            <div className="mt-4 space-y-2">
              {demoUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  className="p-3 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10">
                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary text-[20px]">
                          {getRoleIcon(user.role)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.username}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Sistema de demostración - Datos de prueba</p>
          <p className="mt-1">Verificación y Validación © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
