"use client";

import { useState } from "react";

export default function SubirEmpleadosPage() {
  const [status, setStatus] = useState("Esperando archivo...");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("📁 Archivo seleccionado:", file.name, file.type, file.size);

    try {
      const { parseExcelFile } = await import("../../../utils/excel-parser-debug");
      
      console.log("🔄 Iniciando parseo...");
      setStatus("Parseando archivo...");
      
      const result = await parseExcelFile(file);
      
      console.log("✅ Parseo completado:", result);
      setStatus(`Parseado: ${result.data.length} empleados, ${result.errores.length} errores`);
      
    } catch (error) {
      console.error("❌ Error:", error);
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test de Upload</h1>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input 
          type="file" 
          accept=".xlsx" 
          onChange={handleFileUpload}
          className="mb-4"
        />
        
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p className="font-medium">Estado: {status}</p>
        </div>
      </div>
    </div>
  );
}