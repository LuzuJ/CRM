// Exportar la instancia de axios configurada
export { default as api } from './api';

// Exportar servicios específicos alineados con el backend real
export { documentService } from './documentService';
export { ocrService } from './ocrService';
export { caseService } from './caseService';
export { dashboardService } from './dashboardService';
export { citasService } from './citasService';
export { eventosService } from './eventosService';
export { perfilesService } from './perfilesService';
export { clienteService } from './clienteService';
export { usuarioService } from './usuarioService';

// ============================================================================
// SERVICIOS LEGACY (Para compatibilidad con código existente)
// Se mantienen para evitar romper componentes que los usen
// Pero deberían migrarse gradualmente a los nuevos servicios
// ============================================================================

// Servicios Legacy para Clasificación de Documentos (Escenario 1.1)
export const documentServiceLegacy = {
  // Obtener documentos pendientes
  getPendingDocuments: () => api.get('/documents/pending'),
  
  // Vincular documento a trámite
  linkDocumentToCase: (documentId, caseId) => 
    api.post(`/documents/${documentId}/link`, { caseId }),
  
  // Obtener documentos de un trámite
  getCaseDocuments: (caseId) => api.get(`/cases/${caseId}/documents`),
  
  // Cambiar estado de documento
  updateDocumentStatus: (documentId, status) => 
    api.patch(`/documents/${documentId}/status`, { status }),
};

// Servicios Legacy para Extracción OCR (Escenario 1.2)
export const ocrServiceLegacy = {
  // Procesar documento con OCR
  processDocument: (documentId) => 
    api.post(`/ocr/process/${documentId}`),
  
  // Obtener resultado de extracción
  getExtractionResult: (documentId) => 
    api.get(`/ocr/results/${documentId}`),
  
  // Actualizar datos manualmente
  updateManualData: (documentId, data) => 
    api.put(`/ocr/manual-update/${documentId}`, data),
  
  // Marcar para revisión manual
  markForManualReview: (documentId, fields) => 
    api.post(`/ocr/manual-review/${documentId}`, { fields }),
};

// Servicios para Validación Legal (Escenario 1.3)
export const validationService = {
  // Validar perfil migratorio
  validateProfile: (profileId) => 
    api.post(`/validation/profile/${profileId}`),
  
  // Obtener estado de validación
  getValidationStatus: (profileId) => 
    api.get(`/validation/status/${profileId}`),
  
  // Consultar Registro Civil
  queryCivilRegistry: (cedula) => 
    api.get(`/validation/civil-registry/${cedula}`),
  
  // Consultar Policía Migración
  queryMigrationPolice: (cedula) => 
    api.get(`/validation/migration-police/${cedula}`),
  
  // Aprobar validación manual
  approveManualValidation: (profileId, evidence) => 
    api.post(`/validation/manual-approve/${profileId}`, { evidence }),
};

// Servicios para Agendamiento de Citas (Escenario 2.1)
export const appointmentService = {
  // Obtener disponibilidad de agentes
  getAgentAvailability: (date, agentId) => 
    api.get('/appointments/availability', { params: { date, agentId } }),
  
  // Crear cita
  createAppointment: (appointmentData) => 
    api.post('/appointments', appointmentData),
  
  // Reagendar cita
  rescheduleAppointment: (appointmentId, newDate) => 
    api.put(`/appointments/${appointmentId}/reschedule`, { newDate }),
  
  // Cancelar cita
  cancelAppointment: (appointmentId) => 
    api.delete(`/appointments/${appointmentId}`),
  
  // Obtener citas de un trámite
  getCaseAppointments: (caseId) => 
    api.get(`/cases/${caseId}/appointments`),
};

// Servicios Legacy para Gestión de Trámites
export const caseServiceLegacy = {
  // Obtener todos los trámites
  getAllCases: () => api.get('/cases'),
  
  // Obtener detalle de trámite
  getCaseDetail: (caseId) => api.get(`/cases/${caseId}`),
  
  // Crear nuevo trámite
  createCase: (caseData) => api.post('/cases', caseData),
  
  // Actualizar trámite
  updateCase: (caseId, caseData) => api.put(`/cases/${caseId}`, caseData),
  
  // Obtener trámites por solicitante
  getCasesByApplicant: (applicantId) => 
    api.get(`/applicants/${applicantId}/cases`),
};

// Servicios para Control de Plazos
export const deadlineService = {
  // Obtener plazos próximos
  getUpcomingDeadlines: () => api.get('/deadlines/upcoming'),
  
  // Obtener plazos por trámite
  getCaseDeadlines: (caseId) => api.get(`/cases/${caseId}/deadlines`),
  
  // Actualizar plazo
  updateDeadline: (deadlineId, data) => 
    api.put(`/deadlines/${deadlineId}`, data),
  
  // Marcar como completado
  completeDeadline: (deadlineId) => 
    api.patch(`/deadlines/${deadlineId}/complete`),
};

// Servicios de Usuario
export const userService = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Obtener perfil actual
  getCurrentUser: () => api.get('/users/me'),
  
  // Actualizar perfil
  updateProfile: (data) => api.put('/users/me', data),
};
