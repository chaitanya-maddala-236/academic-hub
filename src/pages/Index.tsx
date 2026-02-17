import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  BookOpen,
  Users,
  ArrowRight,
  ShieldCheck,
  Lightbulb,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

const dashboardTabs = [
  { key: "projects", label: "Project Access", icon: FolderOpen, color: "bg-primary text-primary-foreground" },
  { key: "publications", label: "Publications", icon: BookOpen, color: "bg-emerald-600 text-white" },
  { key: "patents", label: "Patents", icon: ShieldCheck, color: "bg-amber-600 text-white" },
  { key: "ip-assets", label: "IP Assets", icon: Lightbulb, color: "bg-rose-600 text-white" },
] as const;

type TabKey = (typeof dashboardTabs)[number]["key"];

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabKey>("projects");

  // Fetch stats from backend
  const { data: projectsData } = useQuery({
    queryKey: ["projects-count"],
    queryFn: async () => {
      const response = await api.get<any>("/projects?page=1&limit=1", false);
      return response;
    },
  });

  const { data: publicationsData } = useQuery({
    queryKey: ["publications-count"],
    queryFn: async () => {
      const response = await api.get<any>("/publications?page=1&limit=1", false);
      return response;
    },
  });

  const { data: patentsData } = useQuery({
    queryKey: ["patents-count"],
    queryFn: async () => {
      const response = await api.get<any>("/patents?page=1&limit=1", false);
      return response;
    },
  });

  const { data: facultyData } = useQuery({
    queryKey: ["faculty-count"],
    queryFn: async () => {
      const response = await api.get<any>("/faculty?page=1&limit=1", false);
      return response;
    },
  });

  const { data: recentProjects } = useQuery({
    queryKey: ["recent-projects"],
    queryFn: async () => {
      const response = await api.get<any>("/projects?page=1&limit=5&sortBy=created_at&sortOrder=desc", false);
      return response.data || [];
    },
  });

  const { data: recentPublications } = useQuery({
    queryKey: ["recent-publications"],
    queryFn: async () => {
      const response = await api.get<any>("/publications?page=1&limit=5&sortBy=created_at&sortOrder=desc", false);
      return response.data || [];
    },
  });

  const stats = {
    projects: projectsData?.pagination?.total || 0,
    publications: publicationsData?.pagination?.total || 0,
    patents: patentsData?.pagination?.total || 0,
    faculty: facultyData?.pagination?.total || 0,
  };

  const quickAccessCards = [
    { label: "Publications This Year", value: stats.publications, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Projects Submitted", value: stats.projects, icon: FolderOpen, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Patents Filed", value: stats.patents, icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-100" },
    { label: "IPs Registered", value: 0, icon: Lightbulb, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {dashboardTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === tab.key
                ? tab.color
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
          <Link to="/projects">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add New Project
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickAccessCards.map((card) => (
            <Card key={card.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", card.bg, card.color)}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{card.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Additions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Additions</h2>
        <Card>
          <CardContent className="p-0 divide-y">
            {recentProjects?.map((p: any) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded bg-primary/10">
                  <FolderOpen className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-primary truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.agency} • {p.start_date ? new Date(p.start_date).getFullYear() : 'N/A'}
                  </p>
                </div>
              </Link>
            ))}
            {recentPublications?.map((p: any) => (
              <Link
                key={p.id}
                to={`/publications/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="p-2 rounded bg-emerald-100">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-primary truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.authors} • {p.year || 'N/A'}
                  </p>
                </div>
              </Link>
            ))}
            {(!recentProjects?.length && !recentPublications?.length) && (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No recent additions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
