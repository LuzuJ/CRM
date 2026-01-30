import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { caseService, documentService } from '../services';

const CaseDetailPage = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const { user, canAccessCase } = useAuth();
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      
      // Obtener el trámite específico (incluye documentos en la respuesta del backend)
      const tramiteData = await caseService.getCase(caseId);
      
      // El backend retorna: { id, tipo, solicitante_id, estado, documentos: [...], citas: [...], eventos: [...] }
      setCaseData({
        id: tramiteData.id,
        type: tramiteData.tipo,
        applicant: tramiteData.solicitante_id,
        status: tramiteData.estado,
        legalStatus: 'PENDIENTE'
      });
      
      // Los documentos vienen incluidos en la respuesta del backend
      setDocuments(tramiteData.documentos || []);
      setAppointments(tramiteData.citas || []);
      
    } catch (error) {
      console.error('Error al cargar datos del caso:', error);
      showToast('Error al cargar datos del caso', 'error');
    } finally {
      setLoading(false);
    }
  };

  const caseDocuments = documents;
  const caseAppointments = appointments;

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Validar acceso del usuario al caso
  if (!canAccessCase(caseId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-600 text-[48px]">
              block
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
          <p className="text-slate-600 mb-6">
            No tienes permisos para ver este caso.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return <Layout title="Cargando..."><div>Cargando detalles del caso...</div></Layout>;
  }

  return (
    <Layout 
      title={`Caso ${caseData.id}`}
      subtitle={`${caseData.type} - ${caseData.applicant}`}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Alert Banner if blocked */}
      {caseData.legalStatus === 'BLOQUEADO' && (
        <div className="mb-6 w-full bg-alert-red text-white px-6 py-3 flex items-center justify-between shadow-md rounded-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined icon-filled">gavel</span>
            <p className="font-bold text-sm tracking-wide uppercase">
              Expediente Congelado por Impedimento Legal
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Info */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Información del Caso</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500">Estado</p>
              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                caseData.status === 'ACTIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {caseData.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Estado Legal</p>
              <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                caseData.legalStatus === 'VALIDADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {caseData.legalStatus}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-500">Fecha de Creación</p>
              <p className="font-medium text-slate-900">{caseData.createdDate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Última Actualización</p>
              <p className="font-medium text-slate-900">{caseData.lastUpdate}</p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('documents')}
                className={`py-3 border-b-2 font-medium transition-colors ${
                  activeTab === 'documents'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Documentos ({documents.length})
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-3 border-b-2 font-medium transition-colors ${
                  activeTab === 'appointments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Citas ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-3 border-b-2 font-medium transition-colors ${
                  activeTab === 'timeline'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Línea de Tiempo
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'documents' && (
              <div className="space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-slate-300 text-[64px] mb-4">
                      description
                    </span>
                    <p className="text-slate-500 text-sm">Sin documentos añadidos</p>
                  </div>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary/50">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-600">description</span>
                        <div>
                          <p className="font-medium text-slate-900">{doc.nombre_archivo || doc.name || 'Sin nombre'}</p>
                          <p className="text-sm text-slate-500">{doc.categoria || doc.category} • {doc.tipo || doc.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.estado === 'RECIBIDO' || doc.status === 'RECIBIDO' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.estado || doc.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-slate-300 text-[64px] mb-4">
                      event
                    </span>
                    <p className="text-slate-500 text-sm">Sin citas programadas</p>
                  </div>
                ) : (
                  appointments.map(apt => (
                    <div key={apt.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary">event</span>
                        <p className="font-medium text-slate-900">{apt.fecha} a las {apt.hora}</p>
                      </div>
                      <p className="text-sm text-slate-600">Agente ID: {apt.agente_id}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                        apt.estado === 'CONFIRMADA' || apt.estado === 'PROGRAMADA'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {apt.estado}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900">Caso creado</p>
                    <p className="text-sm text-slate-500">{caseData.createdDate}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-slate-900">Validación legal completada</p>
                    <p className="text-sm text-slate-500">2026-01-16</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CaseDetailPage;
