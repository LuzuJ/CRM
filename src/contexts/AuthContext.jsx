import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('usuario');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser({
          id: userData.id,
          username: userData.correo,
          role: userData.rol || 'agente',
          name: userData.nombre,
          email: userData.correo,
          ...userData
        });
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (dataFromBackend) => {
    // Si recibimos datos del backend (objeto con usuario, token, etc.)
    if (dataFromBackend && dataFromBackend.usuario) {
      const userData = {
        id: dataFromBackend.usuario.id,
        username: dataFromBackend.usuario.correo,
        role: dataFromBackend.usuario.rol || 'agente',
        name: dataFromBackend.usuario.nombre,
        email: dataFromBackend.usuario.correo,
        ...dataFromBackend.usuario
      };
      
      setUser(userData);
      localStorage.setItem('usuario', JSON.stringify(dataFromBackend.usuario));
      localStorage.setItem('token', dataFromBackend.token);
      
      if (dataFromBackend.perfil_cliente) {
        localStorage.setItem('perfil_cliente', JSON.stringify(dataFromBackend.perfil_cliente));
      }
      
      return { success: true, user: userData };
    }

    return { success: false, error: 'Datos de usuario inválidos' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    localStorage.removeItem('perfil_cliente');
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const canAccessCase = (caseId) => {
    if (!user) return false;
    // Agente puede ver todos los casos
    if (user.role === 'agente') return true;
    // Cliente solo puede ver su propio caso
    if (user.role === 'cliente') return user.caseId === caseId;
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      hasRole,
      canAccessCase,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
