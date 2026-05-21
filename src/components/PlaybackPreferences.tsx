import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAYBACK_SPEEDS, usePreferences } from "@/contexts/PreferencesContext";

const PlaybackPreferences: React.FC = () => {
  const { playbackSpeed, setPlaybackSpeed } = usePreferences();
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="w-5 h-5" /> Velocidade de Reprodução
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Sua preferência é salva e aplicada automaticamente. Funciona em vídeos diretos (MP4/HLS).
          Em players externos (iframe), o controle pode ser limitado pelo provedor.
        </p>
        <div className="flex gap-2 flex-wrap">
          {PLAYBACK_SPEEDS.map((s) => (
            <Button
              key={s}
              variant={playbackSpeed === s ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setPlaybackSpeed(s)}
            >
              {s}x
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaybackPreferences;
