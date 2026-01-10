import { turso } from "../../seed/db";
import ExcelJS from "exceljs";
import fs from "fs"; // Necesario para leer la imagen

export async function GET(req) {
    try {
        const result = await turso.execute(`
            SELECT * FROM vw_resumen_plan_de_accion_general
        `);

        if (!Array.isArray(result.rows) || result.rows.length === 0) {
            return new Response(
                JSON.stringify({ message: "No se encontraron datos" }),
                { status: 404 }
            );
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Plan de Acción gerencia");

        // Agregar el título en la fila 1
        const titleRow = worksheet.addRow([]);
        titleRow.getCell(2).value = "Plan de acción gerencia: encuesta de clima organizacional";

        // Combinar celdas B1 a I1
        worksheet.mergeCells("B1:I1");


        // Estilo del título
        titleRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
        titleRow.getCell(2).font = { bold: true, color: { argb: "FFFFFF" }, size: 14 };
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
            "Dimensión",
            "Resultado",
            "Acción de Mejora 1",
            "Acción de Mejora 2",
            "Periodo Inicial 1",
            "Periodo Final 1",
            "Periodo Inicial 2",
            "Periodo Final 2",
        ];

        // Estilo para los encabezados
        headerRow.eachCell((cell) => {
            cell.font = {
                bold: true,
                color: { argb: "9DC645" }
            };
        });

        // Definir columnas
        worksheet.columns = [
            { key: "Dimensión", width: 22 },
            { key: "Resultado", width: 15 },
            { key: "Acción de Mejora 1", width: 30 },
            { key: "Acción de Mejora 2", width: 30 },
            { key: "Periodo Inicial 1", width: 15 },
            { key: "Periodo Final 1", width: 15 },
            { key: "Periodo Inicial 2", width: 15 },
            { key: "Periodo Final 2", width: 15 },
        ];

        // Agregar los datos a partir de la fila 3
        result.rows.forEach((dato, index) => {
            const dataRow = worksheet.getRow(3 + index)
            dataRow.values = [
                dato.dimensiones,
                `${dato.promedio}%`,
                dato["Accion de mejora 1"],
                dato["Accion de mejora 2"],
                dato["Periodo Inicial 1"],
                dato["Periodo Final 1"],
                dato["Periodo Inicial 2"],
                dato["Periodo Final 2"],
            ];
        });



        // Escribir archivo excel en el buffer
        const buffer = await workbook.xlsx.writeBuffer();

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": "attachment; filename=plan_de_accion_gerencia.xlsx",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ message: "Error al generar el archivo Excel" }),
            { status: 500 }
        );
    }
}
