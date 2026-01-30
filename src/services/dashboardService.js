import api from './api';

/**
 * Servicio para dashboard y monitoreo
 */
export const dashboardService = {
  /**
   * Obtener resumen del dashboard
   * @returns {Promise}
   */
  getSummary: async () => {
    const response = await api.get('/dashboard/resumen');
    return response.data;
  },

  /**
   * Ejecutar monitoreo manual
   * @returns {Promise}
   */
  executeMonitoring: async () => {
    const response = await api.post('/dashboard/monitoreo/ejecutar-manual');
    return response.data;
  },

  /**
   * Resolver tarea mediante reagendamiento
   * @param {string} tareaId - ID de la tarea
   * @param {string} nuevaFecha - Nueva fecha en formato YYYY-MM-DD
   * @returns {Promise}
   */
  reagendarTarea: async (tareaId, nuevaFecha) => {
    const response = await api.post(
      `/dashboard/tareas/${tareaId}/resolver`,
      { nueva_fecha: nuevaFecha }
    );
    return response.data;
  },

  /**
   * Resolver tarea mediante cancelación
   * @param {string} tareaId - ID de la tarea
   * @param {string} motivo - Motivo de la cancelación
   * @returns {Promise}
   */
  cancelarTarea: async (tareaId, motivo) => {
    const response = await api.post(
      `/dashboard/tareas/${tareaId}/resolver`,
      { motivo }
    );
    return response.data;
  },

  /**
   * Resolver tarea genérica
   * @param {string} tareaId - ID de la tarea
   * @param {string} accion - 'reagendar' o 'cancelar'
   * @param {Object} payload - { nueva_fecha: '...' } o { motivo: '...' }
   * @returns {Promise}
   */
  resolverTarea: async (tareaId, accion, payload) => {
    const response = await api.post(
      `/dashboard/tareas/${tareaId}/resolver?accion=${accion}`,
      payload
    );
    return response.data;
  }
};
