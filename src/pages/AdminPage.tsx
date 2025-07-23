import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Movie, Series, Anime, PinAccess } from "@/types";
import { getAllMovies, deleteMovie } from "@/services/movieService";
import { getAllSeries, deleteSeries } from "@/services/seriesService";
import { getAllAnimes, deleteAnime } from "@/services/animeService";
import { getAllPins, deactivatePin, deletePin } from "@/services/pinService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash, Edit, Plus, Film, Key, Tv, Sparkles } from "lucide-react";
import AddEditMovieForm from "@/components/AddEditMovieForm";
import CreatePinForm from "@/components/CreatePinForm";
import { formatDate, isPinValid } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import AddEditSeriesForm from "@/components/AddEditSeriesForm";
import AddEditAnimeForm from "@/components/AddEditAnimeForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminStats from "@/components/AdminStats";
import AdminSearchBar from "@/components/AdminSearchBar";
import { ChevronLeft } from "lucide-react";

const AdminPage: React.FC = () => {
  const { isAdmin, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [pins, setPins] = useState<PinAccess[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showAddEditSeriesModal, setShowAddEditSeriesModal] = useState(false);
  const [showAddEditAnimeModal, setShowAddEditAnimeModal] = useState(false);
  const [showCreatePinModal, setShowCreatePinModal] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingAnimes, setLoadingAnimes] = useState(true);
  const [loadingPins, setLoadingPins] = useState(true);
  const [movieSearchTerm, setMovieSearchTerm] = useState("");
  const [seriesSearchTerm, setSeriesSearchTerm] = useState("");
  const [animeSearchTerm, setAnimeSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [moviesData, seriesData, animesData, pinsData] = await Promise.all([
          getAllMovies(),
          getAllSeries(),
          getAllAnimes(),
          getAllPins()
        ]);
        
        setMovies(moviesData);
        setSeries(seriesData);
        setAnimes(animesData);
        setPins(pinsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados",
          variant: "destructive",
        });
      } finally {
        setLoadingMovies(false);
        setLoadingSeries(false);
        setLoadingAnimes(false);
        setLoadingPins(false);
      }
    };

    fetchData();
  }, [isAdmin, isLoggedIn, navigate]);

  const handleRefreshData = async () => {
    setLoadingMovies(true);
    setLoadingSeries(true);
    setLoadingAnimes(true);
    setLoadingPins(true);
    try {
      const [moviesData, seriesData, animesData, pinsData] = await Promise.all([
        getAllMovies(),
        getAllSeries(),
        getAllAnimes(),
        getAllPins()
      ]);
      
      setMovies(moviesData);
      setSeries(seriesData);
      setAnimes(animesData);
      setPins(pinsData);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setLoadingMovies(false);
      setLoadingSeries(false);
      setLoadingAnimes(false);
      setLoadingPins(false);
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowAddEditModal(true);
  };

  const handleDeleteMovie = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este filme?")) {
      try {
        await deleteMovie(id);
        setMovies(movies.filter(movie => movie.id !== id));
        toast({
          title: "Filme excluído",
          description: "O filme foi excluído com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir filme:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o filme",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeactivatePin = async (id: string) => {
    if (window.confirm("Tem certeza que deseja desativar este PIN?")) {
      try {
        await deactivatePin(id);
        setPins(pins.map(pin => 
          pin.id === id ? { ...pin, isActive: false } : pin
        ));
        toast({
          title: "PIN desativado",
          description: "O PIN foi desativado com sucesso",
        });
      } catch (error) {
        console.error("Erro ao desativar PIN:", error);
        toast({
          title: "Erro",
          description: "Não foi possível desativar o PIN",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeletePin = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este PIN permanentemente?")) {
      try {
        await deletePin(id);
        setPins(pins.filter(pin => pin.id !== id));
        toast({
          title: "PIN excluído",
          description: "O PIN foi excluído permanentemente",
        });
      } catch (error) {
        console.error("Erro ao excluir PIN:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o PIN",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteSeries = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta série?")) {
      try {
        await deleteSeries(id);
        setSeries(series.filter(s => s.id !== id));
        toast({
          title: "Série excluída",
          description: "A série foi excluída com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir série:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a série",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteAnime = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este anime?")) {
      try {
        await deleteAnime(id);
        setAnimes(animes.filter(a => a.id !== id));
        toast({
          title: "Anime excluído",
          description: "O anime foi excluído com sucesso",
        });
      } catch (error) {
        console.error("Erro ao excluir anime:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o anime",
          variant: "destructive",
        });
      }
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  // Filtros de pesquisa
  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(movieSearchTerm.toLowerCase()) ||
    movie.description.toLowerCase().includes(movieSearchTerm.toLowerCase())
  );

  const filteredSeries = series.filter(s =>
    s.title.toLowerCase().includes(seriesSearchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(seriesSearchTerm.toLowerCase())
  );

  const filteredAnimes = animes.filter(anime =>
    anime.title.toLowerCase().includes(animeSearchTerm.toLowerCase()) ||
    anime.description.toLowerCase().includes(animeSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 px-4 max-w-7xl">
        {/* Back button and title */}
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleBack}
            className="text-netflix-gray hover:text-white flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">Painel Administrativo</h1>
        </div>

        {/* Stats */}
        <AdminStats 
          moviesCount={movies.length} 
          seriesCount={series.length} 
          animesCount={animes.length}
          pinsCount={pins.length} 
        />
        
        <Tabs defaultValue="movies" className="w-full">
          <div className="mb-6 space-y-3">
            {/* Grupo principal: Filmes, Séries e Animes */}
            <div className="flex flex-col">
              <TabsList className="grid w-full grid-cols-3 h-auto">
                <TabsTrigger 
                  value="movies" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                >
                  <Film className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Filmes</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="series" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                >
                  <Tv className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Séries</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="animes" 
                  className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2 text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Animes</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            {/* Grupo separado: PINs de Acesso */}
            <div className="flex justify-center">
              <TabsList className="w-full max-w-xs">
                <TabsTrigger 
                  value="pins" 
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 text-sm"
                >
                  <Key className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">PINs de Acesso</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        
        <TabsContent value="movies">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Gerenciar Filmes</h2>
            <Button 
              onClick={() => {
                setSelectedMovie(null);
                setShowAddEditModal(true);
              }}
              className="bg-netflix-red hover:bg-red-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Adicionar Filme</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>

          <AdminSearchBar
            value={movieSearchTerm}
            onChange={setMovieSearchTerm}
            placeholder="Pesquisar filmes por título ou descrição..."
          />
          
          {loadingMovies ? (
            <div className="animate-pulse text-netflix-gray">Carregando filmes...</div>
          ) : filteredMovies.length === 0 ? (
            <div className="text-netflix-gray bg-netflix-dark p-6 rounded-md text-center">
              {movieSearchTerm ? "Nenhum filme encontrado com essa pesquisa." : "Nenhum filme cadastrado. Clique em \"Adicionar Filme\" para começar."}
            </div>
          ) : (
            <div className="bg-netflix-dark rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">Filme</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Descrição</th>
                      <th className="px-2 sm:px-4 py-3 text-center w-20 sm:w-32 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                   {filteredMovies.map((movie) => (
                     <tr key={movie.id} className="border-t border-gray-700">
                       <td className="px-2 sm:px-4 py-3">
                         <div className="flex items-center space-x-2 sm:space-x-3">
                           <img 
                             src={movie.imageUrl} 
                             alt={movie.title}
                             className="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded flex-shrink-0"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";
                             }}
                           />
                           <div className="min-w-0 flex-1">
                             <div className="font-medium text-sm sm:text-base truncate">{movie.title}</div>
                             {movie.year && <div className="text-xs sm:text-sm text-netflix-gray">{movie.year}</div>}
                             <div className="md:hidden text-xs text-netflix-gray mt-1 line-clamp-2">
                               {movie.description}
                             </div>
                           </div>
                         </div>
                       </td>
                       <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                         <div className="line-clamp-2 text-sm text-netflix-gray max-w-xs">
                           {movie.description}
                         </div>
                       </td>
                       <td className="px-2 sm:px-4 py-3">
                         <div className="flex justify-center space-x-1 sm:space-x-2">
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleEditMovie(movie)}
                             className="text-netflix-gray hover:text-white h-8 w-8 sm:h-9 sm:w-9"
                           >
                             <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleDeleteMovie(movie.id)}
                             className="text-netflix-gray hover:text-red-500 h-8 w-8 sm:h-9 sm:w-9"
                           >
                             <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                           </Button>
                         </div>
                       </td>
                     </tr>
                  ))}
                 </tbody>
               </table>
             </div>
           </div>
          )}
        </TabsContent>
        
        <TabsContent value="series">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Gerenciar Séries</h2>
            <Button 
              onClick={() => {
                setSelectedSeries(null);
                setShowAddEditSeriesModal(true);
              }}
              className="bg-netflix-red hover:bg-red-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Adicionar Série</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>

          <AdminSearchBar
            value={seriesSearchTerm}
            onChange={setSeriesSearchTerm}
            placeholder="Pesquisar séries por título ou descrição..."
          />
          
          {loadingSeries ? (
            <div className="animate-pulse text-netflix-gray">Carregando séries...</div>
          ) : filteredSeries.length === 0 ? (
            <div className="text-netflix-gray bg-netflix-dark p-6 rounded-md text-center">
              {seriesSearchTerm ? "Nenhuma série encontrada com essa pesquisa." : "Nenhuma série cadastrada. Clique em \"Adicionar Série\" para começar."}
            </div>
          ) : (
            <div className="bg-netflix-dark rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">Série</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">Temporadas</th>
                      <th className="px-2 sm:px-4 py-3 text-center w-20 sm:w-32 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                   {filteredSeries.map((series) => (
                     <tr key={series.id} className="border-t border-gray-700">
                       <td className="px-2 sm:px-4 py-3">
                         <div className="flex items-center space-x-2 sm:space-x-3">
                           <img 
                             src={series.imageUrl} 
                             alt={series.title}
                             className="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded flex-shrink-0"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = "https://via.placeholder.com/160x90";
                             }}
                           />
                           <div className="min-w-0 flex-1">
                             <div className="font-medium text-sm sm:text-base truncate">{series.title}</div>
                             {series.year && <div className="text-xs sm:text-sm text-netflix-gray">{series.year}</div>}
                           </div>
                         </div>
                       </td>
                       <td className="px-2 sm:px-4 py-3">
                         <div className="text-xs sm:text-sm">
                           {series.seasons?.length || 0} temporada(s)
                         </div>
                       </td>
                       <td className="px-2 sm:px-4 py-3">
                         <div className="flex justify-center space-x-1 sm:space-x-2">
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => {
                               setSelectedSeries(series);
                               setShowAddEditSeriesModal(true);
                             }}
                             className="text-netflix-gray hover:text-white h-8 w-8 sm:h-9 sm:w-9"
                           >
                             <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleDeleteSeries(series.id)}
                             className="text-netflix-gray hover:text-red-500 h-8 w-8 sm:h-9 sm:w-9"
                           >
                             <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                           </Button>
                         </div>
                       </td>
                     </tr>
                  ))}
                 </tbody>
               </table>
             </div>
           </div>
          )}
        </TabsContent>
        
        <TabsContent value="animes">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Gerenciar Animes</h2>
            <Button 
              onClick={() => {
                setSelectedAnime(null);
                setShowAddEditAnimeModal(true);
              }}
              className="bg-netflix-red hover:bg-red-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Adicionar Anime</span>
              <span className="sm:hidden">Adicionar</span>
            </Button>
          </div>

          <AdminSearchBar
            value={animeSearchTerm}
            onChange={setAnimeSearchTerm}
            placeholder="Pesquisar animes por título ou descrição..."
          />
          
          {loadingAnimes ? (
            <div className="animate-pulse text-netflix-gray">Carregando animes...</div>
          ) : filteredAnimes.length === 0 ? (
            <div className="text-netflix-gray bg-netflix-dark p-6 rounded-md text-center">
              {animeSearchTerm ? "Nenhum anime encontrado com essa pesquisa." : "Nenhum anime cadastrado. Clique em \"Adicionar Anime\" para começar."}
            </div>
          ) : (
            <div className="bg-netflix-dark rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">Anime</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">Temporadas</th>
                      <th className="px-2 sm:px-4 py-3 text-center w-20 sm:w-32 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                   {filteredAnimes.map((anime) => (
                     <tr key={anime.id} className="border-t border-gray-700">
                       <td className="px-2 sm:px-4 py-3">
                         <div className="flex items-center space-x-2 sm:space-x-3">
                           <img 
                             src={anime.imageUrl} 
                             alt={anime.title}
                             className="w-10 h-12 sm:w-12 sm:h-16 object-cover rounded flex-shrink-0"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.src = "https://via.placeholder.com/160x90";
                             }}
                           />
                           <div className="min-w-0 flex-1">
                             <div className="font-medium text-sm sm:text-base truncate">{anime.title}</div>
                             {anime.year && <div className="text-xs sm:text-sm text-netflix-gray">{anime.year}</div>}
                           </div>
                         </div>
                       </td>
                       <td className="px-2 sm:px-4 py-3">
                         <div className="text-xs sm:text-sm">
                           {anime.seasons?.length || 0} temporada(s)
                         </div>
                       </td>
                       <td className="px-2 sm:px-4 py-3">
                         <div className="flex justify-center space-x-1 sm:space-x-2">
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => {
                               setSelectedAnime(anime);
                               setShowAddEditAnimeModal(true);
                             }}
                             className="text-netflix-gray hover:text-white h-8 w-8 sm:h-9 sm:w-9"
                           >
                             <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => handleDeleteAnime(anime.id)}
                             className="text-netflix-gray hover:text-red-500 h-8 w-8 sm:h-9 sm:w-9"
                           >
                             <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                           </Button>
                         </div>
                       </td>
                     </tr>
                  ))}
                 </tbody>
               </table>
             </div>
           </div>
          )}
        </TabsContent>
        
        <TabsContent value="pins">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold">Gerenciar PINs de Acesso</h2>
            <Button 
              onClick={() => setShowCreatePinModal(true)}
              className="bg-netflix-red hover:bg-red-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Criar Novo PIN</span>
              <span className="sm:hidden">Criar PIN</span>
            </Button>
          </div>
          
          {loadingPins ? (
            <div className="animate-pulse text-netflix-gray">Carregando PINs...</div>
          ) : pins.length === 0 ? (
            <div className="text-netflix-gray bg-netflix-dark p-6 rounded-md text-center">
              Nenhum PIN cadastrado. Clique em "Criar Novo PIN" para começar.
            </div>
          ) : (
            <div className="bg-netflix-dark rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">PIN</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">Cliente</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Validade</th>
                      <th className="px-2 sm:px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-2 sm:px-4 py-3 text-center w-20 sm:w-32 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                <tbody>
                  {pins.map((pin) => {
                    const isValid = isPinValid(pin);
                    
                    return (
                      <tr key={pin.id} className="border-t border-gray-700">
                        <td className="px-2 sm:px-4 py-3">
                          <div className="font-mono text-xs sm:text-sm truncate">{pin.pin}</div>
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          <div className="text-xs sm:text-sm font-medium truncate">{pin.clientName}</div>
                          <div className="md:hidden text-xs text-netflix-gray mt-1">
                            {formatDate(pin.expiryDate)} • {pin.daysValid} dias
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3 hidden md:table-cell">
                          <div>
                            <div className="text-sm">{formatDate(pin.expiryDate)}</div>
                            <div className="text-xs text-netflix-gray">
                              {pin.daysValid} dias de acesso
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          {pin.isActive ? (
                            isValid ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                                Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300">
                                Expirado
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="px-2 sm:px-4 py-3">
                          <div className="flex justify-center space-x-1">
                            {pin.isActive && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeactivatePin(pin.id)}
                                className="text-netflix-gray hover:text-yellow-500 text-xs px-2 py-1 h-auto hidden sm:flex"
                              >
                                Desativar
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePin(pin.id)}
                              className="text-netflix-gray hover:text-red-500 h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </TabsContent>
        </Tabs>
        
        {/* Wrap dialog content in ScrollArea for better scrolling */}
        <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
          <DialogContent className="w-[95vw] max-w-[650px] max-h-[90vh] bg-netflix-dark text-white">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {selectedMovie ? "Editar Filme" : "Adicionar Filme"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              <AddEditMovieForm
                movie={selectedMovie || undefined}
                onSuccess={() => {
                  setShowAddEditModal(false);
                  handleRefreshData();
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showAddEditSeriesModal} onOpenChange={setShowAddEditSeriesModal}>
          <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] bg-netflix-dark text-white">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {selectedSeries ? "Editar Série" : "Adicionar Série"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              <AddEditSeriesForm
                series={selectedSeries || undefined}
                onSuccess={() => {
                  setShowAddEditSeriesModal(false);
                  handleRefreshData();
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showAddEditAnimeModal} onOpenChange={setShowAddEditAnimeModal}>
          <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] bg-netflix-dark text-white">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {selectedAnime ? "Editar Anime" : "Adicionar Anime"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              <AddEditAnimeForm
                anime={selectedAnime || undefined}
                onSuccess={() => {
                  setShowAddEditAnimeModal(false);
                  handleRefreshData();
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showCreatePinModal} onOpenChange={setShowCreatePinModal}>
          <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] bg-netflix-dark text-white">
            <DialogHeader>
              <DialogTitle className="text-lg">Criar Novo PIN de Acesso</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              <CreatePinForm
                onSuccess={() => {
                  setShowCreatePinModal(false);
                  handleRefreshData();
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminPage;
