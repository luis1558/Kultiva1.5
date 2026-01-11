-- INSTRUCCIONES PARA EJECUTAR ESTE SQL EN TURSO:

-- 1. Ingresa a la consola de Turso: https://ui.turso.tech/
-- 2. Selecciona tu base de datos
-- 3. Ve a "Shell" o "Query Editor"
-- 4. Copia y pega el siguiente SQL:

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correo TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token 
ON password_resets(token);

CREATE INDEX IF NOT EXISTS idx_password_resets_correo 
ON password_resets(correo);

CREATE INDEX IF NOT EXISTS idx_password_resets_correo_used 
ON password_resets(correo, used);

-- Para verificar que se creó correctamente:
-- .schema password_resets

-- Para ver si hay datos:
-- SELECT * FROM password_resets;

-- Para limpiar tokens expirados (opcional, puedes ejecutar periódicamente):
-- DELETE FROM password_resets WHERE expires_at < strftime('%s', 'now') AND used = FALSE;