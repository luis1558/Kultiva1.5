"use client";

import { useState } from "react";

export default function SubirEmpleadosPage() {
  const [status, setStatus] = useState("Esperando archivo...");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("📁 Archivo original:", {
      name: file.name,
      type: file.type,
      size: file.size,
      webkitRelativePath: (file as any).webkitRelativePath
    });

    // Intentar leer directamente sin pasar por FormData primero
    try {
      const buffer = await file.arrayBuffer();
      console.log("📊 ArrayBuffer directo:", buffer.byteLength);
      
      // Si el buffer tiene datos, procesamos
      if (buffer.byteLength > 0) {
        const { parseExcelFile } = await import("../../../utils/excel-parser-debug");
        const result = await parseExcelFile(new File([buffer], file.name, { type: file.type }));
        
        console.log("✅ Parseo exitoso:", result);
        setStatus(`Parseado: ${result.data.length} empleados, ${result.errores.length} errores`);
      } else {
        throw new Error("El ArrayBuffer está vacío");
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
      setStatus(`Error: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Directo de Archivo</h1>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input 
          type="file" 
          accept=".xlsx,.xls" 
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