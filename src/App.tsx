
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import MovieDetailsPage from "@/pages/MovieDetailsPage";
import PlayerPage from "@/pages/PlayerPage";
import AdminPage from "@/pages/AdminPage";
import SeriesPage from "@/pages/SeriesPage";
import SeriesDetailsPage from "@/pages/SeriesDetailsPage";
import SeriesPlayerPage from "@/pages/SeriesPlayerPage";
import AnimePage from "@/pages/AnimePage";
import AnimeDetailsPage from "@/pages/AnimeDetailsPage";
import AnimePlayerPage from "@/pages/AnimePlayerPage";
import ClientInfo from "@/components/ClientInfo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/movie/:id" element={<MovieDetailsPage />} />
              <Route path="/player/:id" element={<PlayerPage />} />
              <Route path="/series" element={<SeriesPage />} />
              <Route path="/series/:id" element={<SeriesDetailsPage />} />
              <Route path="/player/series/:seriesId/:seasonNumber/:episodeNumber" element={<SeriesPlayerPage />} />
              <Route path="/anime" element={<AnimePage />} />
              <Route path="/anime/:id" element={<AnimeDetailsPage />} />
              <Route path="/player/anime/:animeId/:seasonNumber/:episodeNumber" element={<AnimePlayerPage />} />
              <Route path="/info" element={<ClientInfo />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
