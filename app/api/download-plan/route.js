import { turso } from "../../seed/db";
import ExcelJS from "exceljs";
import fs from "fs"; // Necesario para leer la imagen

export async function GET(req) {
  try {
    const token = req.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return new Response(JSON.stringify({ message: "No autenticado" }), {
        status: 401,
      });
    }

    const jwtPayload = JSON.parse(atob(token.split(".")[1]));
    const jefeId = jwtPayload.id;

    const result = await turso.execute(
      "SELECT * FROM vw_resumen_plan_de_accion WHERE id = ?",
      [jefeId]
    );

    if (!Array.isArray(result.rows) || result.rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No se encontraron datos" }),
        { status: 404 }
      );
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Plan de Acción");

    // Agregar el título en la fila 1
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(2).value =
      "Plan de acción: encuesta de clima organizacional";

    // Combinar celdas B1 a I1
    worksheet.mergeCells("B1:I1");

    // Estilo del título
    titleRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
    titleRow.getCell(2).font = {
      bold: true,
      color: { argb: "FFFFFF" },
      size: 14,
    };
    titleRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "7C3C8B" },
    };

    // Establecer altura de la primera fila para que se vea la imagen
    worksheet.getRow(1).height = 40;

    // Insertar la imagen en la celda A1
    const imagePath = "./public/img/logo-excel.png";
    if (fs.existsSync(imagePath)) {
      const imageId = workbook.addImage({
        filename: imagePath,
        extension: "png",
      });

      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 }, // Esquina superior izquierda de A1
        br: { col: 1, row: 1 }, // Extiende hasta B1 para que la imagen sea visible
      });

      worksheet.getColumn(1).width = 15; // Ajustar ancho de la columna A
    }

    // Agregar la fila de encabezados en la fila 2
    const headerRow = worksheet.getRow(2);
    headerRow.values = [
      "Nombre",
      "Dimensión",
      "Resultado",
      "Acción de Mejora 1",
      "Acción de Mejora 2",
      "Periodo Inicial 1",
      "Periodo FINAL 1",
      "Periodo Inicial 2",
      "Periodo FINAL 2",
    ];

    // Estilo de los encabezados
    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "9DC645" }, // Verde
      };
    });

    // Ajustar anchos de columna
    worksheet.columns = [
      { key: "jefe", width: 30 },
      { key: "dimensiones", width: 22 },
      { key: "promedio_respuesta", width: 15 },
      { key: "sugerencia_1", width: 35 },
      { key: "sugerencia_2", width: 35 },
      { key: "periodo_inicial_1", width: 15 },
      { key: "periodo_final_1", width: 15 },
      { key: "periodo_inicial_2", width: 15 },
      { key: "periodo_final_2", width: 15 },
    ];

    // Agregar los datos directamente a partir de la fila 3
    result.rows.forEach((dato, index) => {
      const dataRow = worksheet.getRow(3 + index);
      dataRow.values = [
        dato.jefe,
        dato.dimensiones,
        `${dato.promedio_respuesta}%`,
        dato.sugerencia_1,
        dato.sugerencia_2,
        dato.periodo_inicial_1,
        dato.periodo_final_1,
        dato.periodo_inicial_2,
        dato.periodo_final_2,
      ];
    });

    // Escribir el archivo Excel en un buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="plan_de_accion.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return new Response(JSON.stringify({ message: "Error en el servidor" }), {
      status: 500,
    });
  }
}