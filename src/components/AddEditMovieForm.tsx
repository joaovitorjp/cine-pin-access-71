
import React, { useState } from "react";
import { Movie } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { addMovie, updateMovie } from "@/services/movieService";
import { toast } from "@/components/ui/use-toast";

interface AddEditMovieFormProps {
  movie?: Movie;
  onSuccess: () => void;
}

const AddEditMovieForm: React.FC<AddEditMovieFormProps> = ({ movie, onSuccess }) => {
  const [title, setTitle] = useState(movie?.title || "");
  const [imageUrl, setImageUrl] = useState(movie?.imageUrl || "");
  const [videoUrl, setVideoUrl] = useState(movie?.videoUrl || "");
  const [description, setDescription] = useState(movie?.description || "");
  const [year, setYear] = useState(movie?.year || "");
  const [genre, setGenre] = useState(movie?.genre || "");
  const [rating, setRating] = useState(movie?.rating || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !imageUrl || !videoUrl || !description) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const movieData = {
        title,
        imageUrl,
        videoUrl,
        description,
        year,
        genre,
        rating,
      };
      
      if (movie) {
        // Update existing movie
        await updateMovie(movie.id, movieData);
        toast({
          title: "Filme atualizado",
          description: "O filme foi atualizado com sucesso.",
        });
      } else {
        // Add new movie
        await addMovie(movieData);
        toast({
          title: "Filme adicionado",
          description: "O filme foi adicionado com sucesso.",
        });
        
        // Reset form
        setTitle("");
        setImageUrl("");
        setVideoUrl("");
        setDescription("");
        setYear("");
        setGenre("");
        setRating("");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar filme:", error);
      setError("Ocorreu um erro ao salvar o filme. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do filme"
          className="bg-gray-700 border-gray-600"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL da Imagem *</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          className="bg-gray-700 border-gray-600"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="videoUrl">URL do Vídeo *</Label>
        <Input
          id="videoUrl"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://drive.google.com/file/d/..."
          className="bg-gray-700 border-gray-600"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição do filme"
          className="bg-gray-700 border-gray-600 min-h-24"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Ano</Label>
          <Input
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            className="bg-gray-700 border-gray-600"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="genre">Gênero</Label>
          <Input
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Ação, Aventura"
            className="bg-gray-700 border-gray-600"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rating">Avaliação</Label>
          <Input
            id="rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="8.5"
            className="bg-gray-700 border-gray-600"
          />
        </div>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-netflix-red hover:bg-red-700"
          disabled={loading}
        >
          {loading ? "Salvando..." : movie ? "Atualizar Filme" : "Adicionar Filme"}
        </Button>
      </div>
    </form>
  );
};

export default AddEditMovieForm;
