import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useDemoData } from '../contexts/DemoContext';
import { useAuth } from '../contexts/AuthContext';

const AppointmentsPage = () => {
  const { appointments, cases, agents, addAppointment, cancelAppointment } = useDemoData();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [toast, setToast] = useState(null);
  
  // Filtrar citas según el rol
  const userAppointments = user?.role === 'cliente'
    ? appointments.filter(a => a.caseId === user.caseId)
    : appointments;
  const [availability, setAvailability] = useState([
    { agentId: 'AGENTE_01', time: '10:00', status: 'OCUPADO', appointmentId: 'CITA_100' },
    { agentId: 'AGENTE_01', time: '11:00', status: 'LIBRE', appointmentId: null },
    { agentId: 'AGENTE_01', time: '12:00', status: 'LIBRE', appointmentId: null },
    { agentId: 'AGENTE_02', time: '10:00', status: 'LIBRE', appointmentId: null },
    { agentId: 'AGENTE_02', time: '11:00', status: 'LIBRE', appointmentId: null },
  ]);

  useEffect(() => {
    // Establecer fecha actual por defecto
    setSelectedDate('2025-06-15'); // Usar fecha del escenario
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateAppointment = async () => {
    if (!selectedCase || !selectedAgent || !selectedDate || !selectedTime) {
      showToast('Complete todos los campos requeridos', 'warning');
      return;
    }

    // Validar estado legal del trámite
    const targetCase = cases.find(c => c.id === selectedCase);
    if (targetCase.status === 'BLOQUEADO_LEGAL') {
      showToast('No se puede agendar citas para un trámite con impedimentos legales pendientes', 'error');
      return;
    }

    // Validar disponibilidad
    const slot = availability.find(
      a => a.agentId === selectedAgent && a.time === selectedTime
    );
    if (!slot || slot.status === 'OCUPADO') {
      showToast('El horario seleccionado no está disponible', 'error');
      return;
    }

    try {
      // await appointmentService.createAppointment({ ... });
      
      const newAppointment = {
        id: `CITA_${Date.now()}`,
        caseId: selectedCase,
        agentId: selectedAgent,
        date: selectedDate,
        time: selectedTime,
        status: 'CONFIRMADA',
      };

      setAppointments([...appointments, newAppointment]);
      
      // Actualizar disponibilidad
      setAvailability(prev => prev.map(a => 
        a.agentId === selectedAgent && a.time === selectedTime
          ? { ...a, status: 'OCUPADO', appointmentId: newAppointment.id }
          : a
      ));

      showToast('Cita agendada exitosamente', 'success');
      
      // Limpiar formulario
      setSelectedCase('');
      setSelectedAgent('');
      setSelectedTime('');
    } catch (error) {
      showToast('Error al crear la cita', 'error');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      // await appointmentService.cancelAppointment(appointmentId);
      
      const appointment = appointments.find(a => a.id === appointmentId);
      
      cancelAppointment(appointmentId);

      // Liberar el horario
      setAvailability(prev => prev.map(a => 
        a.appointmentId === appointmentId
          ? { ...a, status: 'LIBRE', appointmentId: null }
          : a
      ));

      showToast('Cita cancelada exitosamente', 'success');
    } catch (error) {
      showToast('Error al cancelar la cita', 'error');
    }
  };

  const getTimeSlots = () => {
    if (!selectedAgent) return [];
    return availability.filter(a => a.agentId === selectedAgent);
  };

  return (
    <Layout 
      title={user?.role === 'cliente' ? 'Mis Citas' : 'Intelligent Appointment Scheduler'} 
      subtitle={user?.role === 'cliente' ? 'Revisa tus citas programadas' : 'Gestión de citas y agendamiento'}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Agendamiento - Solo para agentes */}
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
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Trámite</label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Seleccione un trámite</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id} disabled={c.status === 'BLOQUEADO_LEGAL'}>
                      {c.id} - {c.applicant} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Agente</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Seleccione un agente</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} - {a.specialty}
                    </option>
                  ))}
                </select>
              </div>

              {selectedAgent && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Horario</label>
                  <div className="grid grid-cols-2 gap-2">
                    {getTimeSlots().map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => slot.status === 'LIBRE' && setSelectedTime(slot.time)}
                        disabled={slot.status === 'OCUPADO'}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot.time
                            ? 'bg-primary text-white'
                            : slot.status === 'LIBRE'
                            ? 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                        {slot.status === 'OCUPADO' && ' ✕'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateAppointment}
                disabled={!selectedCase || !selectedAgent || !selectedDate || !selectedTime}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Agendar Cita
              </button>
            </div>
          </div>
        )}

          {/* Lista de Citas */}
          <div className={user?.role === 'cliente' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <div className="bg-white rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {user?.role === 'cliente' ? 'Mis Citas Programadas' : 'Citas Programadas'}
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({userAppointments.filter(a => a.status === 'CONFIRMADA').length})
              </span>
            </h2>

            <div className="space-y-3">
              {userAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-slate-300 text-[64px]">
                    event_available
                  </span>
                  <p className="text-slate-500 mt-3">No hay citas programadas</p>
                </div>
              ) : (
                userAppointments.map(apt => {
                  const caseData = cases.find(c => c.id === apt.caseId);
                  const agentData = agents.find(a => a.id === apt.agentId);

                  return (
                    <div key={apt.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="material-symbols-outlined text-primary">event</span>
                            <div>
                              <p className="font-medium text-slate-900">{caseData?.applicant}</p>
                              <p className="text-sm text-slate-600">{caseData?.type} - {apt.caseId}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                            <div>
                              <p className="text-xs text-slate-500">Fecha</p>
                              <p className="font-medium text-slate-700">{apt.date}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Hora</p>
                              <p className="font-medium text-slate-700">{apt.time}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Agente</p>
                              <p className="font-medium text-slate-700">{agentData?.name}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Estado</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                apt.status === 'CONFIRMADA' 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        {user?.role === 'agente' && (
                          <div className="flex gap-2">
                            {apt.status === 'CONFIRMADA' && (
                              <>
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                  <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(apt.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          </div>
        </div>
    </Layout>
  );
};

export default AppointmentsPage;
