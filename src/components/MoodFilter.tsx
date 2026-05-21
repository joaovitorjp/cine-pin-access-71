import React from "react";
import { MOODS, MoodKey } from "@/lib/mood";
import { Button } from "@/components/ui/button";

interface Props {
  selected: MoodKey | null;
  onSelect: (m: MoodKey | null) => void;
}

const MoodFilter: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
      <Button
        size="sm"
        variant={selected === null ? "default" : "outline"}
        className="rounded-full whitespace-nowrap"
        onClick={() => onSelect(null)}
      >
        Todos os humores
      </Button>
      {MOODS.map((m) => (
        <Button
          key={m.key}
          size="sm"
          variant={selected === m.key ? "default" : "outline"}
          className="rounded-full whitespace-nowrap gap-1"
          onClick={() => onSelect(m.key === selected ? null : m.key)}
        >
          <span>{m.emoji}</span> {m.label}
        </Button>
      ))}
    </div>
  );
};

export default MoodFilter;
