import api from './api';

export const perfilesService = {
  // Listar todos los perfiles
  listarPerfiles: async () => {
    const response = await api.get('/perfiles/');
    return response.data;
  },

  // Obtener un perfil específico
  obtenerPerfil: async (perfilId) => {
    const response = await api.get(`/perfiles/${perfilId}`);
    return response.data;
  },

  // Crear un nuevo perfil
  crearPerfil: async (perfilData) => {
    const response = await api.post('/perfiles/', perfilData);
    return response.data;
  },

  // Validar perfil legal
  validarPerfil: async (perfilId) => {
    const response = await api.post(`/perfiles/${perfilId}/validar`);
    return response.data;
  },

  // Obtener estado de validación
  obtenerEstadoValidacion: async (perfilId) => {
    const response = await api.get(`/perfiles/${perfilId}/validacion`);
    return response.data;
  },

  // Actualizar perfil
  actualizarPerfil: async (perfilId, perfilData) => {
    const response = await api.put(`/perfiles/${perfilId}`, perfilData);
    return response.data;
  }
};
