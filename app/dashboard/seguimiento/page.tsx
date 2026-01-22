"use client";

import { useState, useEffect, useCallback } from "react";
import {
  SeguimientoResponse,
  LiderSeguimiento,
  EmpleadoLider,
  MetricasEquipo,
} from "../../lib/definitions";

// Función para transformar datos del líder a métricas anonimizadas
const transformarMetricas = (lider: LiderSeguimiento): MetricasEquipo => {
  const porcentaje = lider.porcentaje_progreso;

  return {
    total_empleados: lider.total_empleados,
    empleados_respondieron: lider.empleados_respondieron,
    empleados_pendientes: lider.empleados_pendientes,
    empleados_no_responden: 0, // Por ahora, podríamos calcular esto si hay lógica de "no va a responder"
    porcentaje_progreso: porcentaje,
    estado_general:
      porcentaje === 100
        ? "completo"
        : porcentaje >= 50
          ? "en_progreso"
          : "critico",
    ultima_actualizacion: new Date().toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

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
          Dashboard Gerencial de Progreso
        </h1>
        <p className="text-gray-600">
          Métricas agregadas para toma de decisiones estratégicas sobre la
          participación en encuestas de clima laboral
        </p>
      </div>

      {/* KPIs Gerenciales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Líderes Activos
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {generales.total_lideres}
          </div>
          <div className="text-xs text-gray-500 mt-1">Unidades de gestión</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Colaboradores
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {generales.total_empleados}
          </div>
          <div className="text-xs text-gray-500 mt-1">Población total</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Participación
          </div>
          <div className="text-3xl font-bold text-green-600">
            {generales.total_respondieron}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(
              (generales.total_respondieron / generales.total_empleados) * 100,
            )}
            % de tasa
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Tasa Global
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {generales.porcentaje_general}%
          </div>
          <div
            className={`text-xs mt-1 ${
              generales.porcentaje_general >= 80
                ? "text-green-600"
                : generales.porcentaje_general >= 60
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {generales.porcentaje_general >= 80
              ? "Meta cumplida"
              : generales.porcentaje_general >= 60
                ? "En progreso"
                : "Requiere acción"}
          </div>
        </div>
      </div>

      {/* Tabla de Líderes - Vista Gerencial */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Desempeño por Unidad de Gestión
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Métricas de participación anonimizadas para evaluación gerencial
          </p>
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
                  Participación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nivel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Análisis
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
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {lider.empleados_respondieron}/{lider.total_empleados}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-green-600 font-medium">
                          {Math.round(
                            (lider.empleados_respondieron /
                              lider.total_empleados) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {lider.empleados_pendientes} pendientes
                      </div>
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
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          lider.porcentaje_progreso === 100
                            ? "bg-green-100 text-green-800"
                            : lider.porcentaje_progreso >= 50
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lider.porcentaje_progreso === 100 ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>Estado Óptimo</title>
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Óptimo
                          </>
                        ) : lider.porcentaje_progreso >= 50 ? (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>En Progreso</title>
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            En Progreso
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <title>Requiere Atención</title>
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Requiere Atención
                          </>
                        )}
                      </span>
                      {lider.porcentaje_progreso < 50 && (
                        <span className="text-xs text-red-600 font-medium">
                          Prioridad Alta
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedLider(lider)}
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      Analizar Métricas
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle - Vista Gerencial Anonimizada */}
      {selectedLider &&
        (() => {
          const metricas = transformarMetricas(selectedLider);

          return (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Métricas del Equipo
                    </h3>
                    <p className="text-sm text-gray-600">
                      Líder: {selectedLider.lider_nombre} |{" "}
                      {selectedLider.lider_area}
                    </p>
                  </div>
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
                  {/* KPIs Principales */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {metricas.total_empleados}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        Total Equipo
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="text-2xl font-bold text-green-600">
                        {metricas.empleados_respondieron}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        Completados
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {Math.round(
                          (metricas.empleados_respondieron /
                            metricas.total_empleados) *
                            100,
                        )}
                        %
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">
                        {metricas.empleados_pendientes}
                      </div>
                      <div className="text-sm text-gray-700 font-medium">
                        Pendientes
                      </div>
                      <div className="text-xs text-orange-600 mt-1">
                        {Math.round(
                          (metricas.empleados_pendientes /
                            metricas.total_empleados) *
                            100,
                        )}
                        %
                      </div>
                    </div>

                    <div
                      className={`${metricas.estado_general === "completo" ? "bg-green-50 border-green-200" : metricas.estado_general === "en_progreso" ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"} rounded-lg p-4 border`}
                    >
                      <div className="text-2xl font-bold">
                        {metricas.estado_general === "completo" ? (
                          <span className="text-green-600">✓</span>
                        ) : metricas.estado_general === "en_progreso" ? (
                          <span className="text-yellow-600">⚡</span>
                        ) : (
                          <span className="text-red-600">!</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 font-medium capitalize">
                        {metricas.estado_general === "completo"
                          ? "Completo"
                          : metricas.estado_general === "en_progreso"
                            ? "En Progreso"
                            : "Crítico"}
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progreso Grande */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progreso General
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {metricas.porcentaje_progreso}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-300 ${
                          metricas.porcentaje_progreso === 100
                            ? "bg-green-600"
                            : metricas.porcentaje_progreso >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${metricas.porcentaje_progreso}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Distribución Visual */}
                  <div className="mb-8">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      Distribución de Respuestas
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-gray-700">
                          Completados
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 mr-3">
                          <div
                            className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{
                              width: `${(metricas.empleados_respondieron / metricas.total_empleados) * 100}%`,
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              {metricas.empleados_respondieron}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-24 text-sm font-medium text-gray-700">
                          Pendientes
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 mr-3">
                          <div
                            className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{
                              width: `${(metricas.empleados_pendientes / metricas.total_empleados) * 100}%`,
                            }}
                          >
                            <span className="text-xs text-white font-medium">
                              {metricas.empleados_pendientes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info del Líder */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Líder:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedLider.lider_nombre}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Área:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedLider.lider_area}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cargo:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedLider.lider_cargo}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">
                          Última actualización:
                        </span>
                        <span className="ml-2 font-medium text-gray-900">
                          {metricas.ultima_actualizacion}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones Sugeridas */}
                  {metricas.estado_general !== "completo" && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="text-sm font-semibold text-blue-900 mb-2">
                        Acciones Sugeridas
                      </h5>
                      {metricas.estado_general === "critico" ? (
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>
                            • Contactar urgentemente al líder para seguimiento
                          </li>
                          <li>• Evaluar barreras específicas del equipo</li>
                          <li>• Considerar recordatorio adicional</li>
                        </ul>
                      ) : (
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Monitorear progreso diario</li>
                          <li>• Enviar recordatorio al equipo pendiente</li>
                          <li>• Programar seguimiento con el líder</li>
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}
