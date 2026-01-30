import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { caseService, documentService, perfilesService } from '../services';

const OCRExtractionPage = () => {
  const [tramites, setTramites] = useState([]);
  const [selectedTramite, setSelectedTramite] = useState('');
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadTramites();
  }, []);

  useEffect(() => {
    if (selectedTramite) {
      loadDocumentsByTramite();
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

  const loadDocumentsByTramite = async () => {
    try {
      const tramite = await caseService.getCase(selectedTramite);
      setDocuments(tramite.documentos || []);
      setSelectedDoc(null);
      setExtractedData(null);
    } catch (error) {
      console.error('Error cargando documentos:', error);
      showToast('Error al cargar documentos del trámite', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleExtractOCR = async () => {
    if (!selectedDoc) return;

    setProcessing(true);
    setExtractedData(null);

    try {
      // Crear un archivo de prueba si el backend lo requiere
      // El backend debería poder procesar el documento que ya tiene
      // Si requiere el archivo, necesitas implementar un endpoint GET para obtenerlo
      
      // Por ahora, intentamos sin archivo (el backend debería usar el path almacenado)
      const result = await documentService.processOCR(selectedDoc.id);
      
      if (result && result.datos) {
        setExtractedData(result.datos);
        showToast('Información extraída exitosamente', 'success');
      } else {
        throw new Error('No se pudo extraer información');
      }
    } catch (error) {
      console.error('Error en extracción OCR:', error);
      
      // Mostrar más detalles del error
      const errorMsg = error.response?.data?.detail || error.message || 'Error al extraer información del documento';
      showToast(`Error OCR: ${errorMsg}`, 'error');
      
      // Si el error es 422, probablemente el backend espera un archivo
      if (error.response?.status === 422) {
        showToast('El documento requiere un archivo. Verifica que el documento tenga un archivo subido.', 'warning');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!extractedData) {
      showToast('No hay datos extraídos para crear el perfil', 'warning');
      return;
    }

    setCreatingProfile(true);

    try {
      // Obtener datos del trámite para el cliente_id
      const tramite = await caseService.getCase(selectedTramite);
      
      console.log('Datos extraídos:', extractedData);
      console.log('Trámite:', tramite);
      
      // Crear perfil con datos OCR
      const perfilData = {
        id: `PERFIL-${selectedDoc.id}`,
        cliente_id: tramite.solicitante_id,
        nombres_ocr: extractedData.nombres || extractedData.nombre || '',
        cedula_ocr: extractedData.cedula || extractedData.numero_cedula || '',
        fecha_nacimiento_ocr: extractedData.fecha_nacimiento || null
      };

      console.log('Datos del perfil a crear:', perfilData);

      const perfil = await perfilesService.crearPerfil(perfilData);
      showToast('Perfil creado exitosamente', 'success');

      // Ejecutar validación legal automáticamente
      const validacion = await perfilesService.validarPerfil(perfil.id);
      
      // Mostrar resultado de validación
      const alertColor = getAlertColor(validacion.estado_validacion);
      showToast(
        `Validación completada: ${validacion.estado_validacion}`,
        alertColor === 'green' ? 'success' : alertColor === 'red' ? 'error' : 'warning'
      );

      // Limpiar selección
      setSelectedDoc(null);
      setExtractedData(null);
      loadDocumentsByTramite();

    } catch (error) {
      console.error('Error creando perfil:', error);
      console.error('Detalles del error:', error.response?.data);
      
      // Mostrar mensaje de error más específico
      const errorMsg = error.response?.data?.detail || error.message || 'Error desconocido';
      showToast(`Error al crear perfil: ${errorMsg}`, 'error');
    } finally {
      setCreatingProfile(false);
    }
  };

  const getAlertColor = (estado) => {
    switch (estado) {
      case 'VALIDADO_LEGALMENTE':
        return 'green';
      case 'BLOQUEO_LEGAL':
        return 'red';
      case 'FRAUDE':
        return 'black';
      case 'PENDIENTE':
        return 'yellow';
      default:
        return 'orange';
    }
  };

  return (
    <Layout title="Validación OCR" subtitle="Extracción de información y creación de perfiles">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Documentos */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Documentos del Trámite
              </h3>
              
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-slate-300 text-[48px]">
                    description
                  </span>
                  <p className="text-slate-500 text-sm mt-2">Sin documentos disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedDoc?.id === doc.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary">
                          description
                        </span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {doc.nombre_archivo || doc.nombre}
                          </p>
                          <p className="text-sm text-slate-600">
                            {doc.categoria} - {doc.tipo}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                            doc.estado === 'VALIDADO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {doc.estado}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Panel de Extracción */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Extracción OCR
              </h3>

              {!selectedDoc ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-slate-300 text-[64px]">
                    touch_app
                  </span>
                  <p className="text-slate-500 text-sm mt-4">
                    Seleccione un documento para extraer información
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Información del documento seleccionado */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Documento seleccionado:</p>
                    <p className="font-medium text-slate-900">
                      {selectedDoc.nombre_archivo || selectedDoc.nombre}
                    </p>
                  </div>

                  {/* Botón de extracción */}
                  {!extractedData && (
                    <button
                      onClick={handleExtractOCR}
                      disabled={processing}
                      className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processing ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span>Extrayendo información...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">scan</span>
                          <span>Extraer información OCR</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Datos extraídos */}
                  {extractedData && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          ✓ Información extraída exitosamente
                        </p>
                      </div>

                      <div className="space-y-3">
                        {Object.entries(extractedData).map(([key, value]) => (
                          <div key={key} className="p-3 border border-slate-200 rounded-lg">
                            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="font-medium text-slate-900">
                              {value || 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Botón crear perfil */}
                      <button
                        onClick={handleCreateProfile}
                        disabled={creatingProfile}
                        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creatingProfile ? (
                          <>
                            <LoadingSpinner size="small" />
                            <span>Creando perfil y validando...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined">person_add</span>
                            <span>Crear Perfil y Validar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OCRExtractionPage;
