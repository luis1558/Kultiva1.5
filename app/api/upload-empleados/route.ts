import { NextResponse } from 'next/server';
import { turso } from '../../seed/db';
import bcrypt from 'bcryptjs';
import { EmpleadoImport, ImportResult, JefeEmpleadoRelation } from '../../../types/employee';
import { parseExcelFileServer } from '../../../utils/excel-parser-server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    // Parsear el Excel (versión servidor)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const parseResult = parseExcelFileServer(buffer);
    
    if (parseResult.errores.length > 0) {
      return NextResponse.json({ 
        error: 'Errores de validación', 
        detalles: parseResult 
      }, { status: 400 });
    }

    // Procesar la importación
    const result = await processImport(parseResult.data);
    
    // Agregar warnings del parseo si hay
    if (parseResult.warnings.length > 0) {
      result.errores.push(...parseResult.warnings.map((w: string) => `Advertencia: ${w}`));
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error en importación:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor', 
      detalles: error 
    }, { status: 500 });
  }
}

async function processImport(empleados: EmpleadoImport[]): Promise<ImportResult> {
  const result: ImportResult = {
    empleadosImportados: 0,
    areasCreadas: 0,
    cargosCreados: 0,
    rolesCreados: 0,
    relacionesCreadas: 0,
    exitos: [],
    errores: []
  };

  try {
    // Sin transacción manual - Turso maneja esto automáticamente

    // 1. Recolectar todos los datos únicos
    const areas = new Set(empleados.map(emp => emp.area).filter(Boolean));
    const cargos = new Set(empleados.map(emp => emp.cargo).filter(Boolean));
    const roles = new Set(empleados.map(emp => emp.rol).filter(Boolean));

    // 2. Insertar áreas
    const areaIds: { [key: string]: number } = {};
    for (const area of areas) {
      try {
        const existingResult = await turso.execute({
          sql: 'SELECT id FROM area WHERE area = ?',
          args: [area]
        });

        if (existingResult.rows.length === 0) {
          const insertResult = await turso.execute({
            sql: 'INSERT INTO area (area) VALUES (?)',
            args: [area]
          });
          areaIds[area] = Number(insertResult.lastInsertRowid || 0);
          result.areasCreadas++;
        } else {
          areaIds[area] = Number(existingResult.rows[0].id);
        }
      } catch (error) {
        result.errores.push(`Error al procesar área "${area}": ${error}`);
      }
    }

    // 3. Insertar cargos
    const cargoIds: { [key: string]: number } = {};
    for (const cargo of cargos) {
      try {
        // Buscar el área correspondiente para este cargo
        const empleadoConCargo = empleados.find(emp => emp.cargo === cargo);
        const areaNombre = empleadoConCargo?.area;
        const areaId = areaNombre ? areaIds[areaNombre] : null;

        const existingResult = await turso.execute({
          sql: 'SELECT id FROM cargo WHERE cargo = ?',
          args: [cargo]
        });

        if (existingResult.rows.length === 0) {
          const insertResult = await turso.execute({
            sql: 'INSERT INTO cargo (cargo, areaid) VALUES (?, ?)',
            args: [cargo, areaId]
          });
          cargoIds[cargo] = Number(insertResult.lastInsertRowid || 0);
          result.cargosCreados++;
        } else {
          cargoIds[cargo] = Number(existingResult.rows[0].id);
        }
      } catch (error) {
        result.errores.push(`Error al procesar cargo "${cargo}": ${error}`);
      }
    }

    // 4. Insertar roles
    const rolIds: { [key: string]: number } = {};
    for (const rol of roles) {
      try {
        const existingResult = await turso.execute({
          sql: 'SELECT id FROM roles WHERE nombre = ?',
          args: [rol]
        });

        if (existingResult.rows.length === 0) {
          const insertResult = await turso.execute({
            sql: 'INSERT INTO roles (nombre) VALUES (?)',
            args: [rol]
          });
          rolIds[rol] = Number(insertResult.lastInsertRowid || 0);
          result.rolesCreados++;
        } else {
          rolIds[rol] = Number(existingResult.rows[0].id);
        }
      } catch (error) {
        result.errores.push(`Error al procesar rol "${rol}": ${error}`);
      }
    }

    // 5. Insertar empleados
    const empleadoIds: { [key: string]: number } = {};
    for (const empleado of empleados) {
      try {
        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(empleado.contraseña, 10);
        
        // Obtener IDs
        const cargoId = empleado.cargo ? cargoIds[empleado.cargo] : null;
        
        const insertResult = await turso.execute({
          sql: `
            INSERT INTO empleados (
              nombre, correo, contraseña, cargoid, cedula, genero, 
              fecha_nacimiento, fecha_ingreso, razon_social, ciudad, 
              sede, nivel_jerarquico, correo_enviado_plan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE) RETURNING id
          `,
          args: [
            empleado.nombre_completo,
            empleado.correo,
            hashedPassword,
            cargoId,
            empleado.cedula || null,
            empleado.genero || null,
            empleado.fecha_nacimiento || null,
            empleado.fecha_ingreso || null,
            empleado.razon_social || null,
            empleado.ciudad || null,
            empleado.sede || null,
            empleado.nivel_jerarquico || null
          ]
        });
        
        const empleadoId = Number(insertResult.lastInsertRowid || 0);
        empleadoIds[empleado.nombre_completo] = empleadoId;
        result.empleadosImportados++;

        // 6. Asignar rol al empleado
        if (empleado.rol) {
          const rolId = rolIds[empleado.rol];
          if (rolId) {
            await turso.execute({
              sql: 'INSERT OR IGNORE INTO rol_empleado (empleado_id, rol_id) VALUES (?, ?)',
              args: [empleadoId, rolId]
            });
          }
        }

      } catch (error) {
        result.errores.push(`Error al insertar empleado "${empleado.nombre_completo}": ${error}`);
      }
    }

    // 7. Crear relaciones jefe-empleado
    for (const empleado of empleados) {
      if (empleado.jefe_directo) {
        const empleadoId = empleadoIds[empleado.nombre_completo];
        const jefeId = empleadoIds[empleado.jefe_directo];
        
        if (empleadoId && jefeId && empleadoId !== jefeId) {
          try {
            await turso.execute({
              sql: 'INSERT OR IGNORE INTO jefe_empleado (empleado_id, jefe_id) VALUES (?, ?)',
              args: [empleadoId, jefeId]
            });
            result.relacionesCreadas++;
          } catch (error) {
            result.errores.push(`Error al crear relación jefe-empleado para "${empleado.nombre_completo}": ${error}`);
          }
        }
      }
    }

    result.exitos.push(`Importación completada exitosamente`);

    return result;

  } catch (error) {
    console.error('Error en processImport:', error);
    result.errores.push(`Error general en la importación: ${error}`);
    return result;
  }
}