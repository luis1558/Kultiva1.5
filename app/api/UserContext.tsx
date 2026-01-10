"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define la interfaz del usuario
interface User {
  id: string;
  nombre: string;
  correo: string;
  jefe_nombre?: string;
  jefe_id?: string;
}

// Crea el contexto de usuario
const UserContext = createContext<{
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
} | null>(null);

// Hook para consumir el contexto de usuario
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

// Proveedor del contexto de usuario
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error cargando usuario desde localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Cargando usuario...</div>; // Evita errores por renderizado temprano
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
