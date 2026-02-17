import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

export default function Projects() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [department, setDepartment] = useState("all");
  const [year, setYear] = useState("all");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get<any>("/projects?page=1&limit=1000", false);
      return response.data ?? [];
    },
  });

  // Extract unique departments from projects
  const departments = useMemo(() => {
    if (!projects) return [];
    const deptSet = new Set<string>();
    projects.forEach((p: any) => {
      if (p.department) deptSet.add(p.department);
    });
    return Array.from(deptSet).sort();
  }, [projects]);

  // Filter projects on client side
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let result = [...projects];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((p: any) =>
        p.title?.toLowerCase().includes(s) ||
        p.objectives?.toLowerCase().includes(s) ||
        p.principal_investigator?.toLowerCase().includes(s)
      );
    }

    if (department !== "all") {
      result = result.filter((p: any) => p.department === department);
    }

    if (year !== "all") {
      result = result.filter((p: any) => {
        const startYear = p.start_date ? new Date(p.start_date).getFullYear() : null;
        return startYear === parseInt(year);
      });
    }

    return result;
  }, [projects, search, department, year]);

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground mt-1">Browse all approved academic projects</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden sm:table-cell">Year</TableHead>
              <TableHead className="hidden lg:table-cell">Guide</TableHead>
              <TableHead className="hidden lg:table-cell">Domain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
              </TableRow>
            )}
            {!isLoading && filteredProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No projects found</TableCell>
              </TableRow>
            )}
            {filteredProjects.map((project: any) => (
              <TableRow key={project.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                    {project.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{project.department ?? "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{project.start_date ? new Date(project.start_date).getFullYear() : "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">{project.principal_investigator ?? "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {project.funding_agency && <Badge variant="secondary">{project.funding_agency}</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
