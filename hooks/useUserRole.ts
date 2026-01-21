import { useState, useEffect } from 'react';

export function useUserRole() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch("/api/user-role");
        if (res.ok) {
          const data = await res.json();
          setRoles(data.user.roles || []);
        } else {
          console.error("Error al obtener los roles del usuario");
        }
      } catch (error) {
        console.error("Error en la petición:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, []);

  return { roles, loading };
}