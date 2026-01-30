import api from './api';

export const eventosService = {
  // Listar todos los eventos
  listarEventos: async (filtros = {}) => {
    const response = await api.get('/eventos/', { params: filtros });
    return response.data;
  },

  // Obtener eventos próximos a vencer
  obtenerEventosProximos: async (umbralDias = 5, fechaReferencia = null) => {
    const params = { umbral_dias: umbralDias };
    if (fechaReferencia) params.fecha_referencia = fechaReferencia;
    
    const response = await api.get('/eventos/proximos', { params });
    return response.data;
  },

  // Obtener eventos vencidos
  obtenerEventosVencidos: async (fechaReferencia = null) => {
    const params = {};
    if (fechaReferencia) params.fecha_referencia = fechaReferencia;
    
    const response = await api.get('/eventos/vencidos', { params });
    return response.data;
  },

  // Crear un nuevo evento
  crearEvento: async (eventoData) => {
    const response = await api.post('/eventos/', eventoData);
    return response.data;
  },

  // Actualizar un evento
  actualizarEvento: async (eventoId, eventoData) => {
    const response = await api.put(`/eventos/${eventoId}`, eventoData);
    return response.data;
  },

  // Reagendar un evento vencido
  reagendarEvento: async (eventoId, nuevaFecha) => {
    const response = await api.post(`/eventos/${eventoId}/reagendar`, null, {
      params: { nueva_fecha: nuevaFecha }
    });
    return response.data;
  },

  // Cancelar un evento
  cancelarEvento: async (eventoId, motivo) => {
    const response = await api.post(`/eventos/${eventoId}/cancelar`, null, {
      params: { motivo }
    });
    return response.data;
  },

  // Eliminar un evento
  eliminarEvento: async (eventoId) => {
    const response = await api.delete(`/eventos/${eventoId}`);
    return response.data;
  }
};
