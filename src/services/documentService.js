import api from './api';

/**
 * Servicio para gestión de documentos
 * Alineado con endpoints del backend FastAPI
 */
export const documentService = {
  /**
   * Crear metadatos del documento
   * Endpoint: POST /documentos/
   * Body: { id, nombre_archivo, tipo, categoria, estado }
   * Response: Objeto Documento creado
   * @param {Object} documento - Datos del documento
   * @returns {Promise}
   */
  createDocument: async (documento) => {
    const response = await api.post('/documentos/', documento);
    return response.data;
  },

  /**
   * Subir archivo físico
   * Endpoint: POST /documentos/{doc_id}/upload
   * Headers: Content-Type: multipart/form-data
   * Body: FormData con key 'file'
   * Response: { mensaje: "Archivo subido exitosamente", path: "uploads/..." }
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
   * Endpoint: GET /documentos/
   * Response: Array de objetos Documento
   * @returns {Promise}
   */
  listDocuments: async () => {
    const response = await api.get('/documentos/');
    return response.data;
  },

  /**
   * Crear documento completo (metadatos + archivo)
   * Flujo completo: POST /documentos/ + POST /documentos/{doc_id}/upload
   * @param {Object} documentData - Datos del documento
   * @param {File} file - Archivo a subir
   * @returns {Promise} Objeto Documento con archivo subido
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
   * Procesar OCR de un documento
   * Endpoint: POST /ocr/procesar/{doc_id}
   * Headers: Content-Type: multipart/form-data
   * Body: FormData con archivo (opcional si el documento ya fue subido)
   * Response: { status: "ok", datos: {...}, confianza: 0.95 }
   * @param {string} docId - ID del documento
   * @param {File} file - Archivo a procesar (opcional)
   * @returns {Promise}
   */
  processOCR: async (docId, file = null) => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/ocr/procesar/${docId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      // Si no hay archivo, intentar procesar documento ya subido
      const response = await api.post(`/ocr/procesar/${docId}`);
      return response.data;
    }
  },

  /**
   * Obtener documento por ID
   * Endpoint: GET /documentos/{doc_id}
   * @param {string} docId - ID del documento
   * @returns {Promise}
   */
  getDocument: async (docId) => {
    const response = await api.get(`/documentos/${docId}`);
    return response.data;
  }
};
