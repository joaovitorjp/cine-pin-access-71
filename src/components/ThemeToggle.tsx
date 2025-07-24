import React from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="flex items-center gap-2"
    >
      {theme === "dark" ? (
        <>
          <Sun className="w-4 h-4" />
          Claro
        </>
      ) : (
        <>
          <Moon className="w-4 h-4" />
          Escuro
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;