import React from "react";

export default function preguntasfrecuentesPage() {
    return (
        <iframe 
            src="/pdf/Preguntas-frecuentes.pdf"
            style={{
                width: '100%',
                height: '100vh',
                border: 'none',
            }}
            title="Preguntas Frecuentes"
        />
    );
}