import Layout from '../components/Layout';
import { useDemoData } from '../contexts/DemoContext';

const DashboardPage = () => {
  const { cases, documents, appointments, profiles } = useDemoData();
  
  // Calcular estadísticas dinámicas desde el contexto
  const activeCases = cases.filter(c => c.status === 'ACTIVO').length;
  const pendingDocs = documents.filter(d => d.status === 'EN ESPERA' || d.status === 'PENDIENTE').length;
  const todayAppointments = appointments.filter(a => a.status === 'CONFIRMADA').length;
  const pendingProfiles = profiles.filter(p => p.status === 'PENDIENTE').length;
  
  const stats = [
    { label: 'Trámites Activos', value: activeCases, icon: 'folder_shared', color: 'bg-blue-500' },
    { label: 'Documentos Pendientes', value: pendingDocs, icon: 'inbox', color: 'bg-yellow-500' },
    { label: 'Citas Confirmadas', value: todayAppointments, icon: 'event', color: 'bg-green-500' },
    { label: 'Validaciones Pendientes', value: pendingProfiles, icon: 'verified', color: 'bg-purple-500' },
  ];

  const recentActivity = [
    { action: 'Documento vinculado', case: 'TR-B02', time: '10 min' },
    { action: 'Cita agendada', case: 'TR-OK', time: '25 min' },
    { action: 'Validación completada', case: 'PERFIL_OK', time: '1 hora' },
    { action: 'OCR procesado', case: 'DOC_003', time: '2 horas' },
  ];

  return (
    <Layout title="Dashboard" subtitle="Resumen general del sistema">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
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
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-primary text-[32px]">add_circle</span>
              <span className="text-sm font-medium text-slate-700">Nuevo Trámite</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
              <span className="text-sm font-medium text-slate-700">Subir Documento</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-primary text-[32px]">event</span>
              <span className="text-sm font-medium text-slate-700">Agendar Cita</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/5 transition-all">
              <span className="material-symbols-outlined text-primary text-[32px]">search</span>
              <span className="text-sm font-medium text-slate-700">Buscar Caso</span>
            </button>
          </div>
        </div>

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
