"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SeguimientoResponse,
  LiderSeguimiento,
  EmpleadoLider,
} from "../../lib/definitions";

export default function SeguimientoPage() {
  const [data, setData] = useState<SeguimientoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLider, setSelectedLider] = useState<LiderSeguimiento | null>(
    null,
  );

  const fetchSeguimientoData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/seguimiento");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Error al cargar datos");
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeguimientoData();
  }, [fetchSeguimientoData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">
            {error || "No se pudieron cargar los datos"}
          </p>
          <button
            onClick={fetchSeguimientoData}
            type="button"
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { lideres, generales, areas } = data.data;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Seguimiento de Encuestas de Clima Laboral
        </h1>
        <p className="text-gray-600">
          Monitoreo en tiempo real del progreso de las encuestas por líder y
          área
        </p>
      </div>

      {/* Tarjetas de Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Total Líderes
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {generales.total_lideres}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Total Empleados
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {generales.total_empleados}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Respondieron
          </div>
          <div className="text-3xl font-bold text-green-600">
            {generales.total_respondieron}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            % Progreso General
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {generales.porcentaje_general}%
          </div>
        </div>
      </div>

      {/* Tabla de Líderes */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Progreso por Líder
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Líder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo / Área
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lideres.map((lider) => (
                <tr key={lider.lider_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lider.lider_nombre}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lider.lider_correo}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {lider.lider_cargo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lider.lider_area}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-4 text-sm text-gray-900">
                      <span>{lider.empleados_respondieron} respondieron</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-orange-600">
                        {lider.empleados_pendientes} pendientes
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${lider.porcentaje_progreso}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {lider.porcentaje_progreso}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lider.porcentaje_progreso === 100
                          ? "bg-green-100 text-green-800"
                          : lider.porcentaje_progreso >= 50
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {lider.porcentaje_progreso === 100
                        ? "Completo"
                        : lider.porcentaje_progreso >= 50
                          ? "En Progreso"
                          : "Crítico"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedLider(lider)}
                      type="button"
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedLider && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalle del Equipo - {selectedLider.lider_nombre}
              </h3>
              <button
                onClick={() => setSelectedLider(null)}
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedLider.total_empleados}
                    </div>
                    <div className="text-sm text-gray-600">Total Equipo</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {selectedLider.empleados_respondieron}
                    </div>
                    <div className="text-sm text-gray-600">Respondieron</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedLider.empleados_pendientes}
                    </div>
                    <div className="text-sm text-gray-600">Pendientes</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Correo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedLider.empleados.map((empleado) => (
                      <tr
                        key={empleado.empleado_id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {empleado.empleado_nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {empleado.empleado_correo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {empleado.empleado_cargo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              empleado.respondio
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {empleado.respondio ? "Respondió" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

