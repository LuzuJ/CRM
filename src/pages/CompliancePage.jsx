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
      // Actualizar perfil como aceptado
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

  const handleValidarPerfil = async (perfilId) => {
    setLoading(true);
    try {
      const result = await perfilesService.validarPerfil(perfilId);
      setValidationResult(result);
      showToast('Validación completada', 'success');
      await loadPerfiles();
    } catch (error) {
      showToast('Error al validar perfil: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'VALIDADO_LEGALMENTE':
        return 'bg-success/10 text-success';
      case 'BLOQUEO_LEGAL':
        return 'bg-error/10 text-error';
      case 'FRAUDE':
        return 'bg-error/10 text-error';
      case 'PENDIENTE':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <Layout title="Legal Compliance Dashboard" subtitle="Validación de perfiles migratorios">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          + Nuevo Perfil
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Perfiles Registrados</h2>

        {perfiles.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <span className="material-symbols-outlined text-[48px] mb-3 block">person_off</span>
            <p>No hay perfiles registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nombres</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cédula</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha Nac.</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Alerta</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {perfiles.map(perfil => (
                  <tr key={perfil.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm">{perfil.id}</td>
                    <td className="py-3 px-4 text-sm">{perfil.nombres_ocr}</td>
                    <td className="py-3 px-4 text-sm">{perfil.cedula}</td>
                    <td className="py-3 px-4 text-sm">{perfil.fecha_nac_ocr}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(perfil.estado_validacion)}`}>
                        {perfil.estado_validacion}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {perfil.alerta_activa || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {perfil.estado_validacion === 'PENDIENTE' && (
                        <button
                          onClick={() => handleValidarPerfil(perfil.id)}
                          disabled={loading}
                          className="text-primary hover:text-primary-dark text-sm font-medium disabled:opacity-50"
                        >
                          Validar
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

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Crear Perfil</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">ID *</label>
                <input
                  type="text"
                  value={newPerfil.id}
                  onChange={(e) => setNewPerfil({...newPerfil, id: e.target.value})}
                  placeholder="PERFIL-001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Nombres *</label>
                <input
                  type="text"
                  value={newPerfil.nombres_ocr}
                  onChange={(e) => setNewPerfil({...newPerfil, nombres_ocr: e.target.value})}
                  placeholder="JUAN PEREZ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Cédula * (10 dígitos)</label>
                <input
                  type="text"
                  value={newPerfil.cedula}
                  onChange={(e) => setNewPerfil({...newPerfil, cedula: e.target.value})}
                  placeholder="1710010010"
                  maxLength="10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Prueba: 1710010010 (OK), 1720020020 (Bloqueo), 1730030030 (Fraude)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  value={newPerfil.fecha_nac_ocr}
                  onChange={(e) => setNewPerfil({...newPerfil, fecha_nac_ocr: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePerfil}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Crear
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {validationResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Resultado de Validación</h3>
            <div className="space-y-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(validationResult.estado_validacion)}`}>
                  {validationResult.estado_validacion}
                </span>
              </div>
              {validationResult.alerta && (
                <div className="bg-warning/10 border border-warning text-warning p-3 rounded-lg text-sm">
                  ⚠️ {validationResult.alerta}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                    Registro Civil
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Cédula:</span>
                      <span className="ml-2 font-medium">{validationResult.registro_civil?.cedula}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Estado Civil:</span>
                      <span className="ml-2 font-medium">{validationResult.registro_civil?.estado_civil}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Ciudadano Activo:</span>
                      <span className={`ml-2 font-medium ${validationResult.registro_civil?.ciudadano_activo ? 'text-success' : 'text-error'}`}>
                        {validationResult.registro_civil?.ciudadano_activo ? 'SÍ' : 'NO'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Nombres Oficiales:</span>
                      <span className="ml-2 font-medium">{validationResult.registro_civil?.nombres_oficiales}</span>
                    </div>
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">policy</span>
                    Policía de Migración
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-600">Impedimento Salida:</span>
                      <span className={`ml-2 font-medium ${validationResult.policia_migracion?.impedimento_salida ? 'text-error' : 'text-success'}`}>
                        {validationResult.policia_migracion?.impedimento_salida ? 'SÍ' : 'NO'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Motivo:</span>
                      <span className="ml-2 font-medium">{validationResult.policia_migracion?.motivo}</span>
                    </div>
                    {validationResult.policia_migracion?.error && (
                      <div className="bg-error/10 text-error p-2 rounded text-xs mt-2">
                        Error: {validationResult.policia_migracion.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {validationResult.requiere_confirmacion_manual && (
                <div className="bg-info/10 border border-info text-info p-3 rounded-lg text-sm">
                  ℹ️ Se requiere confirmación manual por discrepancia en los datos
                </div>
              )}
            </div>
            <button
              onClick={() => setValidationResult(null)}
              className="mt-6 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CompliancePage;
