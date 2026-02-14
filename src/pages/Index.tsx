import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, BookOpen, Users, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [projects, publications, faculty, departments] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("publications").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("faculty").select("id", { count: "exact", head: true }),
        supabase.from("departments").select("id", { count: "exact", head: true }),
      ]);
      return {
        projects: projects.count ?? 0,
        publications: publications.count ?? 0,
        faculty: faculty.count ?? 0,
        departments: departments.count ?? 0,
      };
    },
  });

  const { data: recentProjects } = useQuery({
    queryKey: ["recent-projects"],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, year, domain, departments(name)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const { data: recentPublications } = useQuery({
    queryKey: ["recent-publications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("publications")
        .select("id, title, year, journal, faculty(name)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const statCards = [
    { label: "Projects", value: stats?.projects ?? 0, icon: FolderOpen, href: "/projects", color: "text-primary" },
    { label: "Publications", value: stats?.publications ?? 0, icon: BookOpen, href: "/publications", color: "text-emerald-600" },
    { label: "Faculty", value: stats?.faculty ?? 0, icon: Users, href: "/faculty", color: "text-amber-600" },
    { label: "Departments", value: stats?.departments ?? 0, icon: Building2, href: "#", color: "text-violet-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Research Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Explore institutional research, projects, and faculty profiles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Projects</CardTitle>
            <Link to="/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentProjects?.length === 0 && (
              <p className="text-muted-foreground text-sm py-4">No projects yet</p>
            )}
            <div className="space-y-3">
              {recentProjects?.map((p: any) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.departments?.name} • {p.year} {p.domain && `• ${p.domain}`}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Publications</CardTitle>
            <Link to="/publications" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentPublications?.length === 0 && (
              <p className="text-muted-foreground text-sm py-4">No publications yet</p>
            )}
            <div className="space-y-3">
              {recentPublications?.map((p: any) => (
                <Link
                  key={p.id}
                  to={`/publications/${p.id}`}
                  className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.faculty?.name} • {p.year} {p.journal && `• ${p.journal}`}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
