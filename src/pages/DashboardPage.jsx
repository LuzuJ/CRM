import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [activities, setActivities] = useState([]);

  // Cargar datos del dashboard desde el backend
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener el resumen del dashboard
      // El backend ya filtra según el usuario autenticado usando el token
      const data = await dashboardService.getSummary();
      setDashboardData(data);
      
      // El backend retorna: { tareas_pendientes, alertas_activas, items_tareas[], items_alertas[] }
      // Mapear a la estructura interna del componente
      setCases(data.tramites || []);
      setDocuments(data.documentos || []);
      setAppointments(data.citas || []);
      setActivities(data.actividades_recientes || []);
      setProfiles([]);
    } catch (error) {
      console.error('Error al cargar dashboard del backend:', error);
      setCases([]);
      setDocuments([]);
      setAppointments([]);
      setProfiles([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteMonitoring = async () => {
    try {
      await dashboardService.executeMonitoring();
      // Recargar datos después del monitoreo
      await loadDashboardData();
      showToast('Monitoreo ejecutado exitosamente', 'success');
    } catch (error) {
      console.error('Error al ejecutar monitoreo:', error);
      showToast('Error al ejecutar monitoreo', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Navegación a páginas
  const handleNewCase = () => {
    navigate('/cases');
    showToast('Ir a Casos para crear un nuevo trámite', 'info');
  };

  const handleUploadDocument = () => {
    navigate('/mailroom');
    showToast('Ir a Mailroom para subir documentos', 'info');
  };

  const handleScheduleAppointment = () => {
    navigate('/appointments');
    showToast('Ir a Appointments para agendar citas', 'info');
  };

  const handleSearchCase = () => {
    navigate('/cases');
    showToast('Ir a Casos para buscar trámites', 'info');
  };
  
  // Filtrar datos según el rol
  const userCases = user?.role === 'cliente' 
    ? cases.filter(c => c.id === user.caseId) 
    : cases;
  
  // Calcular estadísticas dinámicas desde el contexto
  const activeCases = userCases.filter(c => c.status === 'ACTIVO').length;
  const pendingDocs = documents.filter(d => d.status === 'EN ESPERA' || d.status === 'PENDIENTE').length;
  const todayAppointments = appointments.filter(a => a.status === 'CONFIRMADA').length;
  const pendingProfiles = profiles.filter(p => p.status === 'PENDIENTE').length;
  
  // Stats según rol
  const getStats = () => {
    if (user?.role === 'cliente') {
      const myCase = userCases[0];
      return [
        { label: 'Estado del Trámite', value: myCase?.status || 'N/A', icon: 'folder_shared', color: 'bg-blue-500', isText: true },
        { label: 'Documentos del Caso', value: documents.filter(d => d.caseId === user.caseId).length, icon: 'description', color: 'bg-yellow-500' },
        { label: 'Citas Programadas', value: appointments.filter(a => a.caseId === user.caseId).length, icon: 'event', color: 'bg-green-500' },
        { label: 'Tipo de Visa', value: myCase?.type || 'N/A', icon: 'badge', color: 'bg-purple-500', isText: true },
      ];
    }
    
    return [
      { label: 'Trámites Activos', value: activeCases, icon: 'folder_shared', color: 'bg-blue-500' },
      { label: 'Documentos Pendientes', value: pendingDocs, icon: 'inbox', color: 'bg-yellow-500' },
      { label: 'Citas Confirmadas', value: todayAppointments, icon: 'event', color: 'bg-green-500' },
      { label: 'Validaciones Pendientes', value: pendingProfiles, icon: 'verified', color: 'bg-purple-500' },
    ];
  };
  
  const stats = getStats();
  
  // Actividad reciente filtrada por rol
  const getRecentActivity = () => {
    if (user?.role === 'cliente') {
      // Filtrar actividades del cliente
      const myActivities = activities.filter(a => a.caseId === user.caseId).slice(0, 5);
      return myActivities.length > 0 ? myActivities : [
        { action: 'No hay actividad reciente', case: 'N/A', time: '-' }
      ];
    }
    
    // Para agente, mostrar actividades desde el backend
    return activities.length > 0 
      ? activities.slice(0, 5).map(a => ({
          action: a.descripcion || a.action || 'Actividad',
          case: a.tramite_id || a.case || 'N/A',
          time: a.tiempo || a.time || 'Hace poco'
        }))
      : [
          { action: 'No hay actividad reciente', case: 'N/A', time: '-' }
        ];
  };
  
  const recentActivity = getRecentActivity();

  const getWelcomeMessage = () => {
    if (user?.role === 'cliente') return 'Estado de tu Trámite';
    if (user?.role === 'agente') return 'Panel de Agente';
    return 'Resumen general del sistema';
  };

  return (
    <Layout title={`Bienvenido, ${user?.name}`} subtitle={getWelcomeMessage()}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className={`${stat.isText ? 'text-xl' : 'text-3xl'} font-bold text-slate-900`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-white text-[24px]">
                    {stat.icon}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        {user?.role !== 'cliente' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={handleNewCase}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-[32px]">add_circle</span>
                <span className="text-sm font-medium text-slate-700">Nuevo Trámite</span>
              </button>
              <button 
                onClick={handleUploadDocument}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
                <span className="text-sm font-medium text-slate-700">Subir Documento</span>
              </button>
              <button 
                onClick={handleScheduleAppointment}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-[32px]">event</span>
                <span className="text-sm font-medium text-slate-700">Agendar Cita</span>
              </button>
              <button 
                onClick={handleSearchCase}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-[32px]">search</span>
                <span className="text-sm font-medium text-slate-700">Buscar Caso</span>
              </button>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Actividad Reciente</h2>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{item.action}</p>
                    <p className="text-xs text-slate-500">{item.case}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
