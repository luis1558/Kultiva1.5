"use client";
import Navbar from "../ui/dashboard/navbar";
import SideNav from "../ui/dashboard/sidenav";
import React, { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex flex-col h-screen w-screen overflow-auto">
      {/* NAVBAR FIJO ARRIBA */}
      <nav className="fixed top-0 left-0 w-full h-16 z-50 bg-white shadow">
        <Navbar onMenuToggle={toggleMenu} />
      </nav>

      {/* CONTENEDOR INFERIOR (SideNav + Main) 
          pt-16 => deja espacio debajo del navbar fijo de 4rem (h-16)
          flex-1 => este contenedor crecerá para llenar el resto del alto */}
      <div className="pt-16 flex-1 flex">
        {/* SideNav fijo a la izquierda (toggle en mobile) */}
        <aside
  className={`
    fixed 
    top-16         /* Debajo del navbar de 4rem */
    left-0 
    w-64 
    h-[calc(100vh-4rem)] 
    bg-gray-50 
    z-40 
    transform transition-transform
    overflow-y-auto  /* Permite scroll si el contenido es demasiado largo */
    ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
    lg:translate-x-0
  `}
>
  <SideNav onMenuClose={toggleMenu} />
</aside>


        {/* MAIN: ocupa TODO el espacio disponible a la derecha del SideNav */}
        <main
          className="
            flex-1
            ml-0 lg:ml-64  /* corre a la derecha en pantallas grandes */
            overflow-y-auto
            bg-gray-100
            p-4
          "
        >
          {children}
        </main>
      </div>
    </div>
  );
}