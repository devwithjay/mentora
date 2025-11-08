import Link from "next/link";

import {LogOut, User} from "lucide-react";
import {signOut} from "next-auth/react";

import {getCurrentUser} from "@/auth";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
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
import Login from "./sign-in";
import SignUp from "./sign-up";
import Theme from "./theme";

const Navbar = async () => {
  const user = await getCurrentUser();

  return (
    <nav className="flex w-full items-center justify-between gap-5 px-6 py-4 sm:px-12">
      <Logo showText />

      <div className="flex gap-x-2 sm:gap-x-5">
        <Theme />
        {!user ? (
          <>
            <div className="flex gap-x-4 max-sm:hidden">
              <Login />
              <SignUp />
            </div>
          </>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="hidden scale-110 cursor-pointer rounded-md sm:block">
                <AvatarImage src={user.image || ""} alt={user.name!} />
                <AvatarFallback className="rounded-md dark:bg-(--background-secondary)">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-primary mt-2 mr-5 sm:mr-11">
              <DropdownMenuLabel className="text-secondary text-sm font-light">
                {user.username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
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
                <Button
                  type="submit"
                  className="-ml-2.5 h-fit p-0 font-normal"
                  variant="ghost"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
