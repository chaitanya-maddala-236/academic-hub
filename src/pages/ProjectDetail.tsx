import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();

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

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.title}</h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {project.department && <Badge>{project.department}</Badge>}
            {project.start_date && <Badge variant="outline">{new Date(project.start_date).getFullYear()}</Badge>}
            {project.funding_agency && <Badge variant="secondary">{project.funding_agency}</Badge>}
            {project.status && (
              <Badge variant={project.status === "ongoing" ? "default" : project.status === "completed" ? "secondary" : "outline"}>
                {project.status}
              </Badge>
            )}
          </div>
        </div>
        {hasRole("admin") && (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to={`/projects/${id}/edit`}><Pencil className="mr-1 h-4 w-4" />Edit</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Principal Investigator</p>
            <p className="font-medium">{project.principal_investigator || "—"}</p>
          </CardContent>
        </Card>
        {project.co_principal_investigator && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Co-Principal Investigator</p>
              <p className="font-medium">{project.co_principal_investigator}</p>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Amount Sanctioned</p>
            <p className="font-medium">₹ {project.sanctioned_amount?.toLocaleString() || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Funding Agency</p>
            <p className="font-medium">{project.funding_agency || "—"}</p>
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
        {project.file_number && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">File Number</p>
              <p className="font-medium">{project.file_number}</p>
            </CardContent>
          </Card>
        )}
        {project.agency_scientist && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Agency Scientist</p>
              <p className="font-medium">{project.agency_scientist}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {(project.objectives || project.deliverables || project.outcomes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.objectives && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objectives</p>
                <p className="text-muted-foreground leading-relaxed mt-1">{project.objectives}</p>
              </div>
            )}
            {project.deliverables && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deliverables</p>
                <p className="text-muted-foreground leading-relaxed mt-1">{project.deliverables}</p>
              </div>
            )}
            {project.outcomes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Outcomes</p>
                <p className="text-muted-foreground leading-relaxed mt-1">{project.outcomes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {project.team && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{project.team}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
