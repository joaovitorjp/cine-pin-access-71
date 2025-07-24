import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LiveTV } from "@/types";
import { addLiveTVChannel, updateLiveTVChannel } from "@/services/liveTvService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface AddEditLiveTVFormProps {
  channel?: LiveTV;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  imageUrl: string;
  playerUrl: string;
  description: string;
  category: string;
}

const AddEditLiveTVForm: React.FC<AddEditLiveTVFormProps> = ({ channel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: channel?.name || "",
      imageUrl: channel?.imageUrl || "",
      playerUrl: channel?.playerUrl || "",
      description: channel?.description || "",
      category: channel?.category || "",
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const channelData = {
        name: data.name,
        imageUrl: data.imageUrl,
        playerUrl: data.playerUrl,
        description: data.description,
        category: data.category,
      };

      if (channel) {
        await updateLiveTVChannel(channel.id, channelData);
        toast({
          title: "Canal atualizado",
          description: "O canal foi atualizado com sucesso",
        });
      } else {
        await addLiveTVChannel(channelData);
        toast({
          title: "Canal adicionado",
          description: "O canal foi adicionado com sucesso",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar canal:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o canal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Nome do Canal</Label>
        <Input
          id="name"
          {...register("name", { required: "Nome é obrigatório" })}
          placeholder="Digite o nome do canal"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="imageUrl">URL da Imagem</Label>
        <Input
          id="imageUrl"
          {...register("imageUrl", { required: "URL da imagem é obrigatória" })}
          placeholder="https://exemplo.com/imagem.jpg"
        />
        {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="playerUrl">URL do Player</Label>
        <Input
          id="playerUrl"
          {...register("playerUrl", { required: "URL do player é obrigatória" })}
          placeholder="https://exemplo.com/player"
        />
        {errors.playerUrl && <p className="text-red-500 text-sm mt-1">{errors.playerUrl.message}</p>}
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Input
          id="category"
          {...register("category")}
          placeholder="Ex: Esportes, Notícias, Entretenimento"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descrição do canal (opcional)"
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-netflix-red hover:bg-red-700"
        disabled={loading}
      >
        {loading ? "Salvando..." : channel ? "Atualizar Canal" : "Adicionar Canal"}
      </Button>
    </form>
  );
};

export default AddEditLiveTVForm;