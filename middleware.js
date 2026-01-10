import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.AUTH_SECRET || 'mysecretkey');

export async function middleware(req) {
    const token = req.cookies.get('token')?.value;

    if (req.nextUrl.pathname === '/login') {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        await jwtVerify(token, SECRET_KEY);
        return NextResponse.next();
    } catch (error) {
        console.error('Token no válido:', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }
}

export const config = {
    matcher: ['/dashboard', '/dashboard/(plan-de-accion|resultados-lider|preguntas-frecuentes|contacto|valoracion|valoracion-colaborador|intructivo)'],
};
