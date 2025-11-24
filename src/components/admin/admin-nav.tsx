"use client";

import {Route} from "next";
import Link from "next/link";
import {usePathname} from "next/navigation";

import {AlertCircle, Users} from "lucide-react";

export const AdminNav = () => {
  const pathname = usePathname();

  const links = [
    {
      href: "/admin/dashboard",
      label: "Users",
      icon: Users,
    },
    {
      href: "/admin/issues",
      label: "Issues",
      icon: AlertCircle,
    },
  ];

  return (
    <nav className="border-primary bg-primary sticky top-0 z-10 border-b">
      <div className="mx-auto flex max-w-7xl gap-1 px-6">
        {links.map(link => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href as Route}
              className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                isActive
                  ? "text-brand border-brand"
                  : "text-secondary hover:text-primary border-transparent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
