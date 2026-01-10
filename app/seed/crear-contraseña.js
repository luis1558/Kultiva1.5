import bcrypt from 'bcrypt';

async function generarHashContraseña() {
    const contraseña = '12345678';
    
    // Genera un hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseña, salt);

    console.log('Contraseña original:', contraseña);
    console.log('Contraseña hasheada:', hashedPassword);
}

generarHashContraseña().catch(console.error);