"use client";

import React, { useState } from "react";
import {
  AtSymbolIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import { Button } from "./button";
import { useRouter } from "next/navigation";
import { useUser } from "../api/UserContext"; // Hook para acceder al UserContext
import PasswordRecoveryModal from "./password-recovery-modal";

export default function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para manejar el botón y la animación
  const [acceptDataTreatment, setAcceptDataTreatment] = useState(false); // Estado para el checkbox de tratamiento de datos
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false); // Estado para el modal de recuperación
  const { setUser } = useUser(); // Obtener la función setUser de UserContext
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar que el checkbox de tratamiento de datos esté aceptado
    if (!acceptDataTreatment) {
      setMessage("Debes aceptar el tratamiento de tus datos para continuar");
      return;
    }

    setIsSubmitting(true); // Desactiva el botón y activa la animación

    try {
      // Aseguramos que el correo se envíe en minúsculas
      const correoLower = correo.toLowerCase();

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: correoLower, contraseña }),
      });

      const data = await res.json();
      setMessage(data.message);

      if (res.status === 200) {
        // Ahora que el login es exitoso, hacemos una llamada a la API para obtener los datos del usuario
        const userRes = await fetch("/api/user");

        if (userRes.ok) {
          const { user } = await userRes.json();
          console.log("User:", user);

          // Guardamos el usuario en el contexto y en localStorage
          setUser(user);
          localStorage.setItem("user", JSON.stringify(user));

          // Redirigimos al dashboard solo después de que el usuario esté disponible
          router.push("/dashboard");
        } else {
          setMessage("No se pudo obtener los datos del usuario.");
        }
      } else {
        setMessage(data.message || "Error en el inicio de sesión");
      }
    } catch (error) {
      setMessage("Error al intentar iniciar sesión");
    } finally {
      setIsSubmitting(false); // Reactiva el botón después de completar
    }
  };

  return (
    <>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8 border border-bg-[#D3D3D3]">
          <h1 className="mb-3 text-[28px] font-medium">Encuesta de clima</h1>

          <div className="w-full">
            {/* Campo de correo */}
            <div>
              <label
                className="mb-3 mt-5 block text-sm font-medium text-gray-900"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Ingresa tu correo"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
              </div>
            </div>

            {/* Campo de contraseña */}
            <div className="mt-4">
              <label
                className="mb-3 mt-5 block text-sm font-medium text-gray-900"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 pr-10 text-sm outline-2 placeholder:text-gray-500"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  required
                  minLength={6}
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeIcon className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Botón de enviar */}
          <Button
            className="mt-4 w-full flex justify-center items-center"
            disabled={isSubmitting} // Desactivar el botón si está cargando
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Cargando"
              >
                <title>Cargando</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : (
              <>
                Ingresar{" "}
                <svg
                  className="ml-auto h-5 w-5 text-gray-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Flecha derecha</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </Button>

          <Button
            className="mt-4 w-full flex justify-center items-center"
            type="button" // Importante para que no envíe el formulario
            onClick={() => setIsRecoveryModalOpen(true)}
          >
            <>
              Recuperar Contraseña{" "}
              <svg
                className="ml-auto h-5 w-5 text-gray-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Flecha derecha</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          </Button>

          <div className="mt-4 flex items-start">
            <input
              type="checkbox"
              id="dataTreatment"
              name="dataTreatment"
              className="mr-2 mt-1"
              checked={acceptDataTreatment}
              onChange={(e) => setAcceptDataTreatment(e.target.checked)}
            />
            <label htmlFor="dataTreatment" className="text-xs text-gray-700">
              Al responder esta encuesta, autorizas el tratamiento de tus datos
              con fines de análisis de clima organizacional. Tus respuestas
              serán confidenciales y los resultados se reportarán de forma
              agregada, sin identificación individual.
            </label>
          </div>

          <div className="mt-6 flex items-center justify-center">
            {message && (
              <p className="text-red-600 font-semibold text-sm bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center">
                {message}
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Modal de recuperación de contraseña - FUERA del formulario principal */}
      <PasswordRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
      />
    </>
  );
}
