import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const handledPointerRef = useRef(false);

  const triggerToggle = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    handledPointerRef.current = true;
    triggerToggle(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (handledPointerRef.current) {
      handledPointerRef.current = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    triggerToggle(e);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-pressed={isDark}
      className="flex items-center gap-2 touch-manipulation select-none active:scale-95 transition-transform min-w-24"
    >
      {isDark ? (
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
