import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-netflix-gray w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-netflix-dark border-gray-700 text-white placeholder-netflix-gray"
      />
    </div>
  );
};

export default AdminSearchBar;