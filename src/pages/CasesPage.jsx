import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { useDemoData } from '../contexts/DemoContext';

const CasesPage = () => {
  const { cases } = useDemoData();
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, closed

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
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

  const filteredCases = cases.filter(c => {
    if (filter === 'active') return c.status === 'ACTIVO';
    if (filter === 'closed') return c.status === 'CERRADO' || c.status === 'ARCHIVADO';
    return true;
  });

  return (
    <Layout title="Gestión de Casos" subtitle="Todos los trámites migratorios">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Casos Activos</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {cases.filter(c => c.status === 'ACTIVO').length}
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
                    {cases.filter(c => c.status === 'CERRADO').length}
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
              Todos ({cases.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'active' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Activos ({cases.filter(c => c.status === 'ACTIVO').length})
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === 'closed' ? 'bg-primary text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Finalizados ({cases.filter(c => c.status === 'CERRADO' || c.status === 'ARCHIVADO').length})
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
    </Layout>
  );
};

export default CasesPage;
