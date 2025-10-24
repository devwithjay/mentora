import {ReactNode} from "react";

import Navbar from "@/components/navigation/navbar";

const RootLayout = ({children}: {children: ReactNode}) => {
  return (
    <>
      <header>
        <Navbar />
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="p-4">
        <p className="text-center text-gray-500">Add commentMore actions
          © {new Date().getFullYear()} Next Starter.
        </p>
      </footer>
    </>
  );
};

export default RootLayout;
