import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AVATAR_OPTIONS, getAvatarId } from "@/lib/avatars";
import { cn } from "@/lib/utils";
import { Loader2, Check } from "lucide-react";

interface AvatarPickerDialogProps {
  open: boolean;
  /** Currently selected value (stable id or legacy URL). */
  initialAvatar?: string;
  title?: string;
  description?: string;
  dismissible?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Receives the stable avatar id (e.g. "avatar-3"). */
  onSelect: (avatarId: string) => Promise<void> | void;
}

const AvatarPickerDialog: React.FC<AvatarPickerDialogProps> = ({
  open,
  initialAvatar,
  title = "Escolha seu avatar",
  description = "Selecione uma imagem que representa você. Você poderá trocá-la depois nas configurações.",
  dismissible = true,
  onOpenChange,
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState<string>(getAvatarId(initialAvatar));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setSelectedId(getAvatarId(initialAvatar));
  }, [open, initialAvatar]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await onSelect(selectedId);
      onOpenChange?.(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!dismissible && !o) return;
        onOpenChange?.(o);
      }}
    >
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => !dismissible && e.preventDefault()}
        onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[55vh] overflow-y-auto py-2">
          {AVATAR_OPTIONS.map(({ id, src }) => {
            const active = id === selectedId;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedId(id)}
                className={cn(
                  "relative aspect-square rounded-full overflow-hidden border-2 transition-all bg-muted",
                  active
                    ? "border-primary ring-2 ring-primary/50 scale-105"
                    : "border-border hover:border-primary/60"
                )}
                aria-label="Selecionar avatar"
              >
                <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
                {active && (
                  <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button onClick={handleConfirm} disabled={!selectedId || saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarPickerDialog;
