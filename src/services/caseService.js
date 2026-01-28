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
  }
};
