import api from './api';

/**
 * Servicio para gestión de citas
 * Alineado con endpoints del backend FastAPI
 */
export const citasService = {
  /**
   * Consultar disponibilidad de agentes
   * Endpoint: GET /citas/disponibilidad?fecha={fecha}&agente_id={agente_id}
   * Response: Array de { agente_id, fecha, hora, estado }
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @param {string|null} agenteId - ID del agente (opcional)
   * @returns {Promise} Array de slots de disponibilidad
   */
  consultarDisponibilidad: async (fecha, agenteId = null) => {
    const params = { fecha };
    if (agenteId) params.agente_id = agenteId;
    
    const response = await api.get('/citas/disponibilidad', { params });
    return response.data;
  },

  /**
   * Crear una nueva cita
   * Endpoint: POST /citas/
   * Body: { id?, fecha, hora, agente_id, tramite_id, estado }
   * @param {Object} citaData - Datos de la cita
   * @returns {Promise} Objeto Cita creado
   */
  crearCita: async (citaData) => {
    const response = await api.post('/citas/', citaData);
    return response.data;
  },

  /**
   * Reagendar una cita existente
   * Endpoint: PUT /citas/{cita_id}?nueva_fecha={fecha}&nueva_hora={hora}
   * @param {string} citaId - ID de la cita
   * @param {string} nuevaFecha - Nueva fecha en formato YYYY-MM-DD
   * @param {string|null} nuevaHora - Nueva hora en formato HH:MM:SS (opcional)
   * @returns {Promise} Objeto Cita actualizado
   */
  reagendarCita: async (citaId, nuevaFecha, nuevaHora = null) => {
    const params = { nueva_fecha: nuevaFecha };
    if (nuevaHora) params.nueva_hora = nuevaHora;
    
    const response = await api.put(`/citas/${citaId}`, null, { params });
    return response.data;
  },

  /**
   * Cancelar una cita
   * Endpoint: DELETE /citas/{cita_id}
   * Response: { mensaje, cita_id, fecha, hora, estado }
   * @param {string} citaId - ID de la cita
   * @returns {Promise}
   */
  cancelarCita: async (citaId) => {
    const response = await api.delete(`/citas/${citaId}`);
    return response.data;
  },

  /**
   * Obtener historial de citas de un trámite
   * Endpoint: GET /citas/tramite/{tramite_id}
   * Response: Array de objetos Cita ordenados cronológicamente
   * @param {string} tramiteId - ID del trámite
   * @returns {Promise} Array de citas
   */
  obtenerHistorialCitas: async (tramiteId) => {
    const response = await api.get(`/citas/tramite/${tramiteId}`);
    return response.data;
  },

  /**
   * Listar todas las citas con filtros opcionales
   * Endpoint: GET /citas/?fecha={fecha}&agente_id={id}&estado={estado}
   * Response: Array de objetos Cita
   * @param {Object} filtros - { fecha?, agente_id?, estado? }
   * @returns {Promise} Array de citas
   */
  listarCitas: async (filtros = {}) => {
    const response = await api.get('/citas/', { params: filtros });
    return response.data;
  }
};
