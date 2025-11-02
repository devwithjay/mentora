"use client";

import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";

import {Button} from "@/components/ui/button";

const Theme = () => {
  const {theme, setTheme} = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        className="btn-secondary"
        onClick={toggleTheme}
      >
        <Moon className="scale-[115%] rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Sun className="absolute scale-0 rotate-90 transition-all dark:scale-[115%] dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};

export default Theme;
