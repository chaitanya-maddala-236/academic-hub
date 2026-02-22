import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Search, Plus, FolderKanban, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: number;
  title: string;
  department?: string;
  funding_agency?: string;
  amount_lakhs?: number;
  sanction_date?: string;
  duration?: string;
  principal_investigator?: string;
  status?: string;
}

interface ApiResponse {
  total: number;
  page: number;
  totalPages: number;
  data: Project[];
}

const DEPARTMENTS = ["CSE", "ECE", "EEE", "ME", "IT", "CE", "H&S"];
const STATUSES = ["ONGOING", "COMPLETED"];
const FUNDING_AGENCIES = ["AICTE", "DST", "DRDO", "UGC", "SERB", "MSME"];
const YEARS = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));
const BUDGETS = [
  { label: "> 10 Lakhs", value: "10" },
  { label: "> 50 Lakhs", value: "50" },
  { label: "> 1 Crore (100L)", value: "100" },
];

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    ONGOING: { bg: "#DCFCE7", text: "#16A34A", label: "Ongoing" },
    ongoing: { bg: "#DCFCE7", text: "#16A34A", label: "Ongoing" },
    COMPLETED: { bg: "#F3F4F6", text: "#6B7280", label: "Completed" },
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
        {project.funding_agency && (
          <p><span className="font-medium">Agency:</span> {project.funding_agency}</p>
        )}
        {project.amount_lakhs && (
          <p><span className="font-medium">Budget:</span> ₹{project.amount_lakhs.toLocaleString()} L</p>
        )}
        {project.sanction_date && (
          <p>
            <span className="font-medium">Sanctioned:</span>{" "}
            {new Date(project.sanction_date).getFullYear()}
          </p>
        )}
        {project.principal_investigator && (
          <p><span className="font-medium">PI:</span> {project.principal_investigator}</p>
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
};

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [department, setDepartment] = useState(searchParams.get("department") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [funding, setFunding] = useState(searchParams.get("funding") ?? "");
  const [year, setYear] = useState(searchParams.get("year") ?? "");
  const [minBudget, setMinBudget] = useState(searchParams.get("minBudget") ?? "");
  const [page, setPage] = useState(1);
  const LIMIT = 12;
  const { hasRole } = useAuth();

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceRef = useCallback((() => {
    let timer: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebouncedSearch(value), 500);
    };
  })(), []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    debounceRef(value);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value); else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const handleFilter = (key: string, value: string) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next, { replace: true });

    if (key === "department") setDepartment(value);
    else if (key === "status") setStatus(value);
    else if (key === "funding") setFunding(value);
    else if (key === "year") setYear(value);
    else if (key === "minBudget") setMinBudget(value);
  };

  const params = new URLSearchParams({
    page: String(page),
    limit: String(LIMIT),
    sort: "newest",
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(department && { department }),
    ...(status && { status }),
    ...(funding && { funding }),
    ...(year && { year }),
    ...(minBudget && { minBudget }),
  });

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["projects", params.toString()],
    queryFn: () => axiosInstance.get(`/projects?${params.toString()}`),
  });

  const projects = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.ceil(total / LIMIT);

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

      {/* Filter Bar */}
      <div
        className="flex flex-wrap gap-3 p-4 rounded-xl"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border outline-none focus:ring-2 focus:ring-blue-200"
            style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827" }}
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => handleFilter("status", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827", minWidth: 130 }}
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === "ONGOING" ? "Ongoing" : "Completed"}</option>
          ))}
        </select>

        {/* Department */}
        <select
          value={department}
          onChange={(e) => handleFilter("department", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827", minWidth: 130 }}
        >
          <option value="">All Depts</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Funding Agency */}
        <select
          value={funding}
          onChange={(e) => handleFilter("funding", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827", minWidth: 130 }}
        >
          <option value="">All Funding</option>
          {FUNDING_AGENCIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => handleFilter("year", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827", minWidth: 110 }}
        >
          <option value="">All Years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Budget */}
        <select
          value={minBudget}
          onChange={(e) => handleFilter("minBudget", e.target.value)}
          className="px-3 py-2 rounded-lg text-sm border outline-none"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", color: "#111827", minWidth: 140 }}
        >
          <option value="">All Budgets</option>
          {BUDGETS.map((b) => (
            <option key={b.value} value={b.value}>{b.label}</option>
          ))}
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
        <AnimatePresence mode="wait">
          <motion.div
            key={params.toString()}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {projects.map((p, i) => (
              <motion.div key={p.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
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
          {(() => {
            const win = 2;
            const start = Math.max(1, Math.min(page - win, totalPages - win * 2));
            const end = Math.min(totalPages, start + win * 2);
            return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
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
            ));
          })()}
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
