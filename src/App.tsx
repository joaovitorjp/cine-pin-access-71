
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import MovieDetailsPage from "@/pages/MovieDetailsPage";
import AdminPage from "@/pages/AdminPage";
import SeriesPage from "@/pages/SeriesPage";
import SeriesDetailsPage from "@/pages/SeriesDetailsPage";
import LiveTVPage from "@/pages/LiveTVPage";
import LiveTVPlayerPage from "@/pages/LiveTVPlayerPage";
import FavoritesPage from "@/pages/FavoritesPage";
import HistoryPage from "@/pages/HistoryPage";
import ClientInfo from "@/components/ClientInfo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <HistoryProvider>
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/movie/:id" element={<MovieDetailsPage />} />
                    <Route path="/series" element={<SeriesPage />} />
                    <Route path="/series/:id" element={<SeriesDetailsPage />} />
                    <Route path="/livetv" element={<LiveTVPage />} />
                    <Route path="/livetv/player/:id" element={<LiveTVPlayerPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/history" element={<HistoryPage />} />
                    <Route path="/info" element={<ClientInfo />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </HistoryProvider>
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
