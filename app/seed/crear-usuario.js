/*import bcrypt from 'bcrypt';
import { turso } from './db.js'; 

async function crearUsuarios() {
    const empleados = [
        { usuario: 'adminn@admin.com', contraseña: '12345678', cedula:  '1245246' },
        
    ];

    for (const empleado of empleados) {
        // Genera un hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(empleado.contraseña, salt);

        // Inserta el usuario con la contraseña encriptada en la base de datos
        await turso.execute(
            'INSERT INTO usuarios (usuario, contraseña, cedula) VALUES (?, ?, ?)',
            [empleado.usuario, hashedPassword, empleado.cedula]
        );
    }

    console.log('Usuarios creados exitosamente');
}

crearUsuarios().catch(console.error);*/

import bcrypt from 'bcrypt';
import { turso } from './db.js';

async function crearUsuarios() {
    const empleados = [
        { usuario: 'willyevm@hotmail.com', contraseña: '12345678', cedula: '135791', genero: 'm', nombre: 'WILFRIDO ENRIQUE VILORIA MONTES', fecha_nacimiento: '1974-11-11', fecha_ingreso: '2016-02-01', sede: 'SEDE 1', nivel_jerarquico: 'N1 ESTRATÉGICO' },
        { usuario: 'ginabayonagh@gmail.com', contraseña: '12345678', cedula: '135798', genero: 'f', nombre: 'GINA BAYONA ARENGAS', fecha_nacimiento: '1984-06-04', fecha_ingreso: '2021-12-06', sede: 'SEDE 2', nivel_jerarquico: 'N3 OPERATIVO' },
        { usuario: 'alejaviloriaboom@gmail.com', contraseña: '12345678', cedula: '135792', genero: 'f', nombre: 'ALEJANDRA VILORIA', fecha_nacimiento: '1985-08-16', fecha_ingreso: '2013-08-20', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'shir.boom@hotmail.com', contraseña: '12345678', cedula: '135793', genero: 'f', nombre: 'SHIRLEY BOOM SILVA', fecha_nacimiento: '1990-03-26', fecha_ingreso: '2017-04-03', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'mguerrero0113@gmail.com', contraseña: '12345678', cedula: '135794', genero: 'm', nombre: 'MAURICIO GUERRERO DE MOYA', fecha_nacimiento: '1990-12-07', fecha_ingreso: '2023-03-06', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'nimiapedrozo@hotmail.com', contraseña: '12345678', cedula: '135795', genero: 'f', nombre: 'NIMIA PEDROZO OLIVER', fecha_nacimiento: '1978-03-08', fecha_ingreso: '2018-07-16', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'marcelamarrugo1124@gmail.com', contraseña: '12345678', cedula: '135796', genero: 'f', nombre: 'MARCELA MARRUGO', fecha_nacimiento: '1983-10-12', fecha_ingreso: '2021-12-20', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'natalysierradonado@gmail.com', contraseña: '12345678', cedula: '135797', genero: 'f', nombre: 'NATALIA SIERRA', fecha_nacimiento: '1977-06-15', fecha_ingreso: '2017-12-01', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'sofyloren1012@hotmail.com', contraseña: '12345678', cedula: '135799', genero: 'f', nombre: 'SOFIA LOREN', fecha_nacimiento: '1980-10-17', fecha_ingreso: '2013-05-20', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'samcag05@hotmail.com', contraseña: '12345678', cedula: '135800', genero: 'f', nombre: 'SANDRA CARO GONZALEZ', fecha_nacimiento: '1966-04-23', fecha_ingreso: '2023-04-12', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'cmendozasilvera@gmail.com', contraseña: '12345678', cedula: '135801', genero: 'm', nombre: 'CARLOS MENDOZA SILVERA', fecha_nacimiento: '1994-01-09', fecha_ingreso: '2021-07-22', sede: 'SEDE 1', nivel_jerarquico: 'N2 TÁCTICO' },
        { usuario: 'gamaliel.rodriguez@gmail.com', contraseña: '12345678', cedula: '135802', genero: 'm', nombre: 'GAMALIEL RODRIGUEZ MAMPOTES', fecha_nacimiento: '1966-04-23', fecha_ingreso: '2013-07-22', sede: 'SEDE 1', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'ledys.herrera@gmail.com', contraseña: '12345678', cedula: '135803', genero: 'f', nombre: 'LEDYS HERRERA BULA', fecha_nacimiento: '1980-10-17', fecha_ingreso: '2021-06-21', sede: 'SEDE 1', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'mialmero17@gmail.com', contraseña: '12345678', cedula: '135805', genero: 'm', nombre: 'MIGUEL MEDINA RODRIGUEZ', fecha_nacimiento: '1999-11-27', fecha_ingreso: '2023-09-11', sede: 'SEDE 2', nivel_jerarquico: 'N3 OPERATIVO' },
        { usuario: 'alex.barranco@gmail.com', contraseña: '12345678', cedula: '135804', genero: 'f', nombre: 'ALEX BARRANCO TORRES', fecha_nacimiento: '1998-01-12', fecha_ingreso: '2023-12-04', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'jesus.perez@gmail.com', contraseña: '12345678', cedula: '135806', genero: 'm', nombre: 'JESUS PEREZ', fecha_nacimiento: '2004-04-25', fecha_ingreso: '2023-03-06', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'angelica.tous@gmail.com', contraseña: '12345678', cedula: '135807', genero: 'f', nombre: 'ANGELICA TOUS', fecha_nacimiento: '2003-11-24', fecha_ingreso: '2023-09-18', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' },
        { usuario: 'laura.suarez@gmail.com', contraseña: '12345678', cedula: '135808', genero: 'f', nombre: 'LAURA SUAREZ', fecha_nacimiento: '1986-11-12', fecha_ingreso: '2023-08-14', sede: 'SEDE 2', nivel_jerarquico: 'N4 COLABORADOR' }
    ];

    for (const empleado of empleados) {
        // Genera un hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(empleado.contraseña, salt);

        // Inserta el usuario con la contraseña encriptada en la base de datos
        await turso.execute(
            `INSERT INTO empleados (
                nombre, correo, contraseña, cedula, genero, 
                fecha_nacimiento, fecha_ingreso, sede, nivel_jerarquico
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                empleado.nombre,
                empleado.usuario,
                hashedPassword,
                empleado.cedula,
                empleado.genero,
                empleado.fecha_nacimiento,
                empleado.fecha_ingreso,
                empleado.sede,
                empleado.nivel_jerarquico
            ]
        );
    }

    console.log('Usuarios creados exitosamente');
}

crearUsuarios().catch(console.error);
