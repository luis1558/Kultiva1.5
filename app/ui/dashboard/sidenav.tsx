import NavLinks from "../../ui/dashboard/nav-links";
import { PowerIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import React from "react";

export default function SideNav({ onMenuClose }: { onMenuClose: () => void }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <div className="flex flex-col min-h-full px-3 py-4 bg-gray-50 md:px-2">
      

      <div className="flex grow flex-col space-y-4 pt-7">
        {/* Pasar onMenuClose a NavLinks */}
        <NavLinks onLinkClick={onMenuClose} />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block">
          
        </div>
        <button
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100"
            onClick={handleSignOut}
          >
            <PowerIcon className="w-6" />
            <span>Cerrar sesión</span>
          </button>
      </div>
    </div>
  );
}