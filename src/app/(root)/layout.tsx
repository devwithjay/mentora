import {ReactNode, Suspense} from "react";

import Footer from "@/components/footer";
import Navbar from "@/components/navigation/navbar";

const RootLayout = ({children}: {children: ReactNode}) => {
  return (
    <>
      <div className="custom-scrollbar relative flex h-full flex-col overflow-y-scroll">
        <header className="sticky top-0 z-100 backdrop-blur-sm">
          {" "}
          <Navbar />
        </header>

        <main className="grow">
          <Suspense>{children}</Suspense>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default RootLayout;
