
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
  { name: "Inicio", href: "/dashboard", icon: HomeIcon, roles: ['prueba'] },
  { name: "Instructivo", href: "/dashboard/instructivo", icon: DocumentCheckIcon, roles: [] },

  { name: "Resultados líder", href: "/dashboard/resultados-lider", icon: PresentationChartBarIcon, roles: [
    'Clearway Team Leader',
    'Medical Records Team Lead',
    'Credentialing Team Leader',
    'Clearway Trainer',
    'Team Leader',
    'IT Professional',
    'Gerente RH', 
    'Senior Account Manager',
    'Gerente General',
    'BIS Corporate Trainer',
    'Team Leader',
    'Account Manager',
    'Asc Ops Team Leader',
    'Qa & Trainer',
    'prueba',
  ] },
  { name: "Resultados gerencia", href: "/dashboard/resultados-general", icon: PresentationChartBarIcon, roles: [
    'Gerente RH',
    'Gerente General',
    'prueba',
  ] },
  { name: "Plan de acción líder", href: "/dashboard/plan-de-accion", icon: UserGroupIcon, roles: [
    'Clearway Team Leader',
    'Medical Records Team Lead',
    'Credentialing Team Leader',
    'Clearway Trainer',
    'Team Leader',
    'IT Professional',
    'Gerente RH', 
    'Senior Account Manager',
    'Gerente General',
    'BIS Corporate Trainer',
    'Team Leader',
    'Account Manager',
    'Asc Ops Team Leader',
    'Qa & Trainer',
    'prueba',
  ] },

  { name: "Plan de acción gerencia", href: "/dashboard/plan-de-accion-gerencia", icon: UserGroupIcon, roles: [
    'Gerente RH',
    'Gerente General',
    'prueba',
  ] },

  { name: "Preguntas Frecuentes", href: "/dashboard/preguntas-frecuentes", icon: QuestionMarkCircleIcon, roles: ['prueba'] },

  { name: "Contacto", href: "/dashboard/contacto", icon: DocumentDuplicateIcon, roles: ['prueba'] },
];

export default function NavLinks({ onLinkClick }: { onLinkClick: () => void }) {
  const { role } = useUserRole();
  const pathname = usePathname();

  return (
    <>
      {links
        .filter((link) => link.roles.length === 0 || link.roles.includes(role || ""))
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