import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  PresentationChartBarIcon,
  QuestionMarkCircleIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserRole } from "../../../hooks/useUserRole";
import React from "react";

const links = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: HomeIcon,
    roles: ["consultores", "leader", "gerente", "employee", "admin"],
  },
  {
    name: "Proteccion de datos",
    href: "/dashboard/instructivo",
    icon: DocumentCheckIcon,
    roles: ["consultores", "employee", "leader", "gerente", "admin"],
  },

  {
    name: "Resultados líder",
    href: "/dashboard/resultados-lider",
    icon: PresentationChartBarIcon,
    roles: [
      "consultores" /*"leader solo cuando esten los resultados listos"*/ /*"gerente" igual que el lider*/,
      ,
      "admin",
    ],
  },
  {
    name: "Resultados gerencia",
    href: "/dashboard/resultados-general",
    icon: PresentationChartBarIcon,
    roles: ["consultores" /*"gerente" solo cuando esten listos*/, , "admin"],
  },
  {
    name: "Plan de acción líder",
    href: "/dashboard/plan-de-accion",
    icon: UserGroupIcon,
    roles: [
      "consultores" /*"leader" solo cuando esten listos*/ /*"gerente"*/,
      ,
      ,
      "admin",
    ],
  },

  {
    name: "Plan de acción gerencia",
    href: "/dashboard/plan-de-accion-gerencia",
    icon: UserGroupIcon,
    roles: ["consultores" /*"gerente" solo cuando este listo */, , "admin"],
  },
  {
    name: "Seguimiento",
    href: "/dashboard/seguimiento",
    icon: DocumentDuplicateIcon,
    roles: ["consultores", "gerente", "admin"],
  },
  {
    name: "Preguntas Frecuentes",
    href: "/dashboard/preguntas-frecuentes",
    icon: QuestionMarkCircleIcon,
    roles: ["consultores", "gerente", "leader", "admin"],
  },

  {
    name: "Contacto",
    href: "/dashboard/contacto",
    icon: DocumentDuplicateIcon,
    roles: ["consultores", "gerente", "leader", "employee", "admin"],
  },
];

export default function NavLinks({ onLinkClick }: { onLinkClick: () => void }) {
  const { roles } = useUserRole();
  const pathname = usePathname();

  return (
    <>
      {links
        .filter(
          (link) =>
            link.roles.length === 0 ||
            link.roles.some((rol) => roles.includes(rol)),
        )
        .map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex h-[48px] items-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-[#6a347a] hover:text-white ${
                pathname === link.href ? "bg-sky-100 text-[#7c3e8f]" : ""
              }`}
              onClick={onLinkClick}
            >
              <LinkIcon className="w-6" />
              <span className="block">{link.name}</span>
            </Link>
          );
        })}
    </>
  );
}
