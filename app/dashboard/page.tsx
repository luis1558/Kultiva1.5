"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "../../hooks/useUserRole";
import { getEncuestaUrlByRole } from "../../utils/roleRouting";

export default function Page() {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { role, loading } = useUserRole();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // Define "móvil" si el ancho es menor o igual a 1024px
    };

    handleResize(); // Detecta el tamaño inicial de la pantalla
    window.addEventListener("resize", handleResize); // Escucha cambios en el tamaño

    return () => window.removeEventListener("resize", handleResize); // Limpia el listener al desmontar
  }, []);

  const handleEncuestaClick = () => {
    const url = getEncuestaUrlByRole(role);
    router.push(url);
  };

  return (
    <div className="h-screen flex justify-center mt-24 min-w-96">
      <div className="max-w-5xl text-center px-4">
        {" "}
        {/* Añadido px-4 para espaciado horizontal */}
        <h2 className="mb-4 font-bold text-base sm:text-lg">
          ¡Bienvenido a la encuesta de clima organizacional!
        </h2>
        <div className="text-center">
          {" "}
          {/* Alineación central del texto */}
          <p className="text-base sm:text-lg">
            ¡Bienvenido/a a la encuesta de clima organizacional! Responderla te
            tomará menos de <b>10 minutos.</b> Tu opinión es muy importante para
            comprender la experiencia de las personas en la organización y
            orientar acciones de mejora.
          </p>
          <p className="text-base sm:text-lg">
            <b>Tus respuestas son confidenciales</b> y se analizarán{" "}
            <b>de forma agregada</b>, sin identificar a personas individuales.
            La información se utilizará exclusivamente con fines de diagnóstico
            organizacional y mejora interna.
          </p>
        </div>
        {isMobile ? (
          <div className="py-5">
            <button 
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
              onClick={handleEncuestaClick}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Comenzar encuesta'}
            </button>
          </div>
        ) : (
          <div className="py-5">
            <button 
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
              onClick={handleEncuestaClick}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Comenzar encuesta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
