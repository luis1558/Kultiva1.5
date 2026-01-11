-- TABLA PARA RECUPERACIÓN DE CONTRASEÑAS
-- Ejecuta este SQL en tu base de datos Turso

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correo TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at INTEGER NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Índice para búsquedas más rápidas por token
CREATE INDEX IF NOT EXISTS idx_password_resets_token 
ON password_resets(token);

-- Índice para búsquedas por correo
CREATE INDEX IF NOT EXISTS idx_password_resets_correo 
ON password_resets(correo);

-- Índice combinado para buscar tokens activos por correo
CREATE INDEX IF NOT EXISTS idx_password_resets_correo_used 
ON password_resets(correo, used);

-- Limpiar tokens expirados automáticamente (opcional, puedes ejecutar periódicamente)
-- DELETE FROM password_resets WHERE expires_at < strftime('%s', 'now') AND used = FALSE;
