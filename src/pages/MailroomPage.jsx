import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import DocumentViewer from '../components/DocumentViewer';
import { documentService, caseService } from '../services';

const MailroomPage = () => {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedCase, setSelectedCase] = useState('');
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [newDocument, setNewDocument] = useState({
    id: '',
    nombre_archivo: '',
    tipo: 'PASAPORTE',
    categoria: 'Identificación',
    estado: 'EN ESPERA'
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Cargar datos desde el backend
  useEffect(() => {
    loadData();
  }, []);

  // Generar ID automático basado en el tipo de documento
  const generateDocumentId = (tipo) => {
    const prefixMap = {
      'PASAPORTE': 'P',
      'CEDULA': 'C',
      'VISA': 'V',
      'CERTIFICADO': 'T',
      'ANTECEDENTES': 'A',
      'FORMULARIO': 'F',
      'OTRO': 'O'
    };
    
    const prefix = prefixMap[tipo] || 'O';
    
    // Filtrar documentos del mismo tipo
    const sameTipoDocs = documents.filter(doc => 
      doc.id && doc.id.startsWith(`DOC-${prefix}`)
    );
    
    // Encontrar el número más alto
    let maxNumber = 0;
    sameTipoDocs.forEach(doc => {
      const match = doc.id.match(/DOC-[A-Z](\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    
    const nextNumber = String(maxNumber + 1).padStart(2, '0');
    return `DOC-${prefix}${nextNumber}`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, casesData] = await Promise.all([
        documentService.listDocuments(),
        caseService.listCases()
      ]);
      
      // Mapear documentos del backend al formato esperado
      const mappedDocs = (docsData || []).map(doc => ({
        id: doc.id || '',
        name: doc.nombre_archivo || 'Sin nombre',
        category: doc.categoria || 'General',
        tipo_documento: doc.tipo || 'OTRO',
        status: doc.estado || 'EN ESPERA',
        size: '0 KB', // El backend no devuelve tamaño
        date: new Date().toISOString().split('T')[0],
        caseId: doc.id_tramite || null,
        type: doc.tipo || 'Documento'
      }));
      
      // Mapear casos del backend
      const mappedCases = (casesData || []).map(c => ({
        id: c.id || '',
        tipo: c.tipo || 'N/A',
        status: c.estado || 'ACTIVO',
        solicitante_id: c.solicitante_id || ''
      }));
      
      setDocuments(mappedDocs);
      setCases(mappedCases);
    } catch (error) {
      console.error('Error cargando datos del backend:', error);
      showToast('Error al cargar datos. Verifica que el backend esté corriendo.', 'error');
      setDocuments([]);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreateDocument = async () => {
    if (!newDocument.id) {
      showToast('Error: No se pudo generar el ID del documento', 'error');
      return;
    }

    // Si hay archivo, validar que exista
    if (!selectedFile) {
      showToast('Debe seleccionar un archivo', 'warning');
      return;
    }

    try {
      setUploading(true);
      
      // El backend espera: id, nombre_archivo, tipo, categoria, estado
      const docData = {
        id: newDocument.id,
        nombre_archivo: newDocument.nombre_archivo,
        tipo: newDocument.tipo,
        categoria: newDocument.categoria,
        estado: newDocument.estado,
        datos_extraidos: {},
        nivel_confianza: 0.0,
        notas: '',
        id_tramite: null
      };
      
      // Paso 1: Crear el registro del documento
      await documentService.createDocument(docData);
      
      // Paso 2: Subir el archivo físico
      if (selectedFile) {
        await documentService.uploadFile(newDocument.id, selectedFile);
      }
      
      showToast('Documento creado exitosamente', 'success');
      setShowCreateModal(false);
      setNewDocument({
        id: '',
        nombre_archivo: '',
        tipo: 'PASAPORTE',
        categoria: 'Identificación',
        estado: 'EN ESPERA'
      });
      setSelectedFile(null);
      
      // Recargar documentos
      await loadData();
    } catch (error) {
      console.error('Error al crear documento:', error);
      showToast(error.response?.data?.detail || 'Error al crear el documento', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleLinkDocument = async () => {
    if (!selectedDocument || !selectedCase) {
      showToast('Seleccione un documento y un trámite', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // Llamar al backend - el backend hará todas las validaciones
      await caseService.linkDocument(selectedCase, selectedDocument.id);
      
      showToast(`Documento ${selectedDocument.id} vinculado exitosamente al trámite ${selectedCase}`, 'success');
      
      // Limpiar selección
      setSelectedDocument(null);
      setSelectedCase('');
      
      // Recargar datos para ver los cambios (estado: EN ESPERA -> RECIBIDO, id_tramite actualizado)
      await loadData();
      
    } catch (error) {
      console.error('Error al vincular documento:', error);
      
      // Mostrar el mensaje específico del backend
      const errorMessage = error.response?.data?.detail || 'Error al vincular documento';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de documentos
  const filteredDocuments = documents.filter(doc =>
    (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDocs = filteredDocuments.filter(doc => doc.status === 'PENDIENTE' || doc.status === 'EN ESPERA');
  const processedDocs = filteredDocuments.filter(doc => doc.status === 'RECIBIDO');

  return (
    <Layout title="Digital Mailroom Classification" subtitle="Clasificación y vinculación de documentos">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Documentos Pendientes */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Documentos Pendientes
                <span className="ml-2 text-sm font-normal text-slate-500">({pendingDocs.length})</span>
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    // Pre-generar el ID al abrir el modal
                    const initialId = generateDocumentId('PASAPORTE');
                    setNewDocument({
                      id: initialId,
                      nombre_archivo: '',
                      tipo: 'PASAPORTE',
                      categoria: 'Identificación',
                      estado: 'EN ESPERA'
                    });
                    setSelectedFile(null);
                  }}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Nuevo
                </button>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm w-40"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto space-y-3">
              {pendingDocs.map(doc => (
                <div
                  key={doc.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedDocument?.id === doc.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600">description</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.category} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingDocument(doc)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Ver documento"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                        {doc.status}
                      </span>
                      {selectedDocument?.id === doc.id && (
                        <span className="material-symbols-outlined text-primary">check_circle</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Documentos Procesados */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-600 mb-3">
                Documentos Procesados ({processedDocs.length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-auto">
                {processedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-2 rounded hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                      <span className="text-sm text-slate-700">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingDocument(doc)}
                        className="p-1 text-slate-400 hover:text-primary rounded transition-colors"
                        title="Ver documento"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                      <span className="text-xs text-slate-500">{doc.caseId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de Vinculación */}
          <div className="bg-white rounded-xl shadow-card p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Vincular a Trámite</h2>
            
            {selectedDocument ? (
              <div className="flex-1 flex flex-col">
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Documento seleccionado</p>
                  <p className="font-medium text-slate-900">{selectedDocument.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{selectedDocument.category}</p>
                </div>

                <label className="text-sm font-medium text-slate-700 mb-2">Seleccionar Trámite</label>
                <select
                  value={selectedCase}
                  onChange={(e) => setSelectedCase(e.target.value)}
                  className="mb-4 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">-- Seleccione un trámite --</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id} disabled={c.status === 'ARCHIVADO' || c.status === 'CERRADO'}>
                      {c.id} - {c.type} ({c.status})
                    </option>
                  ))}
                </select>

                <div className="space-y-3 mb-6">
                  {cases.filter(c => c.status === 'ACTIVO').map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedCase === c.id
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{c.id}</p>
                          <p className="text-xs text-slate-600">{c.type}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleLinkDocument}
                  disabled={!selectedCase}
                  className="mt-auto w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Vincular Documento
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-slate-300 text-[64px] mb-3">
                  upload_file
                </span>
                <p className="text-slate-500 text-sm">
                  Seleccione un documento de la lista para vincularlo a un trámite
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal para crear documento */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Crear Nuevo Documento</h3>
              
              <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">ID del Documento *</label>
                <input
                  type="text"
                  value={newDocument.id}
                  onChange={(e) => setNewDocument({...newDocument, id: e.target.value})}
                  placeholder="DOC-P01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-slate-50"
                  readOnly
                  title="El ID se genera automáticamente según el tipo de documento"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Se genera automáticamente según el tipo seleccionado
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Archivo *</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedFile(file);
                      // Auto-llenar el nombre del archivo
                      setNewDocument({...newDocument, nombre_archivo: file.name});
                    }
                  }}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                />
                {selectedFile && (
                  <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Tipo</label>
                <select
                  value={newDocument.tipo}
                  onChange={(e) => {
                    const newTipo = e.target.value;
                    const newId = generateDocumentId(newTipo);
                    setNewDocument({...newDocument, tipo: newTipo, id: newId});
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="PASAPORTE">Pasaporte (DOC-P##)</option>
                  <option value="CEDULA">Cédula (DOC-C##)</option>
                  <option value="VISA">Visa (DOC-V##)</option>
                  <option value="CERTIFICADO">Certificado (DOC-T##)</option>
                  <option value="ANTECEDENTES">Antecedentes (DOC-A##)</option>
                  <option value="FORMULARIO">Formulario (DOC-F##)</option>
                  <option value="OTRO">Otro (DOC-O##)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Categoría</label>
                <select
                  value={newDocument.categoria}
                  onChange={(e) => setNewDocument({...newDocument, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="Identificación">Identificación</option>
                  <option value="Legal">Legal</option>
                  <option value="Migratorio">Migratorio</option>
                  <option value="Académico">Académico</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDocument({
                    id: '',
                    nombre_archivo: '',
                    tipo: 'Pasaporte',
                    categoria: 'Identificación',
                    estado: 'EN ESPERA'
                  });
                  setSelectedFile(null);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDocument}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {uploading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
          onOCR={(result) => {
            showToast(`Datos extraídos exitosamente: ${result.nivel_confianza * 100}% confianza`, 'success');
            loadData(); // Recargar para ver datos actualizados
          }}
        />
      )}
    </Layout>
  );
};

export default MailroomPage;
