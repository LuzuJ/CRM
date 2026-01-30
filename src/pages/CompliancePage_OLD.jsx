import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const CompliancePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleValidateProfile = async (profile) => {
    setSelectedProfile(profile);
    setValidating(true);
    setValidationResult(null);

    try {
      // await validationService.validateProfile(profile.id);
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      let result = {};

      // Simulación basada en el perfil
      switch (profile.id) {
        case 'PERFIL_1':
        case 'PERFIL_OK':
          result = {
            status: 'VALIDADO_LEGALMENTE',
            civilRegistry: {
              active: true,
              civilStatus: 'CASADO',
              officialName: profile.name || 'MARIA FERNANDA GONZALEZ PEREZ',
              match: true,
            },
            migrationPolice: {
              impediment: false,
              reason: 'N/A',
            },
            message: 'Perfil validado exitosamente',
          };
          showToast('Perfil validado exitosamente', 'success');
          break;

        case 'PERFIL_2':
        case 'PERFIL_IMP':
          result = {
            status: 'BLOQUEO_LEGAL',
            civilRegistry: {
              active: true,
              civilStatus: 'CASADO',
              officialName: profile.name || 'JUAN CARLOS RODRIGUEZ LOPEZ',
              match: true,
            },
            migrationPolice: {
              impediment: true,
              reason: 'JUICIO ALIMENTOS',
            },
            message: 'Cliente con restricción migratoria vigente',
          };
          showToast('Cliente con restricción migratoria vigente', 'error');
          break;

        case 'PERFIL_3':
        case 'PERFIL_RIP':
          result = {
            status: 'VALIDADO_LEGALMENTE',
            civilRegistry: {
              active: true,
              civilStatus: 'SOLTERO',
              officialName: profile.name || 'ANA PATRICIA MARTINEZ SILVA',
              match: true,
            },
            migrationPolice: {
              impediment: false,
              reason: 'N/A',
            },
            message: 'Perfil validado exitosamente',
          };
          showToast('Perfil validado exitosamente', 'success');
          break;

        case 'PERFIL_ERR':
          result = {
            status: 'PENDIENTE',
            civilRegistry: {
              active: true,
              civilStatus: 'SOLTERO',
              officialName: 'CARLOS ERROR',
              match: true,
            },
            migrationPolice: {
              error: 'TIMEOUT',
              reason: 'ERROR DE CONEXION',
            },
            message: 'Error al consultar servicios externos',
            allowManualValidation: true,
          };
          showToast('Error al consultar servicios externos', 'warning');
          break;

        default:
          // Para cualquier perfil no reconocido, validar exitosamente
          result = {
            status: 'VALIDADO_LEGALMENTE',
            civilRegistry: {
              active: true,
              civilStatus: 'SOLTERO',
              officialName: profile.name,
              match: true,
            },
            migrationPolice: {
              impediment: false,
              reason: 'N/A',
            },
            message: 'Perfil validado exitosamente',
          };
          showToast('Perfil validado exitosamente', 'success');
          break;
      }

      setValidationResult(result);

      // Actualizar estado del perfil en contexto global
      updateProfileStatus(profile.id, result.status);
    } catch (error) {
      showToast('Error durante la validación', 'error');
    } finally {
      setValidating(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-700',
      'VALIDADO_LEGALMENTE': 'bg-green-100 text-green-700',
      'BLOQUEO_LEGAL': 'bg-red-100 text-red-700',
      'FRAUDE': 'bg-purple-100 text-purple-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'PENDIENTE': 'pending',
      'VALIDADO_LEGALMENTE': 'check_circle',
      'BLOQUEO_LEGAL': 'block',
      'FRAUDE': 'report',
    };
    return icons[status] || 'help';
  };

  return (
    <Layout title="Legal Compliance Dashboard" subtitle="Validación de perfiles migratorios">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Lista de Perfiles */}
        <div className="bg-white rounded-xl shadow-card p-6 overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Cola de Validación
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                {profiles.filter(p => p.status === 'PENDIENTE').length} Pendientes
              </span>
            </h2>

            <div className="flex-1 overflow-auto space-y-3">
              {profiles.map(profile => (
                <div
                  key={profile.id}
                  onClick={() => !validating && handleValidateProfile(profile)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedProfile?.id === profile.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{profile.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadge(profile.status)}`}>
                      {profile.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">CI: {profile.cedula}</p>
                  <p className="text-xs text-slate-500 mt-1">Nacimiento: {profile.birthDate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Panel de Validación */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-hidden flex flex-col">
            {validating ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="lg" message="Validando con servicios externos..." />
              </div>
            ) : selectedProfile && validationResult ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedProfile.name}</h2>
                      <p className="text-sm text-slate-500">CI: {selectedProfile.cedula}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusBadge(validationResult.status)}`}>
                      <span className="material-symbols-outlined text-[20px]">
                        {getStatusIcon(validationResult.status)}
                      </span>
                      <span className="font-bold text-sm">{validationResult.status}</span>
                    </div>
                  </div>

                  {/* Alert Message */}
                  {validationResult.status === 'BLOQUEO_LEGAL' && (
                    <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-600">gavel</span>
                        <p className="font-bold text-red-900">{validationResult.message}</p>
                      </div>
                    </div>
                  )}

                  {validationResult.status === 'FRAUDE' && (
                    <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                      <p className="font-bold text-purple-900">{validationResult.message}</p>
                    </div>
                  )}

                  {validationResult.allowManualValidation && (
                    <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                      <p className="text-sm text-yellow-900">{validationResult.message}</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Se permite validación manual por evidencia física
                      </p>
                    </div>
                  )}
                </div>

                {/* Resultados de Validación */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                  {/* Registro Civil */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary">account_circle</span>
                      <h3 className="font-bold text-slate-900">Registro Civil</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Estado Ciudadano</p>
                        <p className={`font-medium ${validationResult.civilRegistry.active ? 'text-green-600' : 'text-red-600'}`}>
                          {validationResult.civilRegistry.active ? 'ACTIVO' : 'INACTIVO'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Estado Civil</p>
                        <p className="font-medium text-slate-900">{validationResult.civilRegistry.civilStatus}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Nombre Oficial</p>
                        <p className="font-medium text-slate-900">{validationResult.civilRegistry.officialName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Coincidencia</p>
                        <p className={`font-medium ${validationResult.civilRegistry.match ? 'text-green-600' : 'text-red-600'}`}>
                          {validationResult.civilRegistry.match ? '✓ Coincide' : '✗ No coincide'}
                        </p>
                      </div>
                      {validationResult.civilRegistry.reason && (
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500 mb-1">Motivo</p>
                          <p className="font-medium text-red-600">{validationResult.civilRegistry.reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Policía de Migración */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-primary">shield</span>
                      <h3 className="font-bold text-slate-900">Policía de Migración</h3>
                    </div>
                    {validationResult.migrationPolice.error ? (
                      <div className="bg-yellow-50 rounded p-3">
                        <p className="text-sm font-medium text-yellow-900">
                          Error: {validationResult.migrationPolice.error}
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {validationResult.migrationPolice.reason}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Impedimento de Salida</p>
                          <p className={`font-medium ${validationResult.migrationPolice.impediment ? 'text-red-600' : 'text-green-600'}`}>
                            {validationResult.migrationPolice.impediment ? 'SÍ' : 'NO'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Motivo</p>
                          <p className="font-medium text-slate-900">{validationResult.migrationPolice.reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-slate-100">
                  {validationResult.allowManualValidation && (
                    <button className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark">
                      Aprobar Validación Manual
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-slate-300 text-[80px] mb-4">
                  verified_user
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Validación de Perfil Legal
                </h3>
                <p className="text-slate-500 text-sm max-w-md">
                  Seleccione un perfil para iniciar la validación contra Registro Civil y Policía de Migración
                </p>
              </div>
            )}
          </div>
        </div>
    </Layout>
  );
};

export default CompliancePage;
