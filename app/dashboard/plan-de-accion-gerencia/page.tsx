"use client";
import React, { useEffect, useState, JSX } from "react";
import Link from "next/link";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://kultiva-encuesta-de-clima.vercel.app";

export default function PlandeaccionPage() {
  const [dimensionesData, setDimensionesData] = useState<
    { dimension: string; promedio: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [planCompleto, setPlanCompleto] = useState<boolean | null>(null);

   // Relación de dimensiones con sus respectivas URLs
   const dimensionesLinks: { [key: string]: string } = {
    "Calidad de vida": "/dashboard/plan-de-accion-gerencia/calidad-de-vida",
    Compromiso: "/dashboard/plan-de-accion-gerencia/compromiso",
    Comunicación: "/dashboard/plan-de-accion-gerencia/comunicacion",
    "Cultura organizacional":
      "/dashboard/plan-de-accion-gerencia/cultura-organizacional",
    "Diversidad e inclusión":
      "/dashboard/plan-de-accion-gerencia/diversidad-e-inclusion",
    "Flexibilidad y autonomía":
      "/dashboard/plan-de-accion-gerencia/flexibilidad-y-autonomia",
    "Gestión del cambio": "/dashboard/plan-de-accion-gerencia/gestion-del-cambio",
    Liderazgo: "/dashboard/plan-de-accion-gerencia/liderazgo",
    "Seguridad psicológica": "/dashboard/plan-de-accion-gerencia/seguridad-psicologica",
    "Seguridad y estabilidad":
      "/dashboard/plan-de-accion-gerencia/seguridad-y-estabilidad",
    "Ética e integridad": "/dashboard/plan-de-accion-gerencia/etica-e-integridad",
    "Salud mental": "/dashboard/plan-de-accion-gerencia/salud-mental",
  };

  useEffect(() => {
    const fetchDimensiones = async () => {
      try {
        const response = await fetch(`${baseURL}/api/plandeacciongerencia`);
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        const data = await response.json();

        // Filtrar la dimensión número 13 (puedes ajustar este filtro según tu criterio)
        const filteredData = data.filter(
          (row: any) => row.dimensiones !== "Preguntas Abiertas"
        ); // Filtra la dimensión por nombre

        setDimensionesData(
          filteredData.map((row: any) => ({
            dimension: row.dimensiones,
            promedio: row.promedio,
          }))
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };

  

    const checkPlan = async () => {
      try {
        const response = await fetch(`${baseURL}/api/check-plangerencia`);
        if (!response.ok) {
          throw new Error("Error al verificar el plan de acción");
        }
        const data = await response.json();
        setPlanCompleto(data.completo);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchDimensiones();
    checkPlan();
  }, []);

  const obtenerEstilo = (porcentaje: number): string => {
    if (porcentaje <= 74) return "bg-red-300 text-red-900";
    if (porcentaje <= 84) return "bg-yellow-300 text-yellow-900";
    return "bg-green-300 text-green-900";
  };

  const obtenerMensaje = (
    porcentaje: number,
    dimension: string
  ): JSX.Element => {
    if (porcentaje <= 74) {
      const link = dimensionesLinks[dimension];
      if (link) {
        return (
          <Link href={link} className="bg-red-300 underline">
            Crea tu plan de acción
          </Link>
        );
      } else {
        return <span>Crea tu plan de acción (sin enlace)</span>;
      }
    }
    if (porcentaje <= 84) return <span>¡Vas por buen camino!</span>;
    return <span>¡Excelente trabajo!</span>;
  };

  const handleDownloadAndSendEmail = async () => {
    // Llamar al endpoint para enviar el correo
    try {
      const response = await fetch(`${baseURL}/api/correos-gerencia`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Asegúrate de agregar el token de autenticación si es necesario
        },
      });

      if (!response.ok) {
        throw new Error("Error al enviar el correo");
      }

      console.log("Correo enviado exitosamente");

      // Luego, proceder con la descarga
      window.location.href = `${baseURL}/api/download-plan-gerencia`; // Asegúrate de que esta ruta sea correcta
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      alert("Hubo un problema al enviar el correo.");
    }
  };

  return (
    <div className="p-6 ">

<table className="table-auto w-full mt-8 border-collapse border border-gray-300">
  <thead>
    <tr className="bg-gray-200">
      <th className="border border-gray-300 px-4 py-2 text-left w-1/4"> {/* Ajusta 'w-1/4' según el ancho deseado */}
        Rangos de resultados
      </th>
      <th className="border border-gray-300 px-4 py-2 text-left">
        Descripción
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="border border-gray-300 px-4 py-2 bg-red-300">
        0% - 74%
      </td>
      <td className="border border-gray-300 px-4 py-2">
        Zona de oportunidad
      </td>
    </tr>
    <tr>
      <td className="border border-gray-300 px-4 py-2 bg-yellow-300">
        75% - 84%
      </td>
      <td className="border border-gray-300 px-4 py-2">
        Zona de consolidación
      </td>
    </tr>
    <tr>
      <td className="border border-gray-300 px-4 py-2 bg-green-300">
        85% - 100%
      </td>
      <td className="border border-gray-300 px-4 py-2">
        Zona de excelencia
      </td>
    </tr>
  </tbody>
</table>

<br />
<br />
      <h1 className="text-2xl font-bold text-center mb-8">
        Estas son tus oportunidades de mejora:
      </h1>
      {error && (
        <div className="text-red-500 text-center mb-4">Error: {error}</div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {dimensionesData.map((data, index) => {
          const estilo = obtenerEstilo(data.promedio);
          const mensaje = obtenerMensaje(data.promedio, data.dimension);

          return (
            <div
              key={index}
              className={`rounded-lg shadow-md p-4 text-center ${estilo}`}
            >
              <h2 className="text-lg font-semibold mb-2">{data.dimension}</h2>
              <div className="text-4xl font-bold mb-2">{data.promedio}%</div>
              <div className="text-sm font-medium">{mensaje}</div>
            </div>
          );
        })}
      </div>

      {planCompleto === false && (
        <div className="text-center mt-8">
          <Link
            href="#"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg"
          >
            Completar Plan de Acción
          </Link>
        </div>
      )}

      {planCompleto === true && (
        <div className="text-center mt-8">
          <span className="text-green-500 font-bold">
            ¡Tu plan de acción está completo!
          </span>
          <div className="mt-4">
            <button
              onClick={handleDownloadAndSendEmail}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600"
            >
              Descarga tu plan de acción
            </button>
          </div>
        </div>
      )}

      
    </div>
  );
}
