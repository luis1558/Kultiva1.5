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
    roles: ["employee", "leader", "gerente", "admin"],
  },
  {
    name: "Proteccion de datos",
    href: "/dashboard/instructivo",
    icon: DocumentCheckIcon,
    roles: ["employee", "leader", "gerente", "admin"],
  },

  {
    name: "Resultados líder",
    href: "/dashboard/resultados-lider",
    icon: PresentationChartBarIcon,
    roles: ["leader", "gerente", "admin"],
  },
  {
    name: "Resultados gerencia",
    href: "/dashboard/resultados-general",
    icon: PresentationChartBarIcon,
    roles: ["gerente", "admin"],
  },
  {
    name: "Plan de acción líder",
    href: "/dashboard/plan-de-accion",
    icon: UserGroupIcon,
    roles: ["leader", "gerente", "admin"],
  },

  {
    name: "Plan de acción gerencia",
    href: "/dashboard/plan-de-accion-gerencia",
    icon: UserGroupIcon,
    roles: ["gerente", "admin"],
  },

  {
    name: "Preguntas Frecuentes",
    href: "/dashboard/preguntas-frecuentes",
    icon: QuestionMarkCircleIcon,
    roles: ["admin"],
  },

  {
    name: "Contacto",
    href: "/dashboard/contacto",
    icon: DocumentDuplicateIcon,
    roles: ["admin"],
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
