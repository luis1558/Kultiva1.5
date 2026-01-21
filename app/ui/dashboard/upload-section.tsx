"use client";

import { useState, useRef } from "react";
import { CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { parseExcelFile } from "../../../utils/excel-parser-debug";
import { ImportResult } from "../../../types/employee";

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onUploadStart: () => void;
  onUploadComplete: (results: ImportResult) => void;
  disabled: boolean;
}

export default function UploadSection({ 
  onFileSelect, 
  onUploadStart, 
  onUploadComplete, 
  disabled 
}: UploadSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    console.log("📁 Archivo recibido:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    // Validación más flexible de tipo
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream" // Algunos navegadores lo devuelven así
    ];

    if (file && (validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      try {
        console.log("🔄 Iniciando parseo...");
        
        // Parsear el Excel con más logging
        const parseResult = await parseExcelFile(file);
        
        console.log("📊 Resultado del parseo:", parseResult);
        
        if (parseResult.errores.length > 0) {
          alert(`Errores en el archivo:\n${parseResult.errores.join('\n')}`);
          return;
        }

        // Mostrar advertencias si hay
        if (parseResult.warnings.length > 0) {
          console.log("⚠️ Advertencias:", parseResult.warnings);
          alert(`Advertencias:\n${parseResult.warnings.join('\n')}`);
        }

        // Preparar datos para el preview
        const previewData = parseResult.data.map(emp => ({
          nombre: emp.nombre_completo,
          correo: emp.correo,
          area: emp.area,
          cargo: emp.cargo,
          rol: emp.rol
        }));

        console.log("👀 Preview data:", previewData);

        setPreviewData(previewData);
        setShowPreview(true);
        setCurrentFile(file); // Guardamos el archivo
        onFileSelect(file);
      } catch (error) {
        console.error("❌ Error en handleFile:", error);
        alert(`Error al procesar el archivo: ${error}`);
      }
    } else {
      alert(`Archivo no válido. Tipo: ${file.type}, Nombre: ${file.name}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleUpload = async () => {
    onUploadStart();
    
    try {
      // Crear FormData para subir el archivo
      const formData = new FormData();
      
      // Usamos el archivo guardado en memoria
      if (currentFile) {
        formData.append('file', currentFile);
        
        const response = await fetch('/api/upload-empleados', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          onUploadComplete(result);
        } else {
          if (result.detalles) {
            const errores = Array.isArray(result.detalles.errores) 
              ? result.detalles.errores 
              : [result.error || 'Error desconocido'];
            alert(`Error en la importación:\n${errores.join('\n')}`);
          } else {
            alert(`Error: ${result.error || 'Error desconocido'}`);
          }
          onUploadComplete({
            empleadosImportados: 0,
            areasCreadas: 0,
            cargosCreados: 0,
            rolesCreados: 0,
            relacionesCreadas: 0,
            exitos: [],
            errores: [result.error || 'Error en la importación']
          });
        }
      } else {
        throw new Error('No se encontró el archivo en memoria');
      }
    } catch (error) {
      alert(`Error al subir el archivo: ${error}`);
      onUploadComplete({
        empleadosImportados: 0,
        areasCreadas: 0,
        cargosCreados: 0,
        rolesCreados: 0,
        relacionesCreadas: 0,
        exitos: [],
        errores: [`Error: ${error}`]
      });
    }
  };

  const handleCancel = () => {
    setPreviewData([]);
    setShowPreview(false);
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!showPreview && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
            ${dragOver 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <div className="text-lg font-medium text-gray-900 mb-2">
            Sube tu archivo de empleados
          </div>
          
          <div className="text-sm text-gray-500">
            Arrastra y suelta tu archivo Excel aquí, o haz clic para seleccionarlo
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            Solo archivos .xlsx • Máximo 10MB
          </div>
        </div>
      )}

      {/* Preview Section */}
      {showPreview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Vista previa de datos ({previewData.length} registros)
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-500 hover:text-gray-700"
              type="button"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Preview Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Área
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.correo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.cargo || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.rol || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={disabled}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              type="button"
            >
              {disabled ? "Procesando..." : "Importar Empleados"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}