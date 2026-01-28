/**
 * Configuración del entorno de la aplicación
 * 
 * Este archivo centraliza todas las URLs y configuraciones
 * relacionadas con la comunicación con el backend
 */

// Determinar el entorno
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// URLs del backend según el entorno
export const API_CONFIG = {
  // Backend local (desarrollo)
  BACKEND_URL_DEV: 'http://127.0.0.1:8000',
  
  // Backend en producción (cuando se despliegue)
  BACKEND_URL_PROD: import.meta.env.VITE_API_URL || 'https://api.crm-migratorio.com',
  
  // URL actual según el entorno
  get BASE_URL() {
    return isDevelopment ? this.BACKEND_URL_DEV : this.BACKEND_URL_PROD;
  },
  
  // Timeout para las peticiones (ms)
  TIMEOUT: 10000,
  
  // Modo de operación
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK === 'true' || false,
};

// Endpoints disponibles
export const ENDPOINTS = {
  // Documentos
  DOCUMENTS: '/documentos/',
  DOCUMENT_UPLOAD: (docId) => `/documentos/${docId}/upload`,
  
  // OCR
  OCR_PROCESS: (docId) => `/ocr/procesar/${docId}`,
  
  // Trámites
  TRAMITES: '/tramites/',
  TRAMITE_DETAIL: (tramiteId) => `/tramites/${tramiteId}`,
  TRAMITE_LINK_DOC: (tramiteId, docId) => `/tramites/${tramiteId}/vincular-documento/${docId}`,
  
  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/resumen',
  DASHBOARD_MONITORING: '/dashboard/monitoreo/ejecutar-manual',
  DASHBOARD_RESOLVE_TASK: (tareaId) => `/dashboard/tareas/${tareaId}/resolver`,
};

// Configuración de desarrollo
export const DEV_CONFIG = {
  // Habilitar logs en consola
  ENABLE_LOGS: isDevelopment,
  
  // Mostrar errores detallados
  SHOW_DETAILED_ERRORS: isDevelopment,
  
  // Simular latencia de red (ms)
  SIMULATE_NETWORK_DELAY: 0,
};

export default API_CONFIG;
