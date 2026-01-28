import api from './api';

/**
 * Servicio para procesamiento OCR
 */
export const ocrService = {
  /**
   * Procesar documento con OCR
   * @param {string} docId - ID del documento
   * @param {File} file - Archivo a procesar
   * @returns {Promise}
   */
  processDocument: async (docId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/ocr/procesar/${docId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Procesar documento OCR usando ID existente
   * @param {string} docId - ID del documento ya cargado
   * @returns {Promise}
   */
  processExistingDocument: async (docId) => {
    const response = await api.post(`/ocr/procesar/${docId}`);
    return response.data;
  }
};
