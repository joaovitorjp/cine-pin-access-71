import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Movie, Series, LiveTV } from "@/types";
import { getAllMovies, deleteMovie, deleteAllMovies } from "@/services/movieService";
import { getAllSeries, deleteSeries, deleteAllSeries } from "@/services/seriesService";
import { getAllLiveTVChannels, deleteLiveTVChannel, deleteAllLiveTVChannels } from "@/services/liveTvService";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Trash,
  Edit,
  Plus,
  Film,
  Tv,
  Sparkles,
  Image as ImageIcon,
  Star,
  Layout as LayoutIcon,
  LogOut,
  Inbox,
  Radio,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import RequestsManager from "@/components/admin/RequestsManager";
import CollectionsManager from "@/components/admin/CollectionsManager";
import AdminNotificationsBell from "@/components/admin/AdminNotificationsBell";
import AddEditMovieForm from "@/components/AddEditMovieForm";
import BulkUploadMoviesForm from "@/components/BulkUploadMoviesForm";
import { toast } from "@/components/ui/use-toast";
import AddEditSeriesForm from "@/components/AddEditSeriesForm";
import AddEditLiveTVForm from "@/components/AddEditLiveTVForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminStats from "@/components/AdminStats";
import BackgroundImageManager from "@/components/BackgroundImageManager";
import FeaturedLoginManager from "@/components/FeaturedLoginManager";
import BannerManager from "@/components/BannerManager";
import AdminSearchBar from "@/components/AdminSearchBar";
import cineflexLogo from "@/assets/cineflex-logo.png";

type TabKey =
  | "movies"
  | "series"
  | "livetv"
  | "background"
  | "featured-login"
  | "banners"
  | "requests"
  | "collections";

const NAV: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; group: "content" | "site" }[] = [
  { key: "movies", label: "Filmes", icon: Film, group: "content" },
  { key: "series", label: "Séries", icon: Tv, group: "content" },
  { key: "livetv", label: "TV Ao Vivo", icon: Radio, group: "content" },
  { key: "banners", label: "Banners", icon: LayoutIcon, group: "site" },
  { key: "background", label: "Fundo", icon: ImageIcon, group: "site" },
  { key: "featured-login", label: "Destaques Login", icon: Star, group: "site" },
  { key: "collections", label: "Coleções", icon: Sparkles, group: "site" },
  { key: "requests", label: "Solicitações", icon: Inbox, group: "site" },
];

