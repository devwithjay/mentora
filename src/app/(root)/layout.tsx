import {ReactNode} from "react";

import Navbar from "@/components/navigation/navbar";

const RootLayout = ({children}: {children: ReactNode}) => {
  return (
    <>
      <header>
        <Navbar />
      </header>

      <main className="grow">{children}</main>

      <footer className="p-4">
        <p className="text-secondary text-center">
          © {new Date().getFullYear()} Mentora.
        </p>
      </footer>
    </>
  );
};

export default RootLayout;
