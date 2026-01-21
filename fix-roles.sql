-- Para agregar la columna nivel a tu tabla existente
ALTER TABLE roles ADD COLUMN nivel INTEGER DEFAULT 1;

-- O si preferís recrear la tabla (más limpio)
DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  nivel INTEGER DEFAULT 1,
  descripcion TEXT
);