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

  // Usuarios de demostración
  const demoUsers = [
    {
      id: 'USER_001',
      username: 'agente1',
      password: 'agente123',
      role: 'agente',
      name: 'María González',
      email: 'maria.gonzalez@crm.com',
      specialty: 'Visas de Trabajo'
    },
    {
      id: 'USER_002',
      username: 'agente2',
      password: 'agente123',
      role: 'agente',
      name: 'Carlos Mendez',
      email: 'carlos.mendez@crm.com',
      specialty: 'Visas de Estudiante'
    },
    {
      id: 'USER_003',
      username: 'cliente1',
      password: 'cliente123',
      role: 'cliente',
      name: 'María Fernanda González Pérez',
      email: 'maria.gonzalez@email.com',
      caseId: 1
    },
    {
      id: 'USER_004',
      username: 'cliente2',
      password: 'cliente123',
      role: 'cliente',
      name: 'Juan Carlos Rodríguez López',
      email: 'juan.rodriguez@email.com',
      caseId: 2
    }
  ];

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const foundUser = demoUsers.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      // Generar un token simple para mantener la sesión
      const token = btoa(JSON.stringify({ username, timestamp: Date.now() }));
      
      setUser(userWithoutPassword);
      localStorage.setItem('crm_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('token', token);
      
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Usuario o contraseña incorrectos' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
    localStorage.removeItem('token');
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
      isAuthenticated: !!user,
      demoUsers // Para mostrar en la página de login
    }}>
      {children}
    </AuthContext.Provider>
  );
};
