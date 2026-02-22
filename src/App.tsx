import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import AddProject from "./pages/AddProject";
import EditProject from "./pages/EditProject";
import OngoingProjects from "./pages/OngoingProjects";
import CompletedProjects from "./pages/CompletedProjects";
import DepartmentProjects from "./pages/DepartmentProjects";
import Analytics from "./pages/Analytics";
import Publications from "./pages/Publications";
import PublicationDetail from "./pages/PublicationDetail";
import Faculty from "./pages/Faculty";
import FacultyProfile from "./pages/FacultyProfile";
import Patents from "./pages/Patents";
import IPAssets from "./pages/IPAssets";
import FundedProjects from "./pages/FundedProjects";
import ResearchLabs from "./pages/ResearchLabs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResearchProjectsDashboard from "./pages/ResearchProjectsDashboard";
import ResearchDashboard from "./pages/ResearchDashboard";
import ResearchDetail from "./pages/ResearchDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/projects/add" element={<AddProject />} />
                    <Route path="/projects/:id/edit" element={<EditProject />} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/ongoing-projects" element={<OngoingProjects />} />
                    <Route path="/completed-projects" element={<CompletedProjects />} />
                    <Route path="/department-projects" element={<DepartmentProjects />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/publications" element={<Publications />} />
                    <Route path="/publications/:id" element={<PublicationDetail />} />
                    <Route path="/faculty" element={<Faculty />} />
                    <Route path="/faculty/:id" element={<FacultyProfile />} />
                    <Route path="/patents" element={<Patents />} />
                    <Route path="/ip-assets" element={<IPAssets />} />
                    <Route path="/funded-projects" element={<FundedProjects />} />
                    <Route path="/research-labs" element={<ResearchLabs />} />
                    <Route path="/research-dashboard" element={<ResearchProjectsDashboard />} />
                    <Route path="/research" element={<ResearchDashboard />} />
                    <Route path="/research/:type/:id" element={<ResearchDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
