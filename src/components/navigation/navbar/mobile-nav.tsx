"use client";

import Link from "next/link";
import {useState} from "react";

import {LogOut, Menu, User, X} from "lucide-react";
import {signOut} from "next-auth/react";

import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import {useCurrentUser} from "@/hooks/use-current-user";

import Login from "./sign-in";
import SignUp from "./sign-up";

const MobileNav = () => {
  const {user} = useCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-primary border-primary cursor-pointer border hover:bg-transparent sm:hidden"
        onClick={toggleMobileMenu}
      >
        {mobileMenuOpen ? (
          <X className="size-5" />
        ) : (
          <Menu className="size-5" />
        )}
      </Button>

      {mobileMenuOpen && (
        <div
          className={`bg-primary fixed inset-0 top-16 z-50 flex h-screen flex-col px-6 py-4 transition-all duration-300 ease-in-out sm:hidden ${
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-5 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-3 pt-4">
            {!user ? (
              <>
                <Login />
                <SignUp />
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.PROFILE(user.username)}
                  className="text-secondary hover:text-primary flex justify-center gap-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  className="text-secondary cursor-pointer text-left text-sm font-medium hover:bg-transparent"
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
