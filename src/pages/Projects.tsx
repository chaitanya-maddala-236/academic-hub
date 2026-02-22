import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Search, Plus, FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

interface Project {
  id: number;
  title: string;
  department?: string;
  fundingAgency?: string;
  sanctionedAmount?: number;
  startDate?: string;
  endDate?: string;
  principalInvestigator?: string;
  status?: string;
}

interface ApiResponse {
  success: boolean;
  data: Project[];
  meta: { page: number; limit: number; total: number };
}

const DEPARTMENTS = [
  "CSE", "ECE", "EEE", "Mechanical", "Civil", "Chemical", "IT", "MBA", "MCA",
];
const STATUSES = ["ongoing", "completed", "upcoming"];
const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    ongoing: { bg: "#DCFCE7", text: "#16A34A", label: "Ongoing" },
    completed: { bg: "#F3F4F6", text: "#6B7280", label: "Completed" },
    upcoming: { bg: "#FEF3C7", text: "#F59E0B", label: "Upcoming" },
  };
  const style = map[status ?? ""] ?? { bg: "#F3F4F6", text: "#6B7280", label: status ?? "Unknown" };
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-lg"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm line-clamp-2 leading-snug" style={{ color: "#111827" }}>
          {project.title}
        </h3>
        <StatusBadge status={project.status} />
      </div>
      <div className="space-y-1 text-xs" style={{ color: "#6B7280" }}>
        {project.department && (
          <p><span className="font-medium">Dept:</span> {project.department}</p>
        )}
        {project.fundingAgency && (
          <p><span className="font-medium">Agency:</span> {project.fundingAgency}</p>
        )}
        {project.sanctionedAmount && (
          <p><span className="font-medium">Budget:</span> ₹{project.sanctionedAmount.toLocaleString()}</p>
        )}
        {(project.startDate || project.endDate) && (
          <p>
            <span className="font-medium">Duration:</span>{" "}
            {project.startDate ? new Date(project.startDate).getFullYear() : "?"}{" "}
            — {project.endDate ? new Date(project.endDate).getFullYear() : "?"}
          </p>
        )}
        {project.principalInvestigator && (
          <p><span className="font-medium">PI:</span> {project.principalInvestigator}</p>
        )}
      </div>
      <Link
        to={`/projects/${project.id}`}
        className="mt-auto block text-center py-2 rounded-lg text-xs font-medium no-underline transition-colors"
        style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#2563EB"; (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#DBEAFE"; (e.currentTarget as HTMLElement).style.color = "#2563EB"; }}
      >
        View Details
      </Link>
    </div>
  );
}

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [department, setDepartment] = useState(searchParams.get("department") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [agency, setAgency] = useState(searchParams.get("agency") ?? "");
  const [year, setYear] = useState(searchParams.get("year") ?? "");
  const [sortBy, setSortBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const LIMIT = 12;
  const { hasRole } = useAuth();

  const params = new URLSearchParams({
    page: String(page), limit: String(LIMIT),
    ...(search && { search }),
    ...(department && { department }),
    ...(status && { status }),
    ...(agency && { agency }),
    ...(year && { year }),
    sortBy, sortOrder: "desc",
  });

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["v1-projects", params.toString()],
    queryFn: () => axiosInstance.get(`/projects?${params.toString()}`),
  });

  const projects = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const handleFilter = (key: string, value: string) => {
    setPage(1);
    if (key === "search") setSearch(value);
    else if (key === "department") setDepartment(value);
    else if (key === "status") setStatus(value);
    else if (key === "agency") setAgency(value);
    else if (key === "year") setYear(value);
    else if (key === "sortBy") setSortBy(value);

    const next = new URLSearchParams(searchParams);
    if (value) next.set(key === "search" ? "q" : key, value);
    else next.delete(key === "search" ? "q" : key);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Research Projects</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            {total} project{total !== 1 ? "s" : ""} found
          </p>
        </div>
        {(hasRole("admin") || hasRole("faculty")) && (
          <Link
            to="/projects/add"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white no-underline"
            style={{ backgroundColor: "#2563EB" }}
          >
            <Plus size={16} />
            Add Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => handleFilter("search", e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border outline-none focus:ring-2"
            style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827" }}
          />
        </div>
        {[
          { key: "department", value: department, label: "Department", options: DEPARTMENTS },
          { key: "status", value: status, label: "Status", options: STATUSES },
          { key: "year", value: year, label: "Year", options: YEARS.map(String) },
        ].map((f) => (
          <select
            key={f.key}
            value={f.value}
            onChange={(e) => handleFilter(f.key, e.target.value)}
            className="px-3 py-2 rounded-lg text-sm border outline-none"
            style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827", minWidth: 140 }}
          >
            <option value="">All {f.label}s</option>
            {f.options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        ))}
        <select
          value={sortBy}
          onChange={(e) => handleFilter("sortBy", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827", minWidth: 130 }}
        >
          <option value="createdAt">Sort: Newest</option>
          <option value="title">Sort: Title</option>
          <option value="startDate">Sort: Start Date</option>
          <option value="sanctionedAmount">Sort: Budget</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl h-48 animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban size={48} className="mx-auto mb-4" style={{ color: "#E5E7EB" }} />
          <p className="font-medium" style={{ color: "#6B7280" }}>No projects found</p>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border disabled:opacity-40"
            style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-9 h-9 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: page === p ? "#2563EB" : "#FFFFFF",
                  color: page === p ? "#FFFFFF" : "#374151",
                  border: "1px solid #E5E7EB",
                }}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border disabled:opacity-40"
            style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
