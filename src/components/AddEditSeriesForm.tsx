
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Series, Season, Episode } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Minus, FileVideo, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { addSeries, updateSeries } from '@/services/seriesService';

interface AddEditSeriesFormProps {
  series?: Series;
  onSuccess: () => void;
}

const AddEditSeriesForm = ({ series, onSuccess }: AddEditSeriesFormProps) => {
  const [seasons, setSeasons] = useState<Season[]>(series?.seasons || [{ id: '1', number: 1, episodes: [] }]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: series?.title || '',
      description: series?.description || '',
      imageUrl: series?.imageUrl || '',
      year: series?.year || '',
      genre: series?.genre || '',
      rating: series?.rating || '',
    }
  });

  const handleAddSeason = () => {
    setSeasons([...seasons, {
      id: String(seasons.length + 1),
      number: seasons.length + 1,
      episodes: []
    }]);
  };

  const handleRemoveSeason = (seasonIndex: number) => {
    setSeasons(seasons.filter((_, index) => index !== seasonIndex));
  };

  const handleAddEpisode = (seasonIndex: number) => {
    const updatedSeasons = [...seasons];
    const episodeNumber = updatedSeasons[seasonIndex].episodes.length + 1;
    updatedSeasons[seasonIndex].episodes.push({
      id: `s${seasonIndex + 1}e${episodeNumber}`,
      number: episodeNumber,
      title: '',
      videoUrl: '',
      description: '',
      thumbnail: ''
    });
    setSeasons(updatedSeasons);
  };

  const handleRemoveEpisode = (seasonIndex: number, episodeIndex: number) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[seasonIndex].episodes.splice(episodeIndex, 1);
    setSeasons(updatedSeasons);
  };

  const handleEpisodeChange = (seasonIndex: number, episodeIndex: number, field: keyof Episode, value: string) => {
    const updatedSeasons = [...seasons];
    updatedSeasons[seasonIndex].episodes[episodeIndex] = {
      ...updatedSeasons[seasonIndex].episodes[episodeIndex],
      [field]: value
    };
    setSeasons(updatedSeasons);
  };

  const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      const seriesData = {
        ...formData,
        seasons: seasons.map(season => ({
          ...season,
          episodes: season.episodes.map(episode => ({
            ...episode,
            number: Number(episode.number)
          }))
        }))
      };

      if (series) {
        await updateSeries(series.id, seriesData);
        toast({ title: "Série atualizada com sucesso!" });
      } else {
        await addSeries(seriesData);
        toast({ title: "Série adicionada com sucesso!" });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar série:', error);
      toast({ 
        title: "Erro ao salvar série",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            {...register('title', { required: 'Título é obrigatório' })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register('description', { required: 'Descrição é obrigatória' })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="imageUrl">URL da Imagem</Label>
          <Input
            id="imageUrl"
            {...register('imageUrl', { required: 'URL da imagem é obrigatória' })}
          />
          {errors.imageUrl && (
            <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="year">Ano</Label>
            <Input id="year" {...register('year')} />
          </div>
          <div>
            <Label htmlFor="genre">Gênero</Label>
            <Input id="genre" {...register('genre')} />
          </div>
          <div>
            <Label htmlFor="rating">Classificação</Label>
            <Input id="rating" {...register('rating')} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Temporadas</h3>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSeason}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Temporada
            </Button>
          </div>

          {seasons.map((season, seasonIndex) => (
            <Collapsible key={season.id}>
              <div className="flex items-center justify-between p-4 bg-muted rounded-t-md">
                <h4 className="text-sm font-medium">Temporada {season.number}</h4>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddEpisode(seasonIndex)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSeason(seasonIndex)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <CollapsibleTrigger className="hover:bg-accent p-2 rounded-md">
                    <ChevronDown className="w-4 h-4" />
                  </CollapsibleTrigger>
                </div>
              </div>

              <CollapsibleContent>
                <div className="p-4 space-y-4 bg-muted/50 rounded-b-md">
                  {season.episodes.map((episode, episodeIndex) => (
                    <div key={episode.id} className="space-y-2 p-4 bg-background rounded-md">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-medium">Episódio {episode.number}</h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEpisode(seasonIndex, episodeIndex)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid gap-2">
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={episode.title}
                            onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)}
                            placeholder="Título do episódio"
                          />
                        </div>
                        <div>
                          <Label>URL do Vídeo</Label>
                          <Input
                            value={episode.videoUrl}
                            onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'videoUrl', e.target.value)}
                            placeholder="URL do vídeo"
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Input
                            value={episode.description || ''}
                            onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'description', e.target.value)}
                            placeholder="Descrição do episódio"
                          />
                        </div>
                        <div>
                          <Label>Thumbnail</Label>
                          <Input
                            value={episode.thumbnail || ''}
                            onChange={(e) => handleEpisodeChange(seasonIndex, episodeIndex, 'thumbnail', e.target.value)}
                            placeholder="URL da thumbnail"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {season.episodes.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum episódio adicionado. Clique no botão + para adicionar.
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-netflix-red hover:bg-red-700"
        >
          {loading ? 'Salvando...' : series ? 'Atualizar Série' : 'Adicionar Série'}
        </Button>
      </div>
    </form>
  );
};

export default AddEditSeriesForm;
