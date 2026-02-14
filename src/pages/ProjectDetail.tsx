import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Github, ExternalLink } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("*, departments(name), faculty!projects_guide_id_fkey(name)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;
  if (!project) return <div className="text-muted-foreground">Project not found</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Projects
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          {project.departments?.name && <Badge>{project.departments.name}</Badge>}
          <Badge variant="outline">{project.year}</Badge>
          {project.domain && <Badge variant="secondary">{project.domain}</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Abstract</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{project.abstract || "No abstract provided."}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Guide</p>
            <p className="font-medium">{(project as any).faculty?.name ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Team Members</p>
            <p className="font-medium">{project.team_members?.join(", ") || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        {project.pdf_url && (
          <Button asChild>
            <a href={project.pdf_url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </a>
          </Button>
        )}
        {project.github_url && (
          <Button variant="outline" asChild>
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" /> GitHub
            </a>
          </Button>
        )}
        {project.demo_url && (
          <Button variant="outline" asChild>
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Demo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
