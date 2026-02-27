import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance, { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

export default function FacultyProfile() {
  const { id } = useParams();

  const { data: faculty, isLoading } = useQuery({
    queryKey: ["faculty", id],
    queryFn: async () => {
      const response = await api.get<any>(`/faculty/${id}`, false);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: publicationsData } = useQuery({
    queryKey: ["faculty-publications", id],
    queryFn: async () => {
      const response = await api.get<any>(`/publications?faculty_id=${id}`, false);
      return response.data || [];
    },
    enabled: !!id,
  });

  const { data: projectsData } = useQuery({
    queryKey: ["faculty-projects", id, faculty?.name],
    queryFn: async () => {
      const search = encodeURIComponent(faculty!.name);
      const response = await axiosInstance.get<unknown, { success: boolean; data: any[] }>(
        `/v1/projects?limit=100&search=${search}`
      );
      return response.data || [];
    },
    enabled: !!faculty?.name,
  });

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;
  if (!faculty) return <div className="text-muted-foreground">Faculty not found</div>;

  const initials = faculty.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/faculty" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Faculty
      </Link>

      <div className="flex items-start gap-5">
        <Avatar className="h-20 w-20">
          <AvatarImage src={faculty.profile_image ?? undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{faculty.name}</h1>
          <p className="text-muted-foreground">{faculty.designation ?? "Faculty"}</p>
          <p className="text-sm text-muted-foreground">{faculty.department}</p>
          {faculty.email && <p className="text-sm text-primary mt-1">{faculty.email}</p>}
        </div>
      </div>

      {faculty.bio && (
        <Card>
          <CardHeader><CardTitle className="text-lg">About</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground leading-relaxed">{faculty.bio}</p></CardContent>
        </Card>
      )}

      {faculty.specialization && (
        <div>
          <h3 className="font-semibold mb-2">Specialization</h3>
          <Badge>{faculty.specialization}</Badge>
        </div>
      )}

      {faculty.qualifications && (
        <div>
          <h3 className="font-semibold mb-2">Qualifications</h3>
          <p className="text-muted-foreground">{faculty.qualifications}</p>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Publications ({publicationsData?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {publicationsData?.length === 0 && <p className="text-sm text-muted-foreground">No publications yet</p>}
          <div className="space-y-2">
            {publicationsData?.map((p: any) => (
              <Link key={p.id} to={`/publications/${p.id}`} className="block p-2 rounded hover:bg-muted/50">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.year} {p.journal_name && `• ${p.journal_name}`}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Supervised Projects ({projectsData?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {projectsData?.length === 0 && <p className="text-sm text-muted-foreground">No projects yet</p>}
          <div className="space-y-2">
            {projectsData?.map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 rounded hover:bg-muted/50">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.startDate && new Date(p.startDate).getFullYear()} {p.department && `• ${p.department}`}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
