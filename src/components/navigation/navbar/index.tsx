import Link from "next/link";

import {User} from "lucide-react";

import {getCurrentUser} from "@/auth";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ROUTES from "@/constants/routes";

import Logo from "./logo";
import MobileNav from "./mobile-nav";
import Login from "./sign-in";
import Logout from "./sign-out";
import SignUp from "./sign-up";
import Theme from "./theme";

const Navbar = async ({hideLogo = false}: {hideLogo?: boolean}) => {
  const user = await getCurrentUser();

  return (
    <nav className="flex w-full items-center justify-end gap-5 px-8 py-4 sm:px-12">
      {!hideLogo && (
        <div className="mr-auto">
          <Logo showText />
        </div>
      )}

      <div className="flex gap-x-2 sm:gap-x-5">
        <Theme />

        {!user ? (
          <div className="flex gap-x-4 max-sm:hidden">
            <Login />
            <SignUp />
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="border-primary hidden scale-110 cursor-pointer rounded-md border sm:block">
                <AvatarImage src={user.image || ""} alt={user.name!} />
                <AvatarFallback className="rounded-md dark:bg-(--background-secondary)">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-primary border-primary mt-4 mr-5 border sm:mr-11">
              <DropdownMenuLabel className="text-secondary text-sm font-light">
                {user.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="border-primary border" />
              <DropdownMenuItem className="cursor-pointer focus:bg-(--background-secondary)">
                <Link
                  href={ROUTES.PROFILE(user.username)}
                  className="flex items-center gap-2.5"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer focus:bg-(--background-secondary)">
                <Logout />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <MobileNav />
      </div>
    </nav>
  );
};

export default Navbar;
