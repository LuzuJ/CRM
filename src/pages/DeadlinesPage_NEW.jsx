import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { eventosService } from '../services';

const DeadlinesPage = () => {
  const [eventos, setEventos] = useState([]);
  const [eventosProximos, setEventosProximos] = useState([]);
  const [eventosVencidos, setEventosVencidos] = useState([]);
  const [umbralDias, setUmbralDias] = useState(5);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReagendarModal, setShowReagendarModal] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [nuevaFecha, setNuevaFecha] = useState('');

  useEffect(() => {
    loadEventos();
  }, [umbralDias]);

  const loadEventos = async () => {
    setLoading(true);
    try {
      const [proximos, vencidos, todos] = await Promise.all([
        eventosService.obtenerEventosProximos(umbralDias),
        eventosService.obtenerEventosVencidos(),
        eventosService.listarEventos()
      ]);
      
      setEventosProximos(proximos || []);
      setEventosVencidos(vencidos || []);
      setEventos(todos || []);
    } catch (error) {
      console.error('Error loading eventos:', error);
      showToast('Error al cargar eventos', 'error');
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
      showToast('Seleccione una nueva fecha', 'warning');
      return;
    }

    try {
      await eventosService.reagendarEvento(eventoSeleccionado.id, nuevaFecha);
      showToast('Evento reagendado exitosamente', 'success');
      setShowReagendarModal(false);
      setEventoSeleccionado(null);
      setNuevaFecha('');
      await loadEventos();
    } catch (error) {
      showToast('Error al reagendar evento: ' + error.message, 'error');
    }
  };

  const handleCancelar = async (eventoId) => {
    const motivo = prompt('Ingrese el motivo de cancelación:');
    if (!motivo) return;

    try {
      await eventosService.cancelarEvento(eventoId, motivo);
      showToast('Evento cancelado exitosamente', 'success');
      await loadEventos();
    } catch (error) {
      showToast('Error al cancelar evento: ' + error.message, 'error');
    }
  };

  const getDiasRestantes = (fechaLimite) => {
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    const diff = Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <Layout title="Deadlines Control Tower" subtitle="Monitoreo de fechas límite y eventos">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white rounded-xl shadow-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Umbral de alerta (días):</label>
          <input
            type="number"
            value={umbralDias}
            onChange={(e) => setUmbralDias(parseInt(e.target.value) || 5)}
            min="1"
            max="30"
            className="w-20 px-3 py-2 border border-slate-300 rounded-lg"
          />
          <button
            onClick={loadEventos}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-warning">warning</span>
            Próximos a Vencer ({eventosProximos.length})
          </h2>
          {eventosProximos.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay eventos próximos</p>
          ) : (
            <div className="space-y-3">
              {eventosProximos.map(evento => (
                <div key={evento.id} className="border border-warning bg-warning/5 rounded-lg p-4">
                  <div className="font-medium text-slate-900">{evento.tipo}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Fecha límite: {evento.fecha_limite}
                  </div>
                  <div className="text-sm text-warning font-medium mt-2">
                    ⚠️ Vence en {getDiasRestantes(evento.fecha_limite)} días
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Trámite: {evento.tramite_id}
                  </div>
                  {evento.notas && (
                    <div className="text-xs text-slate-500 mt-1 italic">
                      {evento.notas}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            Eventos Vencidos ({eventosVencidos.length})
          </h2>
          {eventosVencidos.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hay eventos vencidos</p>
          ) : (
            <div className="space-y-3">
              {eventosVencidos.map(evento => (
                <div key={evento.id} className="border border-error bg-error/5 rounded-lg p-4">
                  <div className="font-medium text-slate-900">{evento.tipo}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Fecha límite: {evento.fecha_limite}
                  </div>
                  <div className="text-sm text-error font-medium mt-2">
                    ❌ Vencido hace {Math.abs(getDiasRestantes(evento.fecha_limite))} días
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Estado: {evento.estado}
                  </div>
                  {evento.notas && (
                    <div className="text-xs text-slate-500 mt-1 italic">
                      {evento.notas}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        setEventoSeleccionado(evento);
                        setShowReagendarModal(true);
                      }}
                      className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark"
                    >
                      Reagendar
                    </button>
                    <button
                      onClick={() => handleCancelar(evento.id)}
                      className="px-3 py-1 bg-error text-white text-sm rounded-lg hover:bg-error-dark"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Todos los Eventos ({eventos.length})</h2>
        {eventos.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No hay eventos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tipo</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Trámite</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha Límite</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Días</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map(evento => {
                  const dias = getDiasRestantes(evento.fecha_limite);
                  return (
                    <tr key={evento.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm">{evento.id}</td>
                      <td className="py-3 px-4 text-sm">{evento.tipo}</td>
                      <td className="py-3 px-4 text-sm">{evento.tramite_id}</td>
                      <td className="py-3 px-4 text-sm">{evento.fecha_limite}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          evento.estado === 'PENDIENTE' ? 'bg-info/10 text-info' :
                          evento.estado === 'ATENCION_REQUERIDA' ? 'bg-error/10 text-error' :
                          evento.estado === 'COMPLETADO' ? 'bg-success/10 text-success' :
                          evento.estado === 'CANCELADO' ? 'bg-slate-100 text-slate-600' :
                          'bg-warning/10 text-warning'
                        }`}>
                          {evento.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {dias > 0 ? `+${dias}` : dias < 0 ? `${dias}` : 'Hoy'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showReagendarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Reagendar Evento</h3>
            <p className="text-sm text-slate-600 mb-4">
              Evento: {eventoSeleccionado?.tipo}
            </p>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Nueva Fecha</label>
              <input
                type="date"
                value={nuevaFecha}
                onChange={(e) => setNuevaFecha(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReagendar}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Confirmar
              </button>
              <button
                onClick={() => {
                  setShowReagendarModal(false);
                  setEventoSeleccionado(null);
                  setNuevaFecha('');
                }}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DeadlinesPage;
