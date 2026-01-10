
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
import React, { useEffect, useState } from "react";

const links = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon, roles: ['prueba'] },
  { name: "Instructivo", href: "/dashboard/instructivo", icon: DocumentCheckIcon, roles: [] },

  //{ name: "Encuesta", href: "#", icon: DocumentDuplicateIcon, roles: [
  //  'Team Leader',
  //  'Medical Records Team Lead',
  //  'Asc Ops Team Leader',
  //  'Clearway Team Leader',
  //  'Clearway Trainer',
  //  'Account Manager',
  //  'Senior Account Manager',
  //  'BIS Corporate Trainer',
  //  'Qa & Trainer',
  //  'IT Professional',
  //  'Gerente RH',

  //] },

  { name: "Encuesta", href: "/dashboard/valoracion-colaborador", icon: DocumentDuplicateIcon, roles: [
    'Agent',
    'Asc Agent',
    'Asc Ops Agent',
    'Credentialing Team Leader',
    'Asc Sme',
    'Asc Agent',
    'Bd Sme',
    'Credentialing Agent',
    'HR Professional',
    'Clearway Agent',
    'Medical Support Sme',
    'Ops Sme',
    'Scheduling Agent',
    'Clearway Sme',
    'Scheduler Agent',
    'HSEQ Leader',
    'Communications Leader',
    'HR Leader',
    'Qa & Trainer',
    'Coastal Sme',
    'Account Manager',
    'Sme',
    'HR Business Partner',
    'Trainer',
    'IT Support',
    'prueba',
  ] },

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
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserRole = async () => {
      const res = await fetch("/api/user-role");
      if (res.ok) {
        const data = await res.json();
        setRole(data.user.role);
      } else {
        console.error("Error al obtener el rol del usuario");
      }
    };
    fetchUserRole();
  }, []);

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