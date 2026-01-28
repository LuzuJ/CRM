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
  }
};