const AdminPage: React.FC = () => {
  const { isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [liveTVChannels, setLiveTVChannels] = useState<LiveTV[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedLiveTVChannel, setSelectedLiveTVChannel] = useState<LiveTV | null>(null);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showAddEditSeriesModal, setShowAddEditSeriesModal] = useState(false);
  const [showAddEditLiveTVModal, setShowAddEditLiveTVModal] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingLiveTV, setLoadingLiveTV] = useState(true);
  const [movieSearchTerm, setMovieSearchTerm] = useState("");
  const [seriesSearchTerm, setSeriesSearchTerm] = useState("");
  const [liveTVSearchTerm, setLiveTVSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("movies");

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const [moviesData, seriesData, liveTVData] = await Promise.all([
          getAllMovies(),
          getAllSeries(),
          getAllLiveTVChannels(),
        ]);
        setMovies(moviesData);
        setSeries(seriesData);
        setLiveTVChannels(liveTVData);
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
        setLoadingLiveTV(false);
      }
    };

    fetchData();
  }, [isAdmin, isLoggedIn, navigate]);

  const handleRefreshData = async () => {
    setLoadingMovies(true);
    setLoadingSeries(true);
    setLoadingLiveTV(true);
    try {
      const [moviesData, seriesData, liveTVData] = await Promise.all([
        getAllMovies(),
        getAllSeries(),
        getAllLiveTVChannels(),
      ]);
      setMovies(moviesData);
      setSeries(seriesData);
      setLiveTVChannels(liveTVData);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setLoadingMovies(false);
      setLoadingSeries(false);
      setLoadingLiveTV(false);
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
        setMovies(movies.filter((movie) => movie.id !== id));
        toast({ title: "Filme excluído", description: "O filme foi excluído com sucesso" });
      } catch (error) {
        console.error("Erro ao excluir filme:", error);
        toast({ title: "Erro", description: "Não foi possível excluir o filme", variant: "destructive" });
      }
    }
  };

  const handleDeleteSeries = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta série?")) {
      try {
        await deleteSeries(id);
        setSeries(series.filter((s) => s.id !== id));
        toast({ title: "Série excluída", description: "A série foi excluída com sucesso" });
      } catch (error) {
        console.error("Erro ao excluir série:", error);
        toast({ title: "Erro", description: "Não foi possível excluir a série", variant: "destructive" });
      }
    }
  };

  const handleDeleteLiveTVChannel = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este canal?")) {
      try {
        await deleteLiveTVChannel(id);
        setLiveTVChannels(liveTVChannels.filter((c) => c.id !== id));
        toast({ title: "Canal excluído", description: "O canal foi excluído com sucesso" });
      } catch (error) {
        console.error("Erro ao excluir canal:", error);
        toast({ title: "Erro", description: "Não foi possível excluir o canal", variant: "destructive" });
      }
    }
  };

  const handleExportMovies = () => {
    try {
      const rows = movies.map((m) => [
        m.title ?? "",
        m.imageUrl ?? "",
        m.videoUrl ?? "",
        m.description ?? "",
        m.year ?? "",
        m.genre ?? "",
        m.rating ?? "",
      ]);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Filmes");
      const ts = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `cineflex-filmes-${ts}.xlsx`);
      toast({ title: "Exportação concluída", description: `${rows.length} filme(s) exportado(s).` });
    } catch (e) {
      console.error("Erro ao exportar filmes:", e);
      toast({ title: "Erro", description: "Não foi possível exportar os filmes.", variant: "destructive" });
    }
  };

  const confirmDeleteAll = (label: string, count: number) => {
    if (count === 0) {
      toast({ title: "Nada para excluir", description: `Não há ${label} cadastrados.` });
      return false;
    }
    const first = window.confirm(
      `ATENÇÃO: isso irá excluir TODOS os ${count} ${label} do banco de dados. Esta ação não pode ser desfeita. Deseja continuar?`
    );
    if (!first) return false;
    const typed = window.prompt(`Digite EXCLUIR para confirmar a exclusão de todos os ${label}:`);
    return typed?.trim().toUpperCase() === "EXCLUIR";
  };

  const handleDeleteAllMovies = async () => {
    if (!confirmDeleteAll("filmes", movies.length)) return;
    try {
      await deleteAllMovies();
      setMovies([]);
      toast({ title: "Filmes excluídos", description: "Todos os filmes foram removidos." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao excluir filmes.", variant: "destructive" });
    }
  };

  const handleDeleteAllSeries = async () => {
    if (!confirmDeleteAll("séries", series.length)) return;
    try {
      await deleteAllSeries();
      setSeries([]);
      toast({ title: "Séries excluídas", description: "Todas as séries foram removidas." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao excluir séries.", variant: "destructive" });
    }
  };

  const handleDeleteAllLiveTV = async () => {
    if (!confirmDeleteAll("canais", liveTVChannels.length)) return;
    try {
      await deleteAllLiveTVChannels();
      setLiveTVChannels([]);
      toast({ title: "Canais excluídos", description: "Todos os canais foram removidos." });
    } catch (e) {
      console.error(e);
      toast({ title: "Erro", description: "Falha ao excluir canais.", variant: "destructive" });
    }
  };

  // Filtros de pesquisa
  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(movieSearchTerm.toLowerCase()) ||
      movie.description.toLowerCase().includes(movieSearchTerm.toLowerCase())
  );

  const filteredSeries = series.filter(
    (s) =>
      s.title.toLowerCase().includes(seriesSearchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(seriesSearchTerm.toLowerCase())
  );

  const filteredLiveTVChannels = liveTVChannels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(liveTVSearchTerm.toLowerCase()) ||
      (channel.description && channel.description.toLowerCase().includes(liveTVSearchTerm.toLowerCase()))
  );

  const currentLabel = NAV.find((n) => n.key === activeTab)?.label ?? "";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-netflix-red/20 blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full bg-red-800/15 blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
          }}
        />
      </div>

      {/* Sticky topbar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/60 border-b border-white/10">
        <div className="container mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white/60 hover:text-white hover:bg-white/5 flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <img
              src={cineflexLogo}
              alt="CINE FLEX"
              className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[0_0_12px_rgba(229,9,20,0.5)] flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-extrabold tracking-tight leading-none truncate">
                CINE <span className="text-netflix-red">FLEX</span>
              </p>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white/40 mt-0.5">
                Painel administrativo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-300/90 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1 mr-1">
              <ShieldCheck className="w-3 h-3" />
              Online
            </div>
            <AdminNotificationsBell onOpenRequests={() => setActiveTab("requests")} />
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white/60 hover:text-red-400 hover:bg-red-500/10 gap-2 rounded-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Hero / breadcrumb */}
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-red-200/90 bg-netflix-red/10 border border-netflix-red/30 rounded-full px-2.5 py-1 mb-3">
              <Sparkles className="w-3 h-3" />
              {currentLabel || "Visão geral"}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              Centro de controle
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Gerencie filmes, séries, canais e a aparência do site.
            </p>
          </div>
        </div>

        {/* Stats */}
        <AdminStats
          moviesCount={movies.length}
          seriesCount={series.length}
          animesCount={liveTVChannels.length}
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)} className="w-full mt-6">
          {/* Modern segmented nav */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-2 px-1">Conteúdo</p>
              <TabsList className="w-full h-auto p-1 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-md grid grid-cols-3 gap-1">
                {NAV.filter((n) => n.group === "content").map((n) => (
                  <TabsTrigger
                    key={n.key}
                    value={n.key}
                    className="rounded-xl py-2.5 px-2 text-xs sm:text-sm font-medium text-white/60 hover:text-white data-[state=active]:bg-gradient-to-br data-[state=active]:from-netflix-red data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-netflix-red/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <n.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{n.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-2 px-1">Site</p>
              <TabsList className="w-full h-auto p-1 bg-white/[0.04] border border-white/10 rounded-2xl backdrop-blur-md grid grid-cols-2 sm:grid-cols-5 gap-1">
                {NAV.filter((n) => n.group === "site").map((n) => (
                  <TabsTrigger
                    key={n.key}
                    value={n.key}
                    className="rounded-xl py-2.5 px-2 text-xs sm:text-sm font-medium text-white/60 hover:text-white data-[state=active]:bg-gradient-to-br data-[state=active]:from-netflix-red data-[state=active]:to-red-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-netflix-red/30 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    <n.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{n.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Movies */}
          <TabsContent value="movies" className="focus-visible:outline-none">
            <SectionCard
              title="Gerenciar Filmes"
              count={filteredMovies.length}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleExportMovies}
                    variant="outline"
                    className="bg-white/[0.04] border-white/15 text-white hover:bg-white/10 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Exportar Excel</span>
                    <span className="sm:hidden">Exportar</span>
                  </Button>
                  <Button
                    onClick={handleDeleteAllMovies}
                    variant="outline"
                    className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl"
                  >
                    <Trash className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Excluir tudo</span>
                    <span className="sm:hidden">Limpar</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedMovie(null);
                      setShowAddEditModal(true);
                    }}
                    className="bg-gradient-to-r from-netflix-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold shadow-lg shadow-netflix-red/30 border-0 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Adicionar Filme</span>
                    <span className="sm:hidden">Adicionar</span>
                  </Button>
                </div>
              }
            >
              <AdminSearchBar
                value={movieSearchTerm}
                onChange={setMovieSearchTerm}
                placeholder="Pesquisar filmes por título ou descrição..."
              />

              {loadingMovies ? (
                <SkeletonList />
              ) : filteredMovies.length === 0 ? (
                <EmptyState
                  message={
                    movieSearchTerm
                      ? "Nenhum filme encontrado com essa pesquisa."
                      : 'Nenhum filme cadastrado. Clique em "Adicionar Filme" para começar.'
                  }
                />
              ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredMovies.map((movie) => (
                    <ItemRow
                      key={movie.id}
                      imageUrl={movie.imageUrl}
                      title={movie.title}
                      subtitle={movie.year ? String(movie.year) : undefined}
                      description={movie.description}
                      fallback="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
                      onEdit={() => handleEditMovie(movie)}
                      onDelete={() => handleDeleteMovie(movie.id)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* Series */}
          <TabsContent value="series" className="focus-visible:outline-none">
            <SectionCard
              title="Gerenciar Séries"
              count={filteredSeries.length}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleDeleteAllSeries}
                    variant="outline"
                    className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl"
                  >
                    <Trash className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Excluir tudo</span>
                    <span className="sm:hidden">Limpar</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSeries(null);
                      setShowAddEditSeriesModal(true);
                    }}
                    className="bg-gradient-to-r from-netflix-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold shadow-lg shadow-netflix-red/30 border-0 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Adicionar Série</span>
                    <span className="sm:hidden">Adicionar</span>
                  </Button>
                </div>
              }
            >
              <AdminSearchBar
                value={seriesSearchTerm}
                onChange={setSeriesSearchTerm}
                placeholder="Pesquisar séries por título ou descrição..."
              />

              {loadingSeries ? (
                <SkeletonList />
              ) : filteredSeries.length === 0 ? (
                <EmptyState
                  message={
                    seriesSearchTerm
                      ? "Nenhuma série encontrada com essa pesquisa."
                      : 'Nenhuma série cadastrada. Clique em "Adicionar Série" para começar.'
                  }
                />
              ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSeries.map((s) => (
                    <ItemRow
                      key={s.id}
                      imageUrl={s.imageUrl}
                      title={s.title}
                      subtitle={s.year ? String(s.year) : undefined}
                      description={`${s.seasons?.length || 0} temporada(s)`}
                      fallback="https://via.placeholder.com/160x90"
                      onEdit={() => {
                        setSelectedSeries(s);
                        setShowAddEditSeriesModal(true);
                      }}
                      onDelete={() => handleDeleteSeries(s.id)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* Live TV */}
          <TabsContent value="livetv" className="focus-visible:outline-none">
            <SectionCard
              title="Gerenciar TV Ao Vivo"
              count={filteredLiveTVChannels.length}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleDeleteAllLiveTV}
                    variant="outline"
                    className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl"
                  >
                    <Trash className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Excluir tudo</span>
                    <span className="sm:hidden">Limpar</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedLiveTVChannel(null);
                      setShowAddEditLiveTVModal(true);
                    }}
                    className="bg-gradient-to-r from-netflix-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold shadow-lg shadow-netflix-red/30 border-0 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    <span className="hidden sm:inline">Adicionar Canal</span>
                    <span className="sm:hidden">Adicionar</span>
                  </Button>
                </div>
              }
            >
              <AdminSearchBar
                value={liveTVSearchTerm}
                onChange={setLiveTVSearchTerm}
                placeholder="Pesquisar canais por nome ou descrição..."
              />

              {loadingLiveTV ? (
                <SkeletonList />
              ) : filteredLiveTVChannels.length === 0 ? (
                <EmptyState
                  message={
                    liveTVSearchTerm
                      ? "Nenhum canal encontrado com essa pesquisa."
                      : 'Nenhum canal cadastrado. Clique em "Adicionar Canal" para começar.'
                  }
                />
              ) : (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredLiveTVChannels.map((channel) => (
                    <ItemRow
                      key={channel.id}
                      imageUrl={channel.imageUrl}
                      title={channel.name}
                      subtitle={channel.category || "Sem categoria"}
                      fallback="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37"
                      onEdit={() => {
                        setSelectedLiveTVChannel(channel);
                        setShowAddEditLiveTVModal(true);
                      }}
                      onDelete={() => handleDeleteLiveTVChannel(channel.id)}
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="background" className="focus-visible:outline-none">
            <SectionCard title="Imagens de Fundo">
              <BackgroundImageManager />
            </SectionCard>
          </TabsContent>

          <TabsContent value="featured-login" className="focus-visible:outline-none">
            <SectionCard title="Destaques no Login">
              <FeaturedLoginManager />
            </SectionCard>
          </TabsContent>

          <TabsContent value="banners" className="focus-visible:outline-none">
            <SectionCard title="Banners da Home">
              <BannerManager />
            </SectionCard>
          </TabsContent>

          <TabsContent value="requests" className="focus-visible:outline-none">
            <SectionCard title="Solicitações de Usuários">
              <RequestsManager />
            </SectionCard>
          </TabsContent>

          <TabsContent value="collections" className="focus-visible:outline-none">
            <SectionCard title="Coleções Editoriais">
              <CollectionsManager />
            </SectionCard>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={showAddEditModal} onOpenChange={setShowAddEditModal}>
          <DialogContent className="w-[95vw] max-w-[650px] max-h-[90vh] bg-black/95 border border-white/10 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {selectedMovie ? "Editar Filme" : "Adicionar Filme"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              {selectedMovie ? (
                <AddEditMovieForm
                  movie={selectedMovie}
                  onSuccess={() => {
                    setShowAddEditModal(false);
                    handleRefreshData();
                  }}
                />
              ) : (
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/[0.04] border border-white/10">
                    <TabsTrigger value="manual">Manual</TabsTrigger>
                    <TabsTrigger value="bulk">Importar Excel</TabsTrigger>
                  </TabsList>
                  <TabsContent value="manual" className="mt-4">
                    <AddEditMovieForm
                      onSuccess={() => {
                        setShowAddEditModal(false);
                        handleRefreshData();
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="bulk" className="mt-4">
                    <BulkUploadMoviesForm
                      onSuccess={() => {
                        setShowAddEditModal(false);
                        handleRefreshData();
                      }}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddEditSeriesModal} onOpenChange={setShowAddEditSeriesModal}>
          <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] bg-black/95 border border-white/10 text-white backdrop-blur-xl">
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

        <Dialog open={showAddEditLiveTVModal} onOpenChange={setShowAddEditLiveTVModal}>
          <DialogContent className="w-[95vw] max-w-[650px] max-h-[90vh] bg-black/95 border border-white/10 text-white backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {selectedLiveTVChannel ? "Editar Canal" : "Adicionar Canal"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[75vh] pr-4">
              <AddEditLiveTVForm
                channel={selectedLiveTVChannel || undefined}
                onSuccess={() => {
                  setShowAddEditLiveTVModal(false);
                  handleRefreshData();
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

// ---------- Subcomponents ----------

const SectionCard: React.FC<{
  title: string;
  count?: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, count, action, children }) => (
  <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md shadow-[0_20px_60px_-30px_rgba(229,9,20,0.25)] p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
        {typeof count === "number" && (
          <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full text-[11px] font-semibold bg-netflix-red/15 border border-netflix-red/30 text-red-200">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const ItemRow: React.FC<{
  imageUrl: string;
  title: string;
  subtitle?: string;
  description?: string;
  fallback: string;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ imageUrl, title, subtitle, description, fallback, onEdit, onDelete }) => (
  <div className="group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/40 hover:bg-white/[0.04] hover:border-netflix-red/40 transition-colors">
    <img
      src={imageUrl}
      alt={title}
      className="w-12 h-16 object-cover rounded-lg flex-shrink-0 ring-1 ring-white/10"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = fallback;
      }}
    />
    <div className="min-w-0 flex-1">
      <div className="font-medium text-sm truncate">{title}</div>
      {subtitle && <div className="text-xs text-white/40 mt-0.5">{subtitle}</div>}
      {description && (
        <div className="text-xs text-white/50 mt-1 line-clamp-2">{description}</div>
      )}
    </div>
    <div className="flex items-center gap-1 flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8 rounded-lg"
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-white/60 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-lg"
      >
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const SkeletonList: React.FC = () => (
  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.02] animate-pulse"
      >
        <div className="w-12 h-16 rounded-lg bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 bg-white/10 rounded" />
          <div className="h-2 w-1/3 bg-white/10 rounded" />
          <div className="h-2 w-full bg-white/5 rounded" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
    {message}
  </div>
);

export default AdminPage;
