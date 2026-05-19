
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { HistoryProvider } from "@/contexts/HistoryContext";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";

const MovieDetailsPage = lazy(() => import("@/pages/MovieDetailsPage"));
const PlayerPage = lazy(() => import("@/pages/PlayerPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const AdminAccess = lazy(() => import("@/pages/AdminAccess"));
const SeriesPage = lazy(() => import("@/pages/SeriesPage"));
const SeriesDetailsPage = lazy(() => import("@/pages/SeriesDetailsPage"));
const SeriesPlayerPage = lazy(() => import("@/pages/SeriesPlayerPage"));
const LiveTVPage = lazy(() => import("@/pages/LiveTVPage"));
const LiveTVPlayerPage = lazy(() => import("@/pages/LiveTVPlayerPage"));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage"));
const HistoryPage = lazy(() => import("@/pages/HistoryPage"));
const ClientInfo = lazy(() => import("@/components/ClientInfo"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <ThemeProvider>
          <FavoritesProvider>
            <HistoryProvider>
              <BrowserRouter>
                <Layout>
                  <Suspense fallback={null}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/movie/:id" element={<MovieDetailsPage />} />
                      <Route path="/player/:id" element={<PlayerPage />} />
                      <Route path="/series" element={<SeriesPage />} />
                      <Route path="/series/:id" element={<SeriesDetailsPage />} />
                      <Route path="/player/series/:seriesId/:seasonNumber/:episodeNumber" element={<SeriesPlayerPage />} />
                      <Route path="/livetv" element={<LiveTVPage />} />
                      <Route path="/livetv/player/:id" element={<LiveTVPlayerPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/info" element={<ClientInfo />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/admin-access" element={<AdminAccess />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </BrowserRouter>
            </HistoryProvider>
          </FavoritesProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
