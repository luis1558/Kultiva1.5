import React from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import AcmeLogo from "../acme-logo";
import CombinadosLogo from "../combinados-logo";
import IsoKultivaLogo from "../iso-kultiva-logo"
import BisLogoDentro from "../bis-logo-dentro";

export default function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  return (
    <header className="w-full bg-[#E8E8E8] shadow-md">
      <div className="flex items-center justify-between px-6 py-4 relative">
        {/* Botón hamburguesa en móviles */}
        <button
          className="lg:hidden flex items-center justify-center p-2 text-gray-600"
          onClick={onMenuToggle}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-4">
          <AcmeLogo />
        </div>

        {/* Título ligeramente a la izquierda */}
        {/* Ajusta el valor de "left" para mover el título más a la izquierda (ej. "left-[calc(50%-20px)]" o "left-1/3"). */}
        <h1 className="text-3xl hidden lg:flex absolute left-[calc(60%-40px)] transform -translate-x-1/2">
          Encuesta de clima organizacional
        </h1>

        {/* Logo de IsoKultiva */}
        <div className="flex items-center space-x-4">
        <IsoKultivaLogo />
        </div>
          
      </div>
    </header>
  );
}