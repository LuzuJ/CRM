import api from './api';

/**
 * Servicio para procesamiento OCR
 * Alineado con endpoints del backend FastAPI
 */
export const ocrService = {
  /**
   * Procesar documento con OCR
   * Endpoint: POST /ocr/procesar/{doc_id}
   * Headers: Content-Type: multipart/form-data
   * Body: FormData con key 'file'
   * Response: { status: 'ok', datos: {...}, confianza: 0.95 }
   * @param {string} docId - ID del documento
   * @param {File} file - Archivo a procesar (imagen o PDF)
   * @returns {Promise} Objeto con status, datos extraídos y nivel de confianza
   */
  processDocument: async (docId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/ocr/procesar/${docId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
