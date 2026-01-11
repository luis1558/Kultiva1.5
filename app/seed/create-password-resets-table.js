import { turso } from './db.js';

async function createPasswordResetsTable() {
  try {
    console.log("Creando tabla password_resets...");
    
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        correo TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at INTEGER NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    
    console.log("Tabla password_resets creada exitosamente");
    
    // Crear índice para búsquedas más rápidas
    await turso.execute(`
      CREATE INDEX IF NOT EXISTS idx_password_resets_token 
      ON password_resets(token)
    `);
    
    console.log("Índice creado exitosamente");
    
  } catch (error) {
    console.error("Error al crear la tabla password_resets:", error);
  }
}

createPasswordResetsTable();