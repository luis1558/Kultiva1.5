import React from "react";

export default function contactoPage() {
  return (
    <div className="h-screen flex justify-center mt-24 min-w-96">
      <div className="max-w-5xl text-center px-4">
        {" "}
        {/* Añadido px-4 para espaciado horizontal */}
        <h2 className="mb-4 ">
          Si deseas reportar un error sobre la encuesta o tienes alguna duda,
          <br />
          comunícate con:
        </h2>
        <div className="text-center">
          {" "}
          {/* Alineación central del texto */}
          <p className="pt-6">
            Luis Castañeda <br />
            luis.castañeda@ejemplo.com
          </p>
        </div>
        <p className="pt-8">
          Yudithsa Rodriguez <br />
          yudithsa.rodriguez@ejemplo.com
        </p>
      </div>
    </div>
  );
}
