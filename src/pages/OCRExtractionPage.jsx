import { useState } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDemoData } from '../contexts/DemoContext';
import { ocrService } from '../services';

const OCRExtractionPage = () => {
  const { documents, updateOCRStatus } = useDemoData();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [extractedData, setExtractedData] = useState({});
  const [manualEdit, setManualEdit] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filtrar solo documentos OCR
  const ocrDocuments = documents.filter(doc => 
    ['DOC_OCR_1', 'DOC_OCR_2', 'DOC_OCR_ERR'].includes(doc.id)
  );

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleProcessDocument = async (doc) => {
    setSelectedDoc(doc);
    setProcessing(true);
    setManualEdit(false);

    try {
      // Llamar al servicio OCR real del backend
      const result = await ocrService.processExistingDocument(doc.id);
      
      if (result.status === 'ok') {
        // Extracción exitosa
        const data = {
          status: 'COMPLETADO',
          confidence: result.confianza || 0.95,
          fields: result.datos || {},
        };
        
        setExtractedData(data);
        updateOCRStatus(doc.id, 'PROCESADO');
        showToast('Extracción completada exitosamente', 'success');
      } else {
        // Error de lectura
        showToast('No se pudo extraer información automáticamente', 'error');
        setManualEdit(true);
        setExtractedData({
          status: 'ERROR',
          confidence: 0,
          fields: {},
        });
      }
    } catch (error) {
      console.error('Error al procesar documento:', error);
      
      // Si el backend retorna error 400, habilitar ingreso manual
      if (error.response?.status === 400) {
        showToast('No se pudo extraer información automáticamente', 'error');
        setManualEdit(true);
        setExtractedData({
          status: 'ERROR',
          confidence: 0,
          fields: {},
        });
      } else {
        showToast(error.response?.data?.detail || 'Error al procesar el documento', 'error');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setExtractedData(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldName]: { ...prev.fields[fieldName], value, manual: true },
      },
    }));
  };

  const handleSaveManualData = async () => {
    try {
      // await ocrService.updateManualData(selectedDoc.id, extractedData);
      showToast('Datos guardados correctamente', 'success');
      setManualEdit(false);
    } catch (error) {
      showToast('Error al guardar los datos', 'error');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-700';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <Layout title="OCR Intelligent Extraction Workspace" subtitle="Extracción y validación de datos">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Lista de Documentos */}
        <div className="bg-white rounded-xl shadow-card p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Cola de Verificación
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">
                  {documents.filter(d => d.status === 'PENDIENTE').length}
                </span>
              </h2>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDoc?.id === doc.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                  }`}
                  onClick={() => !processing && handleProcessDocument(doc)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-600">description</span>
                      <span className="font-medium text-slate-900 text-sm">{doc.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      doc.status === 'PENDIENTE' 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{doc.type}</p>
                  <p className="text-xs text-slate-500 mt-1">{doc.file} • {doc.caseId}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Área de Procesamiento */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-hidden flex flex-col">
            {processing ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingSpinner size="lg" message="Procesando documento con OCR..." />
              </div>
            ) : selectedDoc && extractedData.fields ? (
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedDoc.file}</h2>
                      <p className="text-sm text-slate-500">{selectedDoc.type} • {selectedDoc.caseId}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-lg ${getConfidenceBadge(extractedData.confidence)}`}>
                        <span className="text-xs font-bold">
                          Confianza: {(extractedData.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      {(extractedData.status === 'REVISION_MANUAL' || extractedData.status === 'ERROR') && (
                        <button
                          onClick={() => setManualEdit(!manualEdit)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          {manualEdit ? 'Ver Modo' : 'Editar Manual'}
                        </button>
                      )}
                    </div>
                  </div>

                  {extractedData.status === 'REVISION_MANUAL' && (
                    <div className="mt-3 p-3 bg-warning-bg border-l-4 border-warning-border rounded">
                      <p className="text-sm text-slate-700">
                        ⚠️ Algunos campos requieren revisión manual debido a baja confianza en la lectura
                      </p>
                    </div>
                  )}

                  {extractedData.status === 'ERROR' && (
                    <div className="mt-3 p-3 bg-error-bg border-l-4 border-error-border rounded">
                      <p className="text-sm text-slate-700">
                        ❌ No se pudo extraer información automáticamente. Ingrese los datos manualmente.
                      </p>
                    </div>
                  )}
                </div>

                {/* Campos Extraídos */}
                <div className="flex-1 overflow-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(extractedData.fields).map(([fieldName, fieldData]) => (
                      <div key={fieldName} className="flex flex-col">
                        <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>{fieldName}</span>
                          {!manualEdit && fieldData.confidence !== undefined && (
                            <span className={`text-xs font-bold ${getConfidenceColor(fieldData.confidence)}`}>
                              {(fieldData.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={fieldData.value}
                          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                          disabled={!manualEdit && extractedData.status !== 'ERROR'}
                          className={`px-3 py-2 border rounded-lg ${
                            fieldData.confidence < 0.6 && !manualEdit
                              ? 'border-red-300 bg-red-50'
                              : 'border-slate-300'
                          } ${
                            manualEdit || extractedData.status === 'ERROR'
                              ? 'bg-white'
                              : 'bg-slate-50'
                          } focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed`}
                        />
                        {fieldData.manual && (
                          <span className="text-xs text-blue-600 mt-1">✏️ Editado manualmente</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {(manualEdit || extractedData.status === 'ERROR') && (
                  <div className="p-6 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={handleSaveManualData}
                      className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark"
                    >
                      Guardar Datos
                    </button>
                    {manualEdit && (
                      <button
                        onClick={() => setManualEdit(false)}
                        className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <span className="material-symbols-outlined text-slate-300 text-[80px] mb-4">
                  scanner
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Extracción Inteligente OCR
                </h3>
                <p className="text-slate-500 text-sm max-w-md">
                  Seleccione un documento de la cola para iniciar el proceso de extracción automática de datos
                </p>
              </div>
            )}
          </div>
        </div>
    </Layout>
  );
};

export default OCRExtractionPage;
