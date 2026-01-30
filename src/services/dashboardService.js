import api from './api';

/**
 * Servicio para dashboard y monitoreo
 * Alineado con endpoints del backend FastAPI
 */
export const dashboardService = {
  /**
   * Obtener resumen del dashboard
   * Endpoint: GET /dashboard/resumen
   * Response: { tareas_pendientes, alertas_activas, items_tareas[], items_alertas[] }
   * @returns {Promise}
   */
  getSummary: async () => {
    const response = await api.get('/dashboard/resumen');
    return response.data;
  },

  /**
   * Ejecutar monitoreo manual
   * Endpoint: POST /dashboard/monitoreo/ejecutar-manual
   * Response: { mensaje: "Proceso de monitoreo ejecutado correctamente" }
   * @returns {Promise}
   */
  executeMonitoring: async () => {
    const response = await api.post('/dashboard/monitoreo/ejecutar-manual');
    return response.data;
  },

  /**
   * Resolver tarea mediante reagendamiento
   * Endpoint: POST /dashboard/tareas/{tarea_id}/resolver?accion=reagendar
   * Body: { "nueva_fecha": "2026-10-20" }
   * @param {string} tareaId - ID de la tarea
   * @param {string} nuevaFecha - Nueva fecha en formato YYYY-MM-DD
   * @returns {Promise}
   */
  reagendarTarea: async (tareaId, nuevaFecha) => {
    const response = await api.post(
      `/dashboard/tareas/${tareaId}/resolver?accion=reagendar`,
      { nueva_fecha: nuevaFecha }
    );
    return response.data;
  },

  /**
   * Resolver tarea mediante cancelación
   * Endpoint: POST /dashboard/tareas/{tarea_id}/resolver?accion=cancelar
   * Body: { "motivo": "Cliente desistió" }
   * @param {string} tareaId - ID de la tarea
   * @param {string} motivo - Motivo de la cancelación
   * @returns {Promise}
   */
  cancelarTarea: async (tareaId, motivo) => {
    const response = await api.post(
      `/dashboard/tareas/${tareaId}/resolver?accion=cancelar`,
      { motivo }
    );
    return response.data;
  },

  /**
   * Resolver tarea genérica
   * Endpoint: POST /dashboard/tareas/{tarea_id}/resolver?accion={reagendar|cancelar}
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
