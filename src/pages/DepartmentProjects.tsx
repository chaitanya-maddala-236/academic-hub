import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function DepartmentProjects() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["all-projects-dept"],
    queryFn: async () => {
      const response = await axiosInstance.get<unknown, { success: boolean; data: any[]; meta: any }>(
        "/v1/projects?page=1&limit=1000"
      );
      return response.data ?? [];
    },
  });

  const departments = useMemo(() => {
    if (!projects) return [];
    const set = new Set<string>();
    projects.forEach((p: any) => { if (p.department) set.add(p.department); });
    return Array.from(set).sort();
  }, [projects]);

  const [activeTab, setActiveTab] = useState<string>("");

  const currentDept = activeTab || departments[0] || "";

  const filtered = useMemo(
    () => (projects ?? []).filter((p: any) => p.department === currentDept),
    [projects, currentDept]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Department-wise Projects</h1>
          <p className="text-muted-foreground mt-1">Browse projects by department</p>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && departments.length === 0 && (
        <p className="text-muted-foreground">No projects found.</p>
      )}

      {!isLoading && departments.length > 0 && (
        <Tabs value={currentDept} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto gap-1">
            {departments.map((dept) => (
              <TabsTrigger key={dept} value={dept}>
                {dept}
              </TabsTrigger>
            ))}
          </TabsList>

          {departments.map((dept) => (
            <TabsContent key={dept} value={dept} className="mt-4">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground">No projects in this department.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((project: any) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/projects/${project.id}`}
                            className="font-semibold text-primary hover:underline leading-snug"
                          >
                            {project.title}
                          </Link>
                          {project.status && (
                            <Badge
                              variant={
                                project.status === "ongoing"
                                  ? "default"
                                  : project.status === "completed"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="shrink-0 capitalize"
                            >
                              {project.status}
                            </Badge>
                          )}
                        </div>
                        {project.principalInvestigator && (
                          <p className="text-sm">PI: {project.principalInvestigator}</p>
                        )}
                        {project.fundingAgency && (
                          <Badge variant="outline" className="text-xs">{project.fundingAgency}</Badge>
                        )}
                        {project.startDate && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(project.startDate).getFullYear()}
                            {project.endDate ? ` – ${new Date(project.endDate).getFullYear()}` : ""}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
