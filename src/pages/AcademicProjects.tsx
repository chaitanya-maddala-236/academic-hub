import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axiosInstance from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Users,
  BookOpen,
  Search,
  RotateCcw,
  Eye,
  TrendingUp,
} from "lucide-react";

interface Student {
  id: number;
  rollNo: string | null;
  studentName: string | null;
  section: string | null;
}

interface AcademicProject {
  batchKey: string;
  academicYear: string | null;
  branch: string | null;
  batchNo: number | null;
  projectTitle: string | null;
  guideName: string | null;
  projectDomain: string | null;
  btech: string | null;
  students: Student[];
}

interface Stats {
  totalProjects: number;
  totalStudents: number;
  totalGuides: number;
  avgStudentsPerProject: number;
}

const ALL = "all";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-5 flex items-center gap-4">
      <div
        className="flex items-center justify-center rounded-lg shrink-0"
        style={{ width: 44, height: 44, backgroundColor: color + "20" }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "#111827" }}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AcademicProjects() {
  const [year, setYear] = useState(ALL);
  const [branch, setBranch] = useState(ALL);
  const [domain, setDomain] = useState(ALL);
  const [guide, setGuide] = useState("");

  const { data: statsData } = useQuery({
    queryKey: ["academic-projects-stats"],
    queryFn: () =>
      axiosInstance.get<unknown, { success: boolean; data: Stats }>(
        "/v1/academic-projects/stats"
      ),
    retry: false,
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["academic-projects"],
    queryFn: () =>
      axiosInstance.get<unknown, { success: boolean; data: AcademicProject[] }>(
        "/v1/academic-projects"
      ),
    retry: false,
  });

  const allProjects = useMemo<AcademicProject[]>(
    () => projectsData?.data ?? [],
    [projectsData]
  );
  const stats: Stats = statsData?.data ?? {
    totalProjects: 0,
    totalStudents: 0,
    totalGuides: 0,
    avgStudentsPerProject: 0,
  };

  const years = useMemo(
    () =>
      [...new Set(allProjects.map((p) => p.academicYear).filter((y): y is string => !!y))].sort(
        (a, b) => b.localeCompare(a)
      ),
    [allProjects]
  );

  const branches = useMemo(
    () =>
      [...new Set(allProjects.map((p) => p.branch).filter((b): b is string => !!b))].sort(),
    [allProjects]
  );

  const domains = useMemo(
    () =>
      [...new Set(allProjects.map((p) => p.projectDomain).filter((d): d is string => !!d))].sort(),
    [allProjects]
  );

  const filtered = useMemo(() => {
    let result = allProjects;
    if (year !== ALL) result = result.filter((p) => p.academicYear === year);
    if (branch !== ALL) result = result.filter((p) => p.branch === branch);
    if (domain !== ALL) result = result.filter((p) => p.projectDomain === domain);
    if (guide.trim()) {
      const g = guide.trim().toLowerCase();
      result = result.filter((p) => p.guideName?.toLowerCase().includes(g));
    }
    return result;
  }, [allProjects, year, branch, domain, guide]);

  const reset = () => {
    setYear(ALL);
    setBranch(ALL);
    setDomain(ALL);
    setGuide("");
  };

  const hasFilters =
    year !== ALL || branch !== ALL || domain !== ALL || guide.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl px-6 py-5 text-primary-foreground">
        <div className="flex items-center gap-3">
          <GraduationCap size={28} />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-wide uppercase">
              Academic Projects
            </h1>
            <p className="text-primary-foreground/80 mt-0.5 text-sm">
              B.Tech Major Project Management
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Projects"
          value={stats.totalProjects}
          color="#2563EB"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          color="#16A34A"
        />
        <StatCard
          icon={GraduationCap}
          label="Total Guides"
          value={stats.totalGuides}
          color="#9333EA"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Students / Project"
          value={stats.avgStudentsPerProject}
          color="#EA580C"
        />
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border bg-card shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[130px]">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Academic Year
            </p>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Years</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px]">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Branch
            </p>
            <Select value={branch} onValueChange={setBranch}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[130px]">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Domain
            </p>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Domains" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Domains</SelectItem>
                {domains.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Guide Search
            </p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="pl-8 h-9 text-sm"
                placeholder="Guide name..."
                value={guide}
                onChange={(e) => setGuide(e.target.value)}
              />
            </div>
          </div>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={reset}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30">
          <span className="text-sm font-semibold">
            Projects ({filtered.length})
          </span>
        </div>

        {isLoading && (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-muted/50" />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No projects found
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Batch No
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Branch
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Domain
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Guide
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Students
                  </th>
                  <th className="text-right px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr
                    key={project.batchKey}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {project.batchNo ?? "—"}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium line-clamp-2 leading-snug">
                        {project.projectTitle ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {project.academicYear ?? ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {project.branch ? (
                        <Badge variant="outline" className="text-xs">
                          {project.branch}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {project.projectDomain ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {project.projectDomain}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-muted-foreground">
                      {project.guideName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {project.students.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="default" className="gap-1 text-xs h-7">
                        <Link
                          to={`/academic-projects/${encodeURIComponent(project.batchKey)}`}
                        >
                          <Eye className="h-3 w-3" /> View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
