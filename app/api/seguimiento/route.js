import { turso } from '../../seed/db.js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Primero probar conexión básica
    try {
      const testQuery = 'SELECT 1 as test';
      await turso.execute(testQuery);
    } catch (dbError) {
      console.error('Error de conexión a BD:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error de conexión a la base de datos',
          details: dbError.message 
        },
        { status: 500 }
      );
    }

    // 1. Obtener todos los líderes con sus estadísticas generales
    const lideresQuery = `
      SELECT DISTINCT
        e.id as lider_id,
        e.nombre as lider_nombre,
        e.correo as lider_correo,
        c.cargo as lider_cargo,
        a.area as lider_area,
        COUNT(je.empleado_id) as total_empleados,
        SUM(CASE WHEN e2.encuesta = 1 THEN 1 ELSE 0 END) as empleados_respondieron,
        SUM(CASE WHEN e2.encuesta = 0 OR e2.encuesta IS NULL THEN 1 ELSE 0 END) as empleados_pendientes,
        ROUND(
          (SUM(CASE WHEN e2.encuesta = 1 THEN 1 ELSE 0 END) * 100.0) / 
          COUNT(je.empleado_id), 
          2
        ) as porcentaje_progreso
      FROM empleados e
      INNER JOIN jefe_empleado je ON e.id = je.jefe_id
      INNER JOIN empleados e2 ON je.empleado_id = e2.id
      LEFT JOIN cargo c ON e.cargoid = c.id
      LEFT JOIN area a ON c.areaid = a.id
      GROUP BY e.id, e.nombre, e.correo, c.cargo, a.area
      ORDER BY porcentaje_progreso DESC
    `;

    const { rows: lideres } = await turso.execute(lideresQuery);

    // 2. Para cada líder, obtener el detalle de empleados
    const lideresConDetalle = await Promise.all(
      lideres.map(async (lider) => {
        const empleadosQuery = `
          SELECT 
            e2.id as empleado_id,
            e2.nombre as empleado_nombre,
            e2.correo as empleado_correo,
            e2.encuesta as respondio,
            c.cargo as empleado_cargo
          FROM jefe_empleado je
          INNER JOIN empleados e2 ON je.empleado_id = e2.id
          LEFT JOIN cargo c ON e2.cargoid = c.id
          WHERE je.jefe_id = ?
          ORDER BY e2.nombre
        `;

        const { rows: empleados } = await turso.execute(empleadosQuery, [lider.lider_id]);

        return {
          ...lider,
          empleados: empleados.map(emp => ({
            ...emp,
            respondio: emp.respondio === 1 || emp.respondio === '1'
          }))
        };
      })
    );

    // 3. Obtener estadísticas generales
    const generalesQuery = `
      SELECT 
        COUNT(DISTINCT je.jefe_id) as total_lideres,
        COUNT(DISTINCT je.empleado_id) as total_empleados,
        SUM(CASE WHEN e.encuesta = 1 THEN 1 ELSE 0 END) as total_respondieron,
        SUM(CASE WHEN e.encuesta = 0 OR e.encuesta IS NULL THEN 1 ELSE 0 END) as total_pendientes,
        ROUND(
          (SUM(CASE WHEN e.encuesta = 1 THEN 1 ELSE 0 END) * 100.0) / 
          COUNT(DISTINCT je.empleado_id), 
          2
        ) as porcentaje_general
      FROM jefe_empleado je
      INNER JOIN empleados e ON je.empleado_id = e.id
    `;

    const { rows: [generales] } = await turso.execute(generalesQuery);

    // 4. Obtener áreas para filtros
    const areasQuery = `
      SELECT DISTINCT a.id, a.area
      FROM area a
      INNER JOIN cargo c ON a.id = c.areaid
      INNER JOIN empleados e ON c.id = e.cargoid
      INNER JOIN jefe_empleado je ON e.id = je.jefe_id
      ORDER BY a.area
    `;

    const { rows: areas } = await turso.execute(areasQuery);

    return NextResponse.json({
      success: true,
      data: {
        lideres: lideresConDetalle,
        generales: generales || {},
        areas: areas || []
      }
    });

  } catch (error) {
    console.error('Error en API de seguimiento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos de seguimiento',
        details: error.message 
      },
      { status: 500 }
    );
  }
}