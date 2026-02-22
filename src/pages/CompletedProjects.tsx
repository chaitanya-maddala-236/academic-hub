import { useQuery } from "@tanstack/react-query";
import { projectsApi, Project } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function CompletedProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["completed-projects"],
    queryFn: async () => {
      const response = await projectsApi.getProjects({ status: "completed", page: 1, limit: 1000 });
      return response.data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-7 w-7 text-emerald-600" />
        <div>
          <h1 className="text-3xl font-bold">Completed Projects</h1>
          <p className="text-muted-foreground mt-1">Successfully concluded research projects</p>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && projects?.length === 0 && (
        <p className="text-muted-foreground">No completed projects found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project: Project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-semibold text-primary hover:underline leading-snug"
                >
                  {project.title}
                </Link>
                <Badge variant="secondary" className="shrink-0">completed</Badge>
              </div>
              {project.department && (
                <p className="text-sm text-muted-foreground">{project.department}</p>
              )}
              {project.principalInvestigator && (
                <p className="text-sm">PI: {project.principalInvestigator}</p>
              )}
              {project.fundingAgency && (
                <Badge variant="outline" className="text-xs">{project.fundingAgency}</Badge>
              )}
              {project.endDate && (
                <p className="text-xs text-muted-foreground">
                  Completed: {new Date(project.endDate).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
