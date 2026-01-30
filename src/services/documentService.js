import api from './api';

/**
 * Servicio para gestión de documentos
 */
export const documentService = {
  /**
   * Crear metadatos del documento
   * @param {Object} documento - Datos del documento
   * @returns {Promise}
   */
  createDocument: async (documento) => {
    const response = await api.post('/documentos/', documento);
    return response.data;
  },

  /**
   * Subir archivo físico
   * @param {string} docId - ID del documento
   * @param {File} file - Archivo a subir
   * @returns {Promise}
   */
  uploadFile: async (docId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/documentos/${docId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Listar todos los documentos
   * @returns {Promise}
   */
  listDocuments: async () => {
    const response = await api.get('/documentos/');
    return response.data;
  },

  /**
   * Crear documento completo (metadatos + archivo)
   * @param {Object} documentData - Datos del documento
   * @param {File} file - Archivo a subir
   * @returns {Promise}
   */
  createAndUploadDocument: async (documentData, file) => {
    // Primero crear metadatos
    const documento = await documentService.createDocument(documentData);
    
    // Luego subir archivo
    if (file) {
      await documentService.uploadFile(documento.id, file);
    }
    
    return documento;
  },

  /**
   * Actualizar documento
   * @param {string} docId - ID del documento
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise}
   */
  updateDocument: async (docId, updates) => {
    const response = await api.put(`/documentos/${docId}`, updates);
    return response.data;
  },

  /**
   * Eliminar documento
   * @param {string} docId - ID del documento
   * @returns {Promise}
   */
  deleteDocument: async (docId) => {
    const response = await api.delete(`/documentos/${docId}`);
    return response.data;
  },

  /**
   * Descargar archivo del documento
   * @param {string} docId - ID del documento
   * @returns {Promise}
   */
  downloadFile: async (docId) => {
    const response = await api.get(`/documentos/${docId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Obtener URL para visualizar documento
   * @param {string} docId - ID del documento
   * @returns {string} URL del archivo
   */
  getViewUrl: (docId) => {
    return `${api.defaults.baseURL}/documentos/${docId}/view`;
  },

  /**
   * Extraer datos del documento usando OCR
   * @param {string} docId - ID del documento
   * @returns {Promise}
   */
  extractOCR: async (docId) => {
    const response = await api.post(`/documentos/${docId}/ocr`);
    return response.data;
  },

  /**
   * Guardar datos extraídos por OCR
   * @param {string} docId - ID del documento
   * @param {object} ocrData - Datos OCR extraídos
   * @returns {Promise}
   */
  saveOCRData: async (docId, ocrData) => {
    // Primero obtener el documento actual
    const docActual = await api.get(`/documentos/${docId}`);
    
    // Actualizar con PUT incluyendo todos los campos requeridos
    const response = await api.put(`/documentos/${docId}`, {
      ...docActual.data,
      datos_extraidos: ocrData.datos_extraidos,
      nivel_confianza: ocrData.nivel_confianza
    });
    return response.data;
  }
};
