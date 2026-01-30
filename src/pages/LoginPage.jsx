import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Asegúrate de tener instalado: npm install axios
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/Toast';

const LoginPage = () => {
  const [username, setUsername] = useState(''); // Se usará como correo
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      showToast('Por favor ingresa correo y contraseña', 'warning');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Petición al Backend FastAPI
      const response = await axios.post('http://127.0.0.1:8000/auth/login', {
        correo: username,   // El backend espera el campo "correo"
        password: password  // El backend espera el campo "password"
      });

      // 2. Si llegamos aquí, el login fue exitoso (Status 200)
      const data = response.data;
      
      showToast(`Bienvenido, ${data.usuario.nombre}`, 'success');

      // 3. Actualizar el contexto global de React (esto también guarda en localStorage)
      if (login) login(data);

      // 4. Redireccionar
      setTimeout(() => {
        navigate('/dashboard'); // O la ruta principal '/'
      }, 500);

    } catch (error) {
      console.error("Error en login:", error);

      // 6. Manejo de Errores
      if (error.response) {
        // El servidor respondió con un código de error
        if (error.response.status === 401) {
          showToast('Correo o contraseña incorrectos', 'error');
        } else if (error.response.status === 422) {
          showToast('Formato de datos inválido. ¿Ingresaste un correo?', 'warning');
        } else {
          showToast(`Error del servidor: ${error.response.status}`, 'error');
        }
      } else if (error.request) {
        // No hubo respuesta (Backend apagado o problema de red)
        showToast('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.', 'error');
      } else {
        showToast('Ocurrió un error inesperado', 'error');
      }
    } finally {
      setLoading(false);
    }
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
            VORTEX CRM
          </h1>
          <p className="text-slate-600">
            Sistema de Gestión de Trámites Migratorios
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Usuario (Correo) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">
                    mail
                  </span>
                </div>
                <input
                  type="text" // Puedes cambiar a type="email" para validación nativa del navegador
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Input Contraseña */}
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

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-4">
            <p>Verificación y Validación © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;