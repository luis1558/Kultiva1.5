import React from "react";

export default function InstructivoPage() {
    return (
        <iframe 
            src="/pdf/Instructivo.pdf"
            style={{
                width: '100%',
                height: '100vh',
                border: 'none',
            }}
            title="Instructivo"
        />
    );
}