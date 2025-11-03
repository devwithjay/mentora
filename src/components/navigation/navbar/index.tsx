"use client";

import {useState} from "react";

import {Menu, X} from "lucide-react";

import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";

import Logo from "./logo";
import Login from "./sign-in";
import SignUp from "./sign-up";
import Theme from "./theme";

const Navbar = () => {
  const isUser = false;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-primary flex w-full items-center justify-between gap-5 px-6 py-4 sm:px-12">
      <Logo showText />

      <div className="flex gap-x-4">
        <Theme />
        {!isUser ? (
          <>
            <div className="flex gap-x-4 max-sm:hidden">
              <Login />
              <SignUp />
            </div>
          </>
        ) : (
          <Avatar className="size-9 rounded-md">
            <AvatarImage src="" alt="profile-img" />
            <AvatarFallback className="rounded-md">
              A<sup>2</sup>
            </AvatarFallback>
          </Avatar>
        )}

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
      </div>

      {mobileMenuOpen && (
        <div
          className={`bg-primary fixed inset-0 top-16 z-50 flex flex-col items-end px-6 py-4 transition-all duration-300 ease-in-out sm:hidden ${
            mobileMenuOpen
              ? "translate-y-0 opacity-100"
              : "-translate-y-5 opacity-0"
          }`}
        >
          <div className="flex flex-col items-end gap-3 pt-4">
            <Login />
            <SignUp />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
