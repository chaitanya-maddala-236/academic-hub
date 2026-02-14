import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

export default function FacultyProfile() {
  const { id } = useParams();

  const { data: faculty, isLoading } = useQuery({
    queryKey: ["faculty", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("faculty")
        .select("*, departments(name)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: publications } = useQuery({
    queryKey: ["faculty-publications", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("publications")
        .select("id, title, year, journal")
        .eq("faculty_id", id!)
        .eq("status", "approved")
        .order("year", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
  });

  const { data: projects } = useQuery({
    queryKey: ["faculty-projects", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, year, departments(name)")
        .eq("guide_id", id!)
        .eq("status", "approved")
        .order("year", { ascending: false });
      return data ?? [];
    },
    enabled: !!id,
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
          <AvatarImage src={faculty.photo_url ?? undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{faculty.name}</h1>
          <p className="text-muted-foreground">{faculty.designation ?? "Faculty"}</p>
          <p className="text-sm text-muted-foreground">{(faculty as any).departments?.name}</p>
          {faculty.email && <p className="text-sm text-primary mt-1">{faculty.email}</p>}
        </div>
      </div>

      {faculty.bio && (
        <Card>
          <CardHeader><CardTitle className="text-lg">About</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground leading-relaxed">{faculty.bio}</p></CardContent>
        </Card>
      )}

      {faculty.expertise && faculty.expertise.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {faculty.expertise.map((e: string) => <Badge key={e}>{e}</Badge>)}
          </div>
        </div>
      )}

      {faculty.research_interests && faculty.research_interests.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Research Interests</h3>
          <div className="flex flex-wrap gap-2">
            {faculty.research_interests.map((r: string) => <Badge key={r} variant="outline">{r}</Badge>)}
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">Publications ({publications?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {publications?.length === 0 && <p className="text-sm text-muted-foreground">No publications yet</p>}
          <div className="space-y-2">
            {publications?.map((p: any) => (
              <Link key={p.id} to={`/publications/${p.id}`} className="block p-2 rounded hover:bg-muted/50">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.year} {p.journal && `• ${p.journal}`}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Supervised Projects ({projects?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {projects?.length === 0 && <p className="text-sm text-muted-foreground">No projects yet</p>}
          <div className="space-y-2">
            {projects?.map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block p-2 rounded hover:bg-muted/50">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.year} {p.departments?.name && `• ${p.departments.name}`}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
