import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});


/*
// Verificar la conexión con una consulta simple
(async () => {
    try {
        const result = await turso.execute('SELECT 1');
        console.log('Database connection is working', result);
    } catch (error) {
        console.error('Error connecting to the database', error);
    }
})();

*/