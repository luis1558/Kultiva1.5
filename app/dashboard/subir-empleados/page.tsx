"use client";

import { useState } from "react";
import UploadSection from "../../ui/dashboard/upload-section";
import { CloudArrowUpIcon, DocumentIcon } from "@heroicons/react/24/outline";

export default function SubirEmpleadosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResults(null);
  };

  const handleUploadComplete = (uploadResults: any) => {
    setResults(uploadResults);
    setUploading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Importación de Empleados
          </h1>
          <p className="text-gray-600">
            Sube un archivo Excel para importar empleados, áreas, cargos y roles automáticamente
          </p>
        </div>

        {/* Upload Section */}
        {!results && (
          <UploadSection
            onFileSelect={handleFileSelect}
            onUploadStart={() => setUploading(true)}
            onUploadComplete={handleUploadComplete}
            disabled={uploading}
          />
        )}

        {/* Progress / Loading State */}
        {uploading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Procesando archivo...</span>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2" />
              Resultados de la importación
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Empleados importados:</span>
                <span className="font-medium">{results.empleadosImportados || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Áreas creadas:</span>
                <span className="font-medium">{results.areasCreadas || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Cargos creados:</span>
                <span className="font-medium">{results.cargosCreados || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Roles creados:</span>
                <span className="font-medium">{results.rolesCreados || 0}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Relaciones jefe-empleado:</span>
                <span className="font-medium">{results.relacionesCreadas || 0}</span>
              </div>
              
              {results.errores && results.errores.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Errores:</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {results.errores.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {results.exitos && results.exitos.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Importación exitosa:</h3>
                  <p className="text-sm text-green-700">{results.exitos.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Reset button */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setFile(null);
                  setResults(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Importar otro archivo
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!file && !results && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instrucciones:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El archivo debe estar en formato Excel (.xlsx)</li>
              <li>• Las columnas requeridas son: NOMBRE, CORREO, CONTRASEÑA, AREA, CARGO, ROL</li>
              <li>• Columnas opcionales: JEFE_DIRECTO, CEDULA, GENERO, FECHA_NACIMIENTO, etc.</li>
              <li>• Los jefes deben existir en el mismo archivo</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}