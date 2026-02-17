import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Github, ExternalLink } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const response = await api.get<any>(`/projects/${id}`, false);
      return response.data;
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
          {project.department && <Badge>{project.department}</Badge>}
          {project.start_date && <Badge variant="outline">{new Date(project.start_date).getFullYear()}</Badge>}
          {project.agency && <Badge variant="secondary">{project.agency}</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {project.objectives && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objectives</p>
                <p className="text-muted-foreground leading-relaxed">{project.objectives}</p>
              </div>
            )}
            {project.deliverables && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deliverables</p>
                <p className="text-muted-foreground leading-relaxed">{project.deliverables}</p>
              </div>
            )}
            {!project.objectives && !project.deliverables && (
              <p className="text-muted-foreground">No additional details provided.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Principal Investigator</p>
            <p className="font-medium">{project.pi_name || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Amount Sanctioned</p>
            <p className="font-medium">₹ {project.amount_sanctioned?.toLocaleString() || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">End Date</p>
            <p className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : "—"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
