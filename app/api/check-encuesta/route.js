//API PARA CHECAR SI EL USUARIO YA CONTESTO LA ENCUESTA
import { NextResponse } from "next/server";
import { turso } from "../../seed/db";

export async function GET() {
    try {
        const result = await turso.execute(
            `SELECT * FROM empleados`
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "No se encontraron empleados en la base de datos" }, { status: 404 });
        }

        return NextResponse.json(result.rows, { status: 200 });

    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        return NextResponse.json({ error: "Error al obtener los empleados" }, { status: 500 });
    }
}