import api from './api';

/**
 * Servicio para gestión de trámites
 */
export const caseService = {
  /**
   * Listar todos los trámites
   * @returns {Promise}
   */
  listCases: async () => {
    const response = await api.get('/tramites/');
    return response.data;
  },

  /**
   * Obtener un trámite específico
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise}
   */
  getCase: async (tramiteId) => {
    const response = await api.get(`/tramites/${tramiteId}`);
    return response.data;
  },

  /**
   * Vincular documento a trámite
   * @param {string} tramiteId - ID del trámite
   * @param {string} docId - ID del documento
   * @returns {Promise}
   */
  linkDocument: async (tramiteId, docId) => {
    const response = await api.post(`/tramites/${tramiteId}/vincular-documento/${docId}`);
    return response.data;
  },

  /**
   * Crear un nuevo trámite
   * @param {Object} caseData - Datos del trámite
   * @returns {Promise}
   */
  createCase: async (caseData) => {
    const response = await api.post('/tramites/', caseData);
    return response.data;
  },

  /**
   * Actualizar trámite
   * @param {string} tramiteId - ID del trámite
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise}
   */
  updateCase: async (tramiteId, updates) => {
    const response = await api.put(`/tramites/${tramiteId}`, updates);
    return response.data;
  },

  /**
   * Eliminar trámite
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise}
   */
  deleteCase: async (tramiteId) => {
    const response = await api.delete(`/tramites/${tramiteId}`);
    return response.data;
  }
};
