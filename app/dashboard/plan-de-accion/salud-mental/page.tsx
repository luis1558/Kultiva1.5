"use client";
import React, { useEffect, useState } from "react";

// Función para obtener el ID de la dimensión basado en su nombre
const obtenerDimensionId = (dimension: string): number | null => {
  const dimensiones: Record<string, number> = {
    "Liderazgo": 1,
    "Calidad de vida": 2,
    "Compromiso": 3,
    "Seguridad psicológica": 4,
    "Seguridad y estabilidad": 8,
    "Comunicación": 5,
    "Diversidad e inclusión": 6,
    "Ética e integridad": 7,
    "Gestión del cambio": 9,
    "Cultura organizacional": 10,
    "Flexibilidad y autonomía": 11,
    "Salud mental": 12, // ID correspondiente para Salud mental
    // Agrega más dimensiones si es necesario
  };
  return dimensiones[dimension] || null;
};

export default function SaludMental() {
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [plan1, setPlan1] = useState<string>("");
  const [plan2, setPlan2] = useState<string>("");
  const [fechaInicio1, setFechaInicio1] = useState<string>("");
  const [fechaFin1, setFechaFin1] = useState<string>("");
  const [fechaInicio2, setFechaInicio2] = useState<string>("");
  const [fechaFin2, setFechaFin2] = useState<string>("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardado, setGuardado] = useState<boolean>(false); // Estado para controlar si el plan ya está guardado
  const dimension = "Salud mental"; // Dimensión deseada
  const dimensionId = obtenerDimensionId(dimension);

  // Parsear el ID del empleado desde el localStorage
  const empleadoId = (() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        return parsedUser.id; // Asegúrate de que "id" sea el campo correcto
      } catch (error) {
        console.error("Error al parsear el usuario desde localStorage:", error);
      }
    }
    return null;
  })();

  useEffect(() => {
    const fetchSugerencias = async () => {
      try {
        const response = await fetch(`/api/sugerencia?dimension=${encodeURIComponent(dimension)}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        const sugerenciasArray = Object.values(data).filter((s) => s) as string[];
        setSugerencias(sugerenciasArray);
      } catch (error) {
        console.error("Error al obtener las sugerencias:", error);
      }
    };

    const fetchPlanDeAccion = async () => {
      if (!empleadoId || !dimensionId) return;
      try {
        const response = await fetch(
          `/api/obtener-plan?empleado_id=${empleadoId}&dimension_id=${dimensionId}`
        );
        if (response.ok) {
          const data = await response.json();
          setPlan1(data.sugerencia_1 || "");
          setFechaInicio1(data.periodo_inicial_1 || "");
          setFechaFin1(data.periodo_final_1 || "");
          setPlan2(data.sugerencia_2 || "");
          setFechaInicio2(data.periodo_inicial_2 || "");
          setFechaFin2(data.periodo_final_2 || "");
          if (data.sugerencia_1 || data.sugerencia_2) {
            setGuardado(true); // Si ya hay datos guardados, deshabilita el botón y los inputs
          }
        }
      } catch (error) {
        console.error("Error al obtener el plan de acción:", error);
      }
    };

    fetchSugerencias();
    fetchPlanDeAccion();
  }, [dimension, dimensionId, empleadoId]);

  const guardarPlanDeAccion = async () => {
    if (!empleadoId || !dimensionId) {
      setMensaje("No se encontró el ID del empleado o la dimensión es inválida.");
      return;
    }
    const payload = {
      empleado_id: empleadoId,
      dimension_id: dimensionId,
      sugerencia_1: plan1,
      sugerencia_2: plan2,
      periodo_inicial_1: fechaInicio1,
      periodo_final_1: fechaFin1,
      periodo_inicial_2: fechaInicio2,
      periodo_final_2: fechaFin2,
    };
    console.log("Payload a enviar:", payload);

    try {
      const response = await fetch("/api/guardar-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMensaje("Plan de acción guardado con éxito.");
        setGuardado(true); // Deshabilita el botón y los inputs después de guardar
      } else {
        setMensaje("Error al guardar el plan de acción.");
      }
    } catch (error) {
      console.error("Error al guardar el plan de acción:", error);
      setMensaje("Error en el servidor.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <p className="text-center">
        Considerando el resultado de esta dimensión, aquí tendrás la oportunidad
        de seleccionar acciones que te permitan mejorar en este aspecto. A
        continuación, encontrarás una lista de acciones sugeridas, las cuales
        puedes copiar y pegar en los recuadros inferiores. <br /> Además, si lo
        prefieres, puedes redactar tus propias acciones de mejora en caso de que
        las sugeridas no se alineen con tu plan.
      </p>
      <br />
      <br />
      <h1 className="text-2xl font-bold mb-4">Plan de acción: {dimension}</h1>

      {/* Tabla de acciones sugeridas */}
      <table className="w-full table-auto border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 text-left">Acción</th>
            <th className="border border-gray-300 p-2">Función</th>
          </tr>
        </thead>
        <tbody>
          {sugerencias.map((accion, index) => (
            <tr key={index} className="odd:bg-white even:bg-gray-100">
              <td className="border border-gray-300 p-2">{accion}</td>
              <td className="border border-gray-300 p-2 text-center">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => navigator.clipboard.writeText(accion)}
                >
                  Copiar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mb-4">Acciones personalizadas</h2>
      <div className="flex justify-end mr-10 gap-16 mb-2">
        <span className="font-semibold">Periodo Inicial</span>
        <span className="font-semibold">Periodo Final</span>
      </div>

      {/* Campos personalizados */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={plan1}
            onChange={(e) => setPlan1(e.target.value)}
            disabled={guardado} // Deshabilitar si ya se guardó
          />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={fechaInicio1}
            onChange={(e) => setFechaInicio1(e.target.value)}
            disabled={guardado} // Deshabilitar si ya se guardó
          />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={fechaFin1}
            onChange={(e) => setFechaFin1(e.target.value)}
            disabled={guardado} // Deshabilitar si ya se guardó
          />
        </div>

        <div className="flex items-center gap-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={plan2}
            onChange={(e) => setPlan2(e.target.value)}
            disabled={guardado} // Deshabilitar si ya se guardó
          />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={fechaInicio2}
            onChange={(e) => setFechaInicio2(e.target.value)}
            disabled={guardado} // Deshabilitar si ya se guardó
          />
          <input
            type="date"
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={fechaFin2}
            onChange={(e) => setFechaFin2(e.target.value)}
            disabled={guardado} // Deshabilitar si ya se guardó
          />
        </div>
      </div>

      {/* Botón de guardar */}
      <button
        className={`mt-6 px-4 py-2 rounded text-white ${
          guardado ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
        }`}
        onClick={guardarPlanDeAccion}
        disabled={guardado} // Deshabilitar si ya se guardó
      >
        Guardar
      </button>

      {/* Mensaje de éxito o error */}
      {mensaje && <p className="mt-4 text-blue-600">{mensaje}</p>}
    </div>
  );
}
