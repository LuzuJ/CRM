import api from './api';

/**
 * Servicio para gestión de usuarios
 * Alineado con endpoints del backend FastAPI
 */
export const usuarioService = {
  /**
   * Listar todos los usuarios con filtro opcional por rol
   * Endpoint: GET /usuarios/?rol={rol}
   * Response: Array de { id, nombre_completo, correo, rol, activo }
   * @param {string|null} rol - Rol a filtrar (opcional): 'agente', 'cliente', etc.
   * @returns {Promise} Array de usuarios
   */
  listarUsuarios: async (rol = null) => {
    const params = {};
    if (rol) params.rol = rol;
    
    const response = await api.get('/usuarios/', { params });
    return response.data;
  },

  /**
   * Obtener un usuario específico por ID
   * Endpoint: GET /usuarios/{usuario_id}
   * Response: { id, nombre_completo, correo, rol, activo }
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise} Objeto Usuario
   */
  obtenerUsuario: async (usuarioId) => {
    const response = await api.get(`/usuarios/${usuarioId}`);
    return response.data;
  },

  /**
   * Listar solo agentes (helper function)
   * @returns {Promise} Array de usuarios con rol 'agente'
   */
  listarAgentes: async () => {
    return await usuarioService.listarUsuarios('agente');
  }
};
