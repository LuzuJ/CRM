import { useState } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';

const SettingsPage = () => {
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoSave: true,
    theme: 'light',
    language: 'es',
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('Configuración actualizada', 'success');
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showToast('Configuración actualizada', 'success');
  };

  return (
    <Layout title="Configuración" subtitle="Preferencias del sistema">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Perfil de Usuario</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-2xl">
              JD
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Jane Doe</h3>
              <p className="text-sm text-slate-500">jane.doe@crmlegal.com</p>
              <p className="text-sm text-slate-500">Agente Legal</p>
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark">
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Notificaciones</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Notificaciones Push</p>
                <p className="text-sm text-slate-500">Recibir notificaciones en el navegador</p>
              </div>
              <button
                onClick={() => handleToggle('notifications')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Alertas por Email</p>
                <p className="text-sm text-slate-500">Recibir alertas importantes por correo</p>
              </div>
              <button
                onClick={() => handleToggle('emailAlerts')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailAlerts ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Preferencias Generales</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Guardado Automático</p>
                <p className="text-sm text-slate-500">Guardar cambios automáticamente</p>
              </div>
              <button
                onClick={() => handleToggle('autoSave')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoSave ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block font-medium text-slate-900 mb-2">Tema</label>
              <select
                value={settings.theme}
                onChange={(e) => handleSelect('theme', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-900 mb-2">Idioma</label>
              <select
                value={settings.language}
                onChange={(e) => handleSelect('language', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Información del Sistema</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Versión:</span>
              <span className="font-medium text-slate-900">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Última Actualización:</span>
              <span className="font-medium text-slate-900">18 de Enero, 2026</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Servidor Backend:</span>
              <span className="font-medium text-green-600">● Conectado</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-card p-6 border-2 border-red-200">
          <h2 className="text-lg font-bold text-red-600 mb-4">Zona Peligrosa</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50">
              Limpiar Caché del Sistema
            </button>
            <button className="w-full px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50">
              Restablecer Configuración
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
