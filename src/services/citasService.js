import api from './api';

export const citasService = {
  // Consultar disponibilidad de agentes
  consultarDisponibilidad: async (fecha, agenteId = null) => {
    const params = { fecha };
    if (agenteId) params.agente_id = agenteId;
    
    const response = await api.get('/citas/disponibilidad', { params });
    return response.data;
  },

  // Crear una nueva cita
  crearCita: async (citaData) => {
    const response = await api.post('/citas/', citaData);
    return response.data;
  },

  // Reagendar una cita existente
  reagendarCita: async (citaId, nuevaFecha, nuevaHora = null) => {
    const params = { nueva_fecha: nuevaFecha };
    if (nuevaHora) params.nueva_hora = nuevaHora;
    
    const response = await api.put(`/citas/${citaId}`, null, { params });
    return response.data;
  },

  // Cancelar una cita
  cancelarCita: async (citaId) => {
    const response = await api.delete(`/citas/${citaId}`);
    return response.data;
  },

  // Obtener historial de citas de un trámite
  obtenerHistorialCitas: async (tramiteId) => {
    const response = await api.get(`/citas/tramite/${tramiteId}`);
    return response.data;
  },

  // Listar todas las citas con filtros
  listarCitas: async (filtros = {}) => {
    const response = await api.get('/citas/', { params: filtros });
    return response.data;
  }
};
