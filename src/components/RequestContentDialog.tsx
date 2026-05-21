import React, { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Send, MessageSquarePlus } from "lucide-react";
import { createRequest } from "@/services/requestsService";
import { useAuth } from "@/contexts/AuthContext";

const schema = z.object({
  title: z.string().trim().min(2, "Mínimo 2 caracteres").max(120, "Máximo 120 caracteres"),
  category: z.string().trim().min(1, "Selecione uma categoria").max(40),
  type: z.enum(["movie", "series", "any"]),
  notes: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
});

const CATEGORIES = [
  "Ação", "Aventura", "Comédia", "Drama", "Romance", "Terror",
  "Ficção Científica", "Documentário", "Animação", "Infantil",
  "Suspense", "Fantasia", "Musical", "Outros",
];

const RequestContentDialog: React.FC<{ trigger?: React.ReactNode }> = ({ trigger }) => {
  const { clientName } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"movie" | "series" | "any">("any");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setTitle(""); setCategory(""); setType("any"); setNotes("");
  };

  const onSubmit = async () => {
    const parsed = schema.safeParse({ title, category, type, notes });
    if (!parsed.success) {
      toast({
        title: "Dados inválidos",
        description: parsed.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }
    // Get user pin from auth state to track who requested it
    let requesterPin: string | undefined;
    try {
      const stored = localStorage.getItem("authState");
      if (stored) {
        const parsedAuth = JSON.parse(stored);
        requesterPin = parsedAuth.pinCode;
      }
    } catch { /* ignore */ }

    setSubmitting(true);
    try {
      await createRequest({
        title: parsed.data.title,
        category: parsed.data.category,
        type: parsed.data.type,
        notes: parsed.data.notes,
        requesterName: clientName || "Anônimo",
        requesterPin,
      });
      toast({
        title: "Solicitação enviada!",
        description: "Obrigado! Em breve avaliaremos seu pedido.",
      });
      reset();
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Erro ao enviar", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquarePlus className="w-4 h-4" />
            Solicitar Filme/Série
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Filme ou Série</DialogTitle>
          <DialogDescription>
            Não encontrou o que procurava? Envie sua sugestão para nossa equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="req-title">Nome do conteúdo *</Label>
            <Input
              id="req-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Ex: Interestelar"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  <SelectItem value="movie">Filme</SelectItem>
                  <SelectItem value="series">Série</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Escolha" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="req-notes">Observações (opcional)</Label>
            <Textarea
              id="req-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Ano, ator, link IMDB, etc."
            />
            <p className="text-xs text-muted-foreground mt-1">{notes.length}/500</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={submitting} className="gap-2">
            <Send className="w-4 h-4" />
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestContentDialog;
