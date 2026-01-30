import api from './api';

/**
 * Servicio para gestión de trámites
 * Alineado con endpoints del backend FastAPI
 */
export const caseService = {
  /**
   * Listar todos los trámites
   * Endpoint: GET /tramites/
   * @returns {Promise} Array de objetos Tramite
   */
  listCases: async () => {
    const response = await api.get('/tramites/');
    return response.data;
  },

  /**
   * Obtener un trámite específico
   * Endpoint: GET /tramites/{tramite_id}
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise} Objeto Tramite
   */
  getCase: async (tramiteId) => {
    const response = await api.get(`/tramites/${tramiteId}`);
    return response.data;
  },

  /**
   * Vincular documento a trámite
   * Endpoint: POST /tramites/{tramite_id}/vincular-documento/{doc_id}
   * @param {string} tramiteId - ID del trámite
   * @param {string} docId - ID del documento
   * @returns {Promise} Objeto Documento actualizado con estado RECIBIDO
   */
  linkDocument: async (tramiteId, docId) => {
    const response = await api.post(`/tramites/${tramiteId}/vincular-documento/${docId}`);
    return response.data;
  },

  /**
   * Crear un nuevo trámite
   * Endpoint: POST /tramites/
   * @param {Object} caseData - Datos del trámite
   * @returns {Promise} Objeto Tramite creado
   */
  createCase: async (caseData) => {
    const response = await api.post('/tramites/', caseData);
    return response.data;
  },

  /**
   * Actualizar trámite
   * Endpoint: PUT /tramites/{tramite_id}
   * @param {string} tramiteId - ID del trámite
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise} Objeto Tramite actualizado
   */
  updateCase: async (tramiteId, updates) => {
    const response = await api.put(`/tramites/${tramiteId}`, updates);
    return response.data;
  },

  /**
   * Eliminar trámite
   * Endpoint: DELETE /tramites/{tramite_id}
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise}
   */
  deleteCase: async (tramiteId) => {
    const response = await api.delete(`/tramites/${tramiteId}`);
    return response.data;
  }
};
