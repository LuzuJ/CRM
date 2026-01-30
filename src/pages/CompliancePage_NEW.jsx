import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { caseService, perfilesService } from '../services';

const CompliancePage = () => {
  const [tramites, setTramites] = useState([]);
  const [selectedTramite, setSelectedTramite] = useState('');
  const [perfiles, setPerfiles] = useState([]);
  const [selectedPerfil, setSelectedPerfil] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTramites();
  }, []);

  useEffect(() => {
    if (selectedTramite) {
      loadPerfilesByTramite();
    }
  }, [selectedTramite]);

  const loadTramites = async () => {
    try {
      const data = await caseService.listCases();
      setTramites(data || []);
    } catch (error) {
      console.error('Error cargando trámites:', error);
      showToast('Error al cargar trámites', 'error');
    }
  };

  const loadPerfilesByTramite = async () => {
    setLoading(true);
    try {
      // Obtener todos los perfiles y filtrar por tramite (cliente_id)
      const tramite = await caseService.getCase(selectedTramite);
      const allPerfiles = await perfilesService.listarPerfiles();
      const perfilesFiltrados = allPerfiles.filter(p => p.cliente_id === tramite.solicitante_id);
      setPerfiles(perfilesFiltrados || []);
    } catch (error) {
      console.error('Error cargando perfiles:', error);
      showToast('Error al cargar perfiles del trámite', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenModal = async (perfil) => {
    setLoading(true);
    try {
      // Obtener datos completos del perfil
      const perfilCompleto = await perfilesService.obtenerPerfil(perfil.id);
      setSelectedPerfil(perfilCompleto);
      setEditedData({
        nombres_ocr: perfilCompleto.nombres_ocr || '',
        cedula_ocr: perfilCompleto.cedula_ocr || '',
        fecha_nacimiento_ocr: perfilCompleto.fecha_nacimiento_ocr || ''
      });
      setShowModal(true);
      setEditMode(false);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      showToast('Error al cargar detalles del perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleModifyInfo = async () => {
    setLoading(true);
    try {
      await perfilesService.actualizarPerfil(selectedPerfil.id, {
        ...editedData,
        modo_manual_habilitado: true
      });
      showToast('Información actualizada correctamente', 'success');
      setEditMode(false);
      // Recargar perfil actualizado
      const perfilActualizado = await perfilesService.obtenerPerfil(selectedPerfil.id);
      setSelectedPerfil(perfilActualizado);
      loadPerfilesByTramite();
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      showToast('Error al actualizar información', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      // Actualizar perfil como aceptado (puedes agregar un campo "aceptado" o cambiar estado)
      await perfilesService.actualizarPerfil(selectedPerfil.id, {
        estado_validacion: 'ACEPTADO'
      });
      showToast('Perfil aceptado exitosamente', 'success');
      setShowModal(false);
      loadPerfilesByTramite();
    } catch (error) {
      console.error('Error aceptando perfil:', error);
      showToast('Error al aceptar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (estado) => {
    switch (estado) {
      case 'VALIDADO_LEGALMENTE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BLOQUEO_LEGAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'FRAUDE':
        return 'bg-black text-white border-black';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACEPTADO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getAlertIcon = (estado) => {
    switch (estado) {
      case 'VALIDADO_LEGALMENTE':
        return '🟢';
      case 'BLOQUEO_LEGAL':
        return '🔴';
      case 'FRAUDE':
        return '⚫';
      case 'PENDIENTE':
        return '🟡';
      case 'ACEPTADO':
        return '✅';
      default:
        return '🟠';
    }
  };

  return (
    <Layout title="Validación Legal" subtitle="Revisión y aprobación de perfiles validados">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="space-y-6">
        {/* Selector de Trámite */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Seleccionar Trámite
          </label>
          <select
            value={selectedTramite}
            onChange={(e) => setSelectedTramite(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">-- Seleccione un trámite --</option>
            {tramites.map(tramite => (
              <option key={tramite.id} value={tramite.id}>
                {tramite.tipo} - {tramite.id} ({tramite.estado})
              </option>
            ))}
          </select>
        </div>

        {selectedTramite && (
          <div className="bg-white rounded-xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Perfiles del Trámite
            </h3>

            {loading ? (
              <div className="text-center py-12">
                <LoadingSpinner size="large" />
              </div>
            ) : perfiles.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-slate-300 text-[64px]">
                  person_off
                </span>
                <p className="text-slate-500 text-sm mt-4">
                  No hay perfiles asociados a este trámite
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {perfiles.map(perfil => (
                  <div
                    key={perfil.id}
                    onClick={() => handleOpenModal(perfil)}
                    className="p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                          badge
                        </span>
                        <span className="font-medium text-slate-900 text-sm">
                          {perfil.id}
                        </span>
                      </div>
                      <span className="text-2xl">{getAlertIcon(perfil.estado_validacion)}</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-500">Nombres</p>
                        <p className="font-medium text-slate-900">
                          {perfil.nombres_ocr || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Cédula</p>
                        <p className="font-medium text-slate-900">
                          {perfil.cedula_ocr || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getAlertColor(perfil.estado_validacion)}`}>
                          {perfil.estado_validacion}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Detalles */}
        {showModal && selectedPerfil && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Detalles del Perfil
                  </h2>
                  <p className="text-sm text-slate-500">ID: {selectedPerfil.id}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Estado de Validación */}
                <div className={`p-4 rounded-lg border-2 ${getAlertColor(selectedPerfil.estado_validacion)}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getAlertIcon(selectedPerfil.estado_validacion)}</span>
                    <div>
                      <p className="font-bold">Estado de Validación</p>
                      <p className="text-lg">{selectedPerfil.estado_validacion}</p>
                    </div>
                  </div>
                  {selectedPerfil.alerta_activa && (
                    <p className="mt-2 text-sm font-medium">
                      ⚠️ {selectedPerfil.alerta_activa}
                    </p>
                  )}
                </div>

                {/* Información OCR */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined">scan</span>
                    Información Extraída (OCR)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nombres
                      </label>
                      <input
                        type="text"
                        value={editedData.nombres_ocr}
                        onChange={(e) => setEditedData({ ...editedData, nombres_ocr: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Cédula
                      </label>
                      <input
                        type="text"
                        value={editedData.cedula_ocr}
                        onChange={(e) => setEditedData({ ...editedData, cedula_ocr: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        value={editedData.fecha_nacimiento_ocr}
                        onChange={(e) => setEditedData({ ...editedData, fecha_nacimiento_ocr: e.target.value })}
                        disabled={!editMode}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:bg-slate-50 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Validaciones Externas */}
                {selectedPerfil.registro_civil && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined">verified_user</span>
                      Registro Civil
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                      {Object.entries(selectedPerfil.registro_civil).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-slate-900">
                            {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPerfil.policia_migracion && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined">policy</span>
                      Policía y Migración
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-lg space-y-2 text-sm">
                      {Object.entries(selectedPerfil.policia_migracion).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-slate-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-slate-900">
                            {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motivo de Rechazo */}
                {selectedPerfil.motivo_rechazo && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">
                      <strong>Motivo de Rechazo:</strong> {selectedPerfil.motivo_rechazo}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer - Acciones */}
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={handleModifyInfo}
                      disabled={loading}
                      className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <LoadingSpinner size="small" /> : <span className="material-symbols-outlined">save</span>}
                      Guardar Cambios
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex-1 py-3 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">edit</span>
                      Modificar Info
                    </button>
                    <button
                      onClick={handleAccept}
                      disabled={loading}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <LoadingSpinner size="small" /> : <span className="material-symbols-outlined">check_circle</span>}
                      Aceptado
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompliancePage;
