import React from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Usamos pointerdown para resposta instantânea no mobile,
  // evitando o atraso de 300ms de cliques sintéticos em alguns navegadores.
  const handleToggle = (e: React.PointerEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onPointerDown={handleToggle}
      onClick={(e) => {
        // Fallback para navegadores sem PointerEvents
        e.preventDefault();
        e.stopPropagation();
      }}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      aria-pressed={isDark}
      className="flex items-center gap-2 touch-manipulation select-none active:scale-95 transition-transform"
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
