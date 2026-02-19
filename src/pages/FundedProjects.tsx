import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Banknote } from "lucide-react";
import { Link } from "react-router-dom";

export default function FundedProjects() {
  const [search, setSearch] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["funded-projects"],
    queryFn: async () => {
      const response = await api.get<any>("/projects?funded=true&page=1&limit=1000", false);
      return response.data ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!projects) return [];
    if (!search) return projects;
    const s = search.toLowerCase();
    return projects.filter((p: any) =>
      p.title?.toLowerCase().includes(s) ||
      p.principal_investigator?.toLowerCase().includes(s) ||
      p.funding_agency?.toLowerCase().includes(s) ||
      p.department?.toLowerCase().includes(s)
    );
  }, [projects, search]);

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl px-6 py-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Banknote className="h-7 w-7" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Funded Projects</h1>
            <p className="text-primary-foreground/80 mt-1 text-sm">
              Externally &amp; Internally Funded Research Projects
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search funded projects..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">PI</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden lg:table-cell">Funding Agency</TableHead>
              <TableHead className="hidden lg:table-cell">Amount (₹)</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No funded projects found</TableCell>
              </TableRow>
            )}
            {filtered.map((project: any) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link to={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                    {project.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{project.principal_investigator ?? "—"}</TableCell>
                <TableCell className="hidden md:table-cell">{project.department ?? "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">{project.funding_agency ?? "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {project.sanctioned_amount ? project.sanctioned_amount.toLocaleString() : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={
                    project.status === "ongoing" ? "default" :
                    project.status === "completed" ? "secondary" : "outline"
                  }>
                    {project.status ?? "—"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
