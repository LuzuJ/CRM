/**
 * Hook personalizado para integración con el backend
 * 
 * Permite alternar fácilmente entre datos mock (DemoContext) y API real
 */

import { useState, useEffect } from 'react';
import { useDemoData } from '../contexts/DemoContext';
import { 
  documentService, 
  ocrService, 
  caseService, 
  dashboardService 
} from '../services';
import { API_CONFIG } from '../config/api.config';

/**
 * Hook para gestión de documentos
 */
export const useDocuments = () => {
  const demoData = useDemoData();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDocuments = async () => {
    if (API_CONFIG.USE_MOCK_DATA) {
      setDocuments(demoData.documents);
      return;
    }

    try {
      setLoading(true);
      const data = await documentService.listDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err);
      console.error('Error al cargar documentos:', err);
      // Fallback a datos mock
      setDocuments(demoData.documents);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return {
    documents: API_CONFIG.USE_MOCK_DATA ? demoData.documents : documents,
    loading,
    error,
    reload: loadDocuments,
    linkDocument: API_CONFIG.USE_MOCK_DATA 
      ? demoData.linkDocument 
      : async (docId, caseId) => {
          await caseService.linkDocument(caseId, docId);
          await loadDocuments();
        }
  };
};

/**
 * Hook para gestión de casos/trámites
 */
export const useCases = () => {
  const demoData = useDemoData();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadCases = async () => {
    if (API_CONFIG.USE_MOCK_DATA) {
      setCases(demoData.cases);
      return;
    }

    try {
      setLoading(true);
      const data = await caseService.listCases();
      setCases(data);
    } catch (err) {
      setError(err);
      console.error('Error al cargar casos:', err);
      // Fallback a datos mock
      setCases(demoData.cases);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  return {
    cases: API_CONFIG.USE_MOCK_DATA ? demoData.cases : cases,
    loading,
    error,
    reload: loadCases,
  };
};

/**
 * Hook para procesamiento OCR
 */
export const useOCR = () => {
  const demoData = useDemoData();

  const processDocument = async (docId, file) => {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Simulación mock
      demoData.updateOCRStatus(docId, 'PROCESADO');
      return {
        status: 'ok',
        datos: { 'Número de Cédula': '1710034065' },
        confianza: 0.95
      };
    }

    // Llamada real al backend
    return await ocrService.processDocument(docId, file);
  };

  return {
    processDocument,
    updateOCRStatus: demoData.updateOCRStatus,
  };
};

/**
 * Hook para el dashboard
 */
export const useDashboard = () => {
  const demoData = useDemoData();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDashboard = async () => {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Usar datos mock del contexto
      setDashboardData({
        tareas_pendientes: demoData.deadlines.filter(d => d.status !== 'COMPLETED').length,
        alertas_activas: demoData.deadlines.filter(d => d.status === 'URGENT').length,
        items_tareas: demoData.deadlines,
        items_alertas: demoData.deadlines.filter(d => d.status === 'URGENT'),
      });
      return;
    }

    try {
      setLoading(true);
      const data = await dashboardService.getSummary();
      setDashboardData(data);
    } catch (err) {
      console.error('Error al cargar dashboard:', err);
      // Fallback a datos mock
      setDashboardData({
        tareas_pendientes: demoData.deadlines.filter(d => d.status !== 'COMPLETED').length,
        alertas_activas: demoData.deadlines.filter(d => d.status === 'URGENT').length,
        items_tareas: demoData.deadlines,
        items_alertas: demoData.deadlines.filter(d => d.status === 'URGENT'),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return {
    dashboardData,
    loading,
    reload: loadDashboard,
    executeMonitoring: API_CONFIG.USE_MOCK_DATA
      ? async () => console.log('Mock: Monitoreo ejecutado')
      : dashboardService.executeMonitoring,
    resolverTarea: API_CONFIG.USE_MOCK_DATA
      ? async (id, accion, payload) => console.log('Mock: Tarea resuelta', id, accion)
      : dashboardService.resolverTarea,
  };
};
