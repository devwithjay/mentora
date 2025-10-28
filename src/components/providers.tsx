import {ReactNode} from "react";

import {SessionProvider} from "next-auth/react";
import {ThemeProvider as NextThemesProvider} from "next-themes";

import {auth} from "@/auth";

const Providers = async ({children}: {children: ReactNode}) => {
  const session = await auth();

  return (
    <>
      <SessionProvider session={session}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </SessionProvider>
    </>
  );
};

export default Providers;
