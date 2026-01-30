import api from './api';

export const clienteService = {
  // Listar todos los clientes
  listarClientes: async () => {
    const response = await api.get('/clientes/');
    return response.data;
  },

  // Obtener un cliente por ID
  obtenerCliente: async (clienteId) => {
    const response = await api.get(`/clientes/${clienteId}`);
    return response.data;
  },

  // Obtener un cliente por cédula
  obtenerClientePorCedula: async (cedula) => {
    const response = await api.get(`/clientes/cedula/${cedula}`);
    return response.data;
  },

  // Crear un nuevo cliente
  crearCliente: async (clienteData) => {
    const response = await api.post('/clientes/', clienteData);
    return response.data;
  },

  // Actualizar un cliente existente
  actualizarCliente: async (clienteId, clienteData) => {
    const response = await api.put(`/clientes/${clienteId}`, clienteData);
    return response.data;
  },

  // Eliminar un cliente
  eliminarCliente: async (clienteId) => {
    const response = await api.delete(`/clientes/${clienteId}`);
    return response.data;
  }
};
