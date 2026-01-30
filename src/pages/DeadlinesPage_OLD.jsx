import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { dashboardService } from '../services';

const DeadlinesPage = () => {
  const [deadlines, setDeadlines] = useState([]);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all'); // all, urgent, upcoming
  const [selectedDeadline, setSelectedDeadline] = useState(null);
  const [showReagendarModal, setShowReagendarModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getSummary();
      setDeadlines(data.items_tareas || []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      setDeadlines([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleReagendar = async () => {
    if (!nuevaFecha) {
      showToast('Debe seleccionar una nueva fecha', 'warning');
      return;
    }

    try {
      setLoading(true);
      await dashboardService.reagendarTarea(selectedDeadline.id, nuevaFecha);
      showToast('Evento reagendado exitosamente', 'success');
      setShowReagendarModal(false);
      setSelectedDeadline(null);
      setNuevaFecha('');
      await loadDeadlines();
    } catch (error) {
      console.error('Error al reagendar:', error);
      showToast(error.response?.data?.detail || 'Error al reagendar evento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!motivo.trim()) {
      showToast('Debe proporcionar un motivo de cancelación', 'warning');
      return;
    }

    try {
      setLoading(true);
      await dashboardService.cancelarTarea(selectedDeadline.id, motivo);
      showToast('Evento cancelado exitosamente', 'success');
      setShowCancelarModal(false);
      setSelectedDeadline(null);
      setMotivo('');
      await loadDeadlines();
    } catch (error) {
      console.error('Error al cancelar:', error);
      showToast(error.response?.data?.detail || 'Error al cancelar evento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[priority] || colors.medium;
  };

  const filteredDeadlines = deadlines.filter(d => {
    if (filter === 'urgent') return d.status === 'URGENT';
    if (filter === 'upcoming') return d.status === 'UPCOMING';
    return d.status !== 'COMPLETED';
  });

  return (
    <Layout title="Deadlines Control Tower" subtitle="Control de plazos y vencimientos">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Todos ({deadlines.filter(d => d.status !== 'COMPLETED').length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'urgent' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Urgentes ({deadlines.filter(d => d.status === 'URGENT').length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'upcoming' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Próximos ({deadlines.filter(d => d.status === 'UPCOMING').length})
          </button>
        </div>

        {/* Deadlines List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredDeadlines.map(deadline => {
            const daysLeft = getDaysRemaining(deadline.dueDate);
            return (
              <div
                key={deadline.id}
                className={`bg-white rounded-xl shadow-card p-5 border-l-4 ${
                  daysLeft <= 3 ? 'border-red-500' : daysLeft <= 7 ? 'border-yellow-500' : 'border-green-500'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-500">{deadline.caseId}</span>
                    </div>
                    <h3 className="font-bold text-slate-900">{deadline.title}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Vence: {deadline.dueDate}</p>
                    <p className={`text-xs font-medium mt-1 ${
                      daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {daysLeft > 0 ? `${daysLeft} días restantes` : daysLeft === 0 ? 'Vence hoy' : 'Vencido'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteDeadline(deadline.id)}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                  >
                    Completar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default DeadlinesPage;
