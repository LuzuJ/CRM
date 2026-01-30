import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { caseService, clienteService } from '../services';

const CasesPage = () => {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, closed
  const [cases, setCases] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCase, setNewCase] = useState({
    tipo_visa: 'TURISMO',
    estado: 'ACTIVO',
    solicitante_id: '',
    // Para crear cliente si no existe
    crear_cliente: true,
    cliente_nombres: '',
    cliente_cedula: '',
    cliente_fecha_nac: ''
  });

  // Cargar casos desde el backend al montar el componente
  useEffect(() => {
    loadCasesFromBackend();
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await clienteService.listarClientes();
      setClientes(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const loadCasesFromBackend = async () => {
    try {
      setLoading(true);
      
      // El backend ya filtra los trámites según el usuario autenticado usando el token
      // GET /tramites/ retorna todos los trámites (si es agente) o solo los del usuario (si es cliente)
      const data = await caseService.listCases();
      
      // Mapear datos del backend al formato esperado
      const mappedCases = (data || []).map(c => ({
        id: c.id || '',
        type: c.tipo || c.tipo_visa || 'N/A',
        applicant: c.solicitante_id || 'N/A',
        status: c.estado || 'ACTIVO',
        legalStatus: 'PENDIENTE',
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdate: new Date().toISOString().split('T')[0]
      }));
      setCases(mappedCases);
    } catch (error) {
      console.error('Error al cargar casos del backend:', error);
      showToast('Error al cargar trámites. Verifica que el backend esté corriendo.', 'error');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar casos según el rol del usuario (ya filtrado en el backend)
  const userCases = cases;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateCase = async () => {
    // Validar campos
    if (!newCase.tipo_visa) {
      showToast('Seleccione un tipo de visa', 'warning');
      return;
    }

    // Si se quiere crear un cliente nuevo, validar campos
    if (newCase.crear_cliente) {
      if (!newCase.cliente_nombres || !newCase.cliente_cedula || !newCase.cliente_fecha_nac) {
        showToast('Complete los datos del cliente (nombres, cédula, fecha de nacimiento)', 'warning');
        return;
      }
    } else {
      if (!newCase.solicitante_id) {
        showToast('Seleccione un cliente existente', 'warning');
        return;
      }
    }

    try {
      setLoading(true);
      
      let clienteId = newCase.solicitante_id;

      // 1. Crear cliente si es necesario
      if (newCase.crear_cliente) {
        const clienteData = {
          id: `CLI-${Date.now()}`,
          nombres: newCase.cliente_nombres,
          cedula: newCase.cliente_cedula,
          fecha_nacimiento: newCase.cliente_fecha_nac,
          estado_legal: 'LIMPIO'
        };

        try {
          const nuevoCliente = await clienteService.crearCliente(clienteData);
          clienteId = nuevoCliente.id;
          showToast('Cliente creado exitosamente', 'success');
          await loadClientes();
        } catch (error) {
          if (error.response?.status === 400) {
            showToast('Ya existe un cliente con esa cédula', 'error');
            return;
          }
          throw error;
        }
      }

      // 2. Generar ID del trámite basado en el tipo de visa
      const prefijos = {
        'TURISMO': 'TR-A',
        'TRABAJO': 'TR-B',
        'ESTUDIO': 'TR-C',
        'FAMILIAR': 'TR-D',
        'RESIDENCIA': 'TR-E'
      };
      
      const prefijo = prefijos[newCase.tipo_visa] || 'TR-X';
      const numero = String(Date.now()).slice(-2).padStart(2, '0');
      const tramiteId = `${prefijo}${numero}`;

      // 3. Crear el trámite
      const tramiteData = {
        id: tramiteId,
        tipo: newCase.tipo_visa,
        solicitante_id: clienteId,
        estado: newCase.estado || 'ACTIVO'
      };
      
      await caseService.createCase(tramiteData);
      showToast(`Trámite ${tramiteId} creado exitosamente`, 'success');
      setShowCreateModal(false);
      resetForm();
      await loadCasesFromBackend();
    } catch (error) {
      console.error('Error al crear trámite:', error);
      showToast(error.response?.data?.detail || 'Error al crear el trámite', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewCase({
      tipo_visa: 'TURISMO',
      estado: 'ACTIVO',
      solicitante_id: '',
      crear_cliente: true,
      cliente_nombres: '',
      cliente_cedula: '',
      cliente_fecha_nac: ''
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'ACTIVO': 'bg-green-100 text-green-700',
      'CERRADO': 'bg-slate-100 text-slate-700',
      'ARCHIVADO': 'bg-purple-100 text-purple-700',
      'BLOQUEADO': 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'ACTIVO': 'check_circle',
      'CERRADO': 'cancel',
      'ARCHIVADO': 'archive',
      'BLOQUEADO': 'block',
    };
    return icons[status] || 'folder';
  };

  const filteredCases = userCases.filter(c => {
    if (filter === 'active') return c.status === 'ACTIVO';
    if (filter === 'closed') return c.status === 'CERRADO' || c.status === 'ARCHIVADO';
    return true;
  });

  const pageTitle = user?.role === 'cliente' ? 'Mi Trámite' : 'Gestión de Casos';
  const pageSubtitle = user?.role === 'cliente' 
    ? 'Estado de tu trámite migratorio' 
    : 'Todos los trámites migratorios';

  return (
    <Layout title={pageTitle} subtitle={pageSubtitle}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="space-y-6">
          {/* Header con botón de crear */}
          {user?.role === 'agente' && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Nuevo Trámite
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Casos Activos</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {userCases.filter(c => c.status === 'ACTIVO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[24px]">
                    folder_open
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Casos Cerrados</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {userCases.filter(c => c.status === 'CERRADO').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-slate-500 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[24px]">
                    task_alt
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Total de Casos</p>
                  <p className="text-3xl font-bold text-slate-900">{cases.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-[24px]">
                    folder_shared
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'all' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Todos ({userCases.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'active' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Activos ({userCases.filter(c => c.status === 'ACTIVO').length})
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'closed' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Finalizados ({userCases.filter(c => c.status === 'CERRADO' || c.status === 'ARCHIVADO').length})
            </button>
          </div>

          {/* Cases List */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tipo de Visa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Última Actualización
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCases.map(caseItem => (
                    <tr key={caseItem.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            {getStatusIcon(caseItem.status)}
                          </span>
                          <span className="font-medium text-slate-900">{caseItem.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{caseItem.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-700">{caseItem.applicant}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(caseItem.status)}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-500">{caseItem.lastUpdate}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/cases/${caseItem.id}`}
                          className="text-primary hover:text-primary-dark font-medium text-sm"
                        >
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>

      {/* Modal para crear trámite */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Crear Nuevo Trámite</h3>
            
            <div className="space-y-4">
              {/* Tipo de Visa */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Tipo de Visa *</label>
                <select
                  value={newCase.tipo_visa}
                  onChange={(e) => setNewCase({...newCase, tipo_visa: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="TURISMO">Visa Turismo (TR-A)</option>
                  <option value="TRABAJO">Visa Trabajo (TR-B)</option>
                  <option value="ESTUDIO">Visa Estudio (TR-C)</option>
                  <option value="FAMILIAR">Visa Familiar (TR-D)</option>
                  <option value="RESIDENCIA">Residencia (TR-E)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">El ID se generará automáticamente según el tipo</p>
              </div>

              {/* Estado */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Estado</label>
                <select
                  value={newCase.estado}
                  onChange={(e) => setNewCase({...newCase, estado: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="CERRADO">CERRADO</option>
                  <option value="ARCHIVADO">ARCHIVADO</option>
                </select>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="crear_cliente"
                    checked={newCase.crear_cliente}
                    onChange={(e) => setNewCase({...newCase, crear_cliente: e.target.checked})}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="crear_cliente" className="text-sm font-medium text-slate-700">
                    Crear nuevo cliente
                  </label>
                </div>

                {newCase.crear_cliente ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Nombres Completos *</label>
                      <input
                        type="text"
                        value={newCase.cliente_nombres}
                        onChange={(e) => setNewCase({...newCase, cliente_nombres: e.target.value})}
                        placeholder="Juan Pérez González"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Cédula *</label>
                      <input
                        type="text"
                        value={newCase.cliente_cedula}
                        onChange={(e) => setNewCase({...newCase, cliente_cedula: e.target.value})}
                        placeholder="1710010010"
                        maxLength="10"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        value={newCase.cliente_fecha_nac}
                        onChange={(e) => setNewCase({...newCase, cliente_fecha_nac: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Seleccionar Cliente Existente *</label>
                    <select
                      value={newCase.solicitante_id}
                      onChange={(e) => setNewCase({...newCase, solicitante_id: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">-- Seleccione un cliente --</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombres} - {cliente.cedula}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCase}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Trámite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CasesPage;
