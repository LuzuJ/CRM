import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { citasService, caseService } from '../services';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('AGENTE_01');
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [toast, setToast] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [cases, setCases] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const agents = ['AGENTE_01', 'AGENTE_02', 'AGENTE_03'];

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedAgent) {
      loadAvailability();
    }
  }, [selectedDate, selectedAgent]);

  const loadData = async () => {
    try {
      const casesData = await caseService.getAllCases();
      setCases(casesData || []);

      const appointmentsData = await citasService.listarCitas();
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error al cargar datos', 'error');
    }
  };

  const loadAvailability = async () => {
    try {
      const availData = await citasService.consultarDisponibilidad(selectedDate, selectedAgent);
      setAvailability(availData || []);
    } catch (error) {
      console.error('Error loading availability:', error);
      showToast('Error al cargar disponibilidad', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateAppointment = async () => {
    if (!selectedCase || !selectedAgent || !selectedDate || !selectedTime) {
      showToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    setLoading(true);
    try {
      const citaData = {
        id: `CITA-${Date.now()}`,
        fecha: selectedDate,
        hora: selectedTime,
        agente_id: selectedAgent,
        tramite_id: selectedCase,
        estado: 'PROGRAMADA'
      };

      await citasService.crearCita(citaData);
      showToast('Cita creada exitosamente', 'success');
      
      await loadData();
      await loadAvailability();
      
      setSelectedCase('');
      setSelectedTime('');
    } catch (error) {
      console.error('Error creating appointment:', error);
      const errorMsg = error.response?.data?.detail || error.message;
      showToast('Error al crear la cita: ' + errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('¿Está seguro de cancelar esta cita?')) return;

    setLoading(true);
    try {
      await citasService.cancelarCita(appointmentId);
      showToast('Cita cancelada exitosamente', 'success');
      await loadData();
      await loadAvailability();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      showToast('Error al cancelar la cita: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = () => {
    return availability.filter(slot => 
      slot.agente_id === selectedAgent && slot.estado === 'LIBRE'
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  return (
    <Layout 
      title={user?.role === 'cliente' ? 'Mis Citas' : 'Intelligent Appointment Scheduler'} 
      subtitle={user?.role === 'cliente' ? 'Revisa tus citas programadas' : 'Gestión de citas y agendamiento'}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user?.role === 'agente' && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Nueva Cita</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Fecha</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Agente</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {agents.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Trámite</label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Seleccione un trámite</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.id} - {c.tipo || c.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Hora Disponible</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  disabled={!selectedAgent}
                >
                  <option value="">Seleccione una hora</option>
                  {getAvailableTimeSlots().map((slot, idx) => (
                    <option key={idx} value={slot.hora}>
                      {formatTime(slot.hora)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleCreateAppointment}
                disabled={loading || !selectedCase || !selectedTime}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando...' : 'Agendar Cita'}
              </button>
            </div>
          </div>
        )}

        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Disponibilidad - {selectedAgent} - {selectedDate}
          </h2>

          {availability.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <span className="material-symbols-outlined text-[48px] mb-3 block">calendar_today</span>
              <p>No hay horarios disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availability
                .filter(slot => slot.agente_id === selectedAgent)
                .map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 text-center ${
                      slot.estado === 'LIBRE'
                        ? 'border-success bg-success/5 text-success'
                        : 'border-error bg-error/5 text-error'
                    }`}
                  >
                    <div className="font-bold text-lg">{formatTime(slot.hora)}</div>
                    <div className="text-sm mt-1">{slot.estado}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Citas Programadas</h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <span className="material-symbols-outlined text-[48px] mb-3 block">event_busy</span>
            <p>No hay citas programadas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Trámite</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Agente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm">{apt.id}</td>
                    <td className="py-3 px-4 text-sm">{apt.tramite_id}</td>
                    <td className="py-3 px-4 text-sm">{apt.fecha}</td>
                    <td className="py-3 px-4 text-sm">{formatTime(apt.hora)}</td>
                    <td className="py-3 px-4 text-sm">{apt.agente_id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apt.estado === 'PROGRAMADA' ? 'bg-info/10 text-info' :
                        apt.estado === 'CANCELADA' ? 'bg-error/10 text-error' :
                        apt.estado === 'REAGENDADA' ? 'bg-warning/10 text-warning' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {apt.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {apt.estado !== 'CANCELADA' && user?.role === 'agente' && (
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          disabled={loading}
                          className="text-error hover:text-error-dark text-sm font-medium disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AppointmentsPage;
