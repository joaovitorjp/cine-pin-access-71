import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Image as ImageIcon, Save } from "lucide-react";
import { getHomeBanners, setHomeBanners, MAX_BANNERS, HomeBanner } from "@/services/bannerService";

const emptySlot = (i: number): HomeBanner => ({ id: `banner-${i}`, url: "", link: "" });

const BannerManager: React.FC = () => {
  const [slots, setSlots] = useState<HomeBanner[]>(
    Array.from({ length: MAX_BANNERS }, (_, i) => emptySlot(i))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHomeBanners()
      .then((data) => {
        const next = Array.from({ length: MAX_BANNERS }, (_, i) => data[i] || emptySlot(i));
        setSlots(next);
      })
      .catch(() => {});
  }, []);

  const update = (i: number, patch: Partial<HomeBanner>) => {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setHomeBanners(slots);
      toast({ title: "Banners salvos com sucesso" });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao salvar banners", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Banners da Tela Inicial
          </h2>
          <p className="text-sm text-netflix-gray mt-1">
            Configure até {MAX_BANNERS} banners. Eles passam automaticamente na tela inicial após o login.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-netflix-red hover:bg-red-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Banners"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((s, i) => (
          <Card key={i} className="bg-netflix-dark border-gray-700">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Banner {i + 1}</span>
                {s.url && (
                  <button
                    type="button"
                    onClick={() => update(i, { url: "", link: "" })}
                    className="text-xs text-netflix-gray hover:text-red-400"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="aspect-[21/9] bg-gray-800 rounded overflow-hidden flex items-center justify-center">
                {s.url ? (
                  <img
                    src={s.url}
                    alt={`Banner ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`url-${i}`} className="text-xs">URL da imagem</Label>
                <Input
                  id={`url-${i}`}
                  value={s.url}
                  onChange={(e) => update(i, { url: e.target.value })}
                  placeholder="https://exemplo.com/banner.jpg"
                  className="bg-gray-700 border-gray-600 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`link-${i}`} className="text-xs">Link (opcional)</Label>
                <Input
                  id={`link-${i}`}
                  value={s.link || ""}
                  onChange={(e) => update(i, { link: e.target.value })}
                  placeholder="https://..."
                  className="bg-gray-700 border-gray-600 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BannerManager;
