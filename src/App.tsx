import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import FunnelsListPage from "./pages/FunnelsListPage";
import FunnelCreatePage from "./pages/FunnelCreatePage";
import FunnelEditPage from "./pages/FunnelEditPage";
import FunnelAnalysisPage from "./pages/FunnelAnalysisPage";
import FunnelUsersPage from "./pages/FunnelUsersPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/funnels" replace />} />
          <Route path="/funnels" element={<FunnelsListPage />} />
          <Route path="/funnels/create" element={<FunnelCreatePage />} />
          <Route path="/funnels/:id/edit" element={<FunnelEditPage />} />
          <Route path="/funnels/:id/analysis" element={<FunnelAnalysisPage />} />
          <Route path="/funnels/:id/users" element={<FunnelUsersPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
