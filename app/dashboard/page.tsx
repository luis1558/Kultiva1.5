"use client";

import React, { useEffect, useState } from "react";

export default function Page() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // Define "móvil" si el ancho es menor o igual a 1024px
    };

    handleResize(); // Detecta el tamaño inicial de la pantalla
    window.addEventListener("resize", handleResize); // Escucha cambios en el tamaño

    return () => window.removeEventListener("resize", handleResize); // Limpia el listener al desmontar
  }, []);

  return (
    <div className="h-screen flex justify-center mt-24 min-w-96">
      <div className="max-w-5xl text-center px-4"> {/* Añadido px-4 para espaciado horizontal */}
        <h2 className="mb-4 font-bold text-base sm:text-lg">
          ¡Bienvenido a la encuesta de clima organizacional!
        </h2>
        <div className="text-center"> {/* Alineación central del texto */}
          <p className="text-base sm:text-lg">
            Responderla te tomará menos de 10 minutos. Queremos conocer tu percepción sobre diferentes aspectos de tu experiencia como empleado. Te invitamos a ser espontáneo y honesto en tus respuestas, ya que toda la información que nos proporciones será tratada de manera confidencial y estará enfocada en ayudarnos a mejorar como organización.
          </p>
        </div>
        {isMobile ? (
          <p className="mt-8 text-base sm:text-lg">
            Dirígete a 
            <img
              src="/img/icono-menu.png"
              alt="Icono del menú"
              className="inline h-8 w-8 mx-1 border border-solid"
            />
            que se encuentra en la parte superior izquierda de la pantalla, y selecciona la opción "Valoración" para comenzar la encuesta.
          </p>
        ) : (
          <p className="mt-8 text-base sm:text-lg">
            Dirígete a 
            <img
              src="/img/encuesta.png"
              alt="Valoración"
              className="inline h-15 w-25 mx-1 border border-solid"
            />
            que se encuentra en la parte superior izquierda de la pantalla y haz clic para comenzar la encuesta.
          </p>
        )}
      </div>
    </div>
  );
}
