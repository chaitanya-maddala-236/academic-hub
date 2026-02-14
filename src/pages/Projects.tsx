import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", search, department, year],
    queryFn: async () => {
      let query = supabase
        .from("projects")
        .select("*, departments(name), faculty!projects_guide_id_fkey(name)")
        .eq("status", "approved")
        .order("year", { ascending: false });

      if (search) query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%,domain.ilike.%${search}%`);
      if (department !== "all") query = query.eq("department_id", department);
      if (year !== "all") query = query.eq("year", parseInt(year));

      const { data } = await query;
      return data ?? [];
    },
  });

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
            {departments?.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
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
            {!isLoading && projects?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No projects found</TableCell>
              </TableRow>
            )}
            {projects?.map((project: any) => (
              <TableRow key={project.id} className="cursor-pointer">
                <TableCell>
                  <Link to={`/projects/${project.id}`} className="font-medium text-primary hover:underline">
                    {project.title}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{project.departments?.name ?? "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{project.year}</TableCell>
                <TableCell className="hidden lg:table-cell">{project.faculty?.name ?? "—"}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {project.domain && <Badge variant="secondary">{project.domain}</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
