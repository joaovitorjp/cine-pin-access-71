
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Tv, Key, Sparkles } from "lucide-react";

interface AdminStatsProps {
  moviesCount: number;
  seriesCount: number;
  animesCount: number;
  pinsCount: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({ moviesCount, seriesCount, animesCount, pinsCount }) => {

  return (
    <div className="grid gap-4 mb-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Film className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">Filmes</p>
              <p className="text-2xl font-bold">{moviesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Tv className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">Séries</p>
              <p className="text-2xl font-bold">{seriesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Sparkles className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">Animes</p>
              <p className="text-2xl font-bold">{animesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-netflix-dark border-gray-800">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <Key className="w-8 h-8 text-netflix-red" />
            <div>
              <p className="text-sm text-gray-400">PINs Ativos</p>
              <p className="text-2xl font-bold">{pinsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminStats;
