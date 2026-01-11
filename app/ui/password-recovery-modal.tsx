"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordRecoveryModal({ isOpen, onClose }: PasswordRecoveryModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setMessageType(null);

    try {
      const res = await fetch("/api/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: email.toLowerCase() }),
      });

      const data = await res.json();
      setMessage(data.message);
      setMessageType(res.status === 200 ? "success" : "error");

      if (res.status === 200) {
        // Limpiar el formulario si fue exitoso
        setEmail("");
      }
    } catch (error) {
      setMessage("Error al intentar enviar el correo de recuperación");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          type="button"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-[#7C3E8F] to-[#6a347a] rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Usuario</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="text-gray-600 mt-2">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="recovery-email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                id="recovery-email"
                type="email"
                name="email"
                placeholder="tu.correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                 className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-[#7C3E8F] focus:ring-[#7C3E8F] focus:outline-none"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Email</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Mensaje de respuesta */}
          {message && messageType && (
            <div
              className={`rounded-md p-4 ${
                messageType === "success"
                  ? "bg-purple-50 text-purple-800 border border-purple-200"
                  : messageType === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {messageType === "success" ? (
                    <svg
                      className="h-5 w-5 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <title>Éxito</title>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : messageType === "error" ? (
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <title>Error</title>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <title>Información</title>
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3E8F] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#7C3E8F] to-[#6a347a] text-white px-4 py-3 rounded-md hover:from-[#6a347a] hover:to-[#5a2c6a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3E8F] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
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
                  Enviando...
                </div>
              ) : (
                "Enviar Enlace"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}