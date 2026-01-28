import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useDemoData } from '../contexts/DemoContext';
import { documentService, caseService } from '../services';

const MailroomPage = () => {
  const { documents: fallbackDocs, cases: fallbackCases } = useDemoData();
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedCase, setSelectedCase] = useState('');
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar datos desde el backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Intentar cargar desde backend
      const [docsData, casesData] = await Promise.all([
        documentService.listDocuments().catch(() => fallbackDocs),
        caseService.listCases().catch(() => fallbackCases)
      ]);
      setDocuments(docsData);
      setCases(casesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setDocuments(fallbackDocs);
      setCases(fallbackCases);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLinkDocument = async () => {
    if (!selectedDocument || !selectedCase) {
      showToast('Seleccione un documento y un trámite', 'warning');
      return;
    }

    // Validar si el trámite está archivado o cerrado
    const targetCase = cases.find(c => c.id === selectedCase);
    if (targetCase.status === 'ARCHIVADO' || targetCase.status === 'CERRADO') {
      showToast('No se puede vincular a expedientes finalizados', 'error');
      return;
    }

    // Validar si el documento ya está vinculado
    if (selectedDocument.status === 'RECIBIDO') {
      showToast('El documento ya se encuentra vinculado', 'error');
      return;
    }

    try {
      // Llamar al backend real
      await caseService.linkDocument(selectedCase, selectedDocument.id);
      
      // Recargar datos después de vincular
      await loadData();
      
      showToast('Documento vinculado exitosamente', 'success');
      setSelectedDocument(null);
      setSelectedCase('');
    } catch (error) {
      console.error('Error al vincular documento:', error);
      showToast(error.response?.data?.detail || 'Error al vincular el documento', 'error');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingDocs = filteredDocuments.filter(doc => doc.status === 'EN ESPERA');
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

            <div className="flex-1 overflow-auto space-y-3">
              {pendingDocs.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocument(doc)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDocument?.id === doc.id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-600">description</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-xs text-slate-500">{doc.category} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    <span className="text-xs text-slate-500">{doc.caseId}</span>
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
    </Layout>
  );
};

export default MailroomPage;
