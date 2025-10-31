import React from "react";

import Theme from "@/components/navigation/navbar/theme";

const AuthLayout = ({children}: Readonly<{children: React.ReactNode}>) => {
  return (
    <>
      <header>
        <nav className="px-6 py-4 text-end sm:px-12">
          <Theme />
        </nav>
      </header>

      <main className="flex grow items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-10">
        {children}
      </main>

      <footer className="flex justify-between px-6 py-4 sm:px-12">
        <p className="text-center text-(--text-secondary)">
          © {new Date().getFullYear()} Proof Kit.
        </p>
      </footer>
    </>
  );
};
export default AuthLayout;
