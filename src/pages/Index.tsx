import { useQuery } from "@tanstack/react-query";
import axiosInstance, { api } from "@/services/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import {
  FolderKanban, Activity, CheckCircle, DollarSign, Users, Building2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const COLORS = ["#16A34A", "#6B7280", "#F59E0B", "#2563EB", "#7C3AED"];

interface DashboardStats {
  total: number;
  ongoing: number;
  completed: number;
  totalFunding: number;
  uniqueAgencies: number;
  topFaculty: { name: string; count: number }[];
  projectsByYear: { year: number; count: number }[];
  departmentChart: { department: string; count: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
}

interface Project {
  id: number;
  title: string;
  fundingAgency?: string;
  department?: string;
  status?: string;
  startDate?: string;
}

function KpiCard({
  title, value, icon: Icon, color, bg,
}: { title: string; value: string | number; icon: React.ElementType; color: string; bg: string }) {
  return (
    <div
      className="rounded-xl p-5 flex items-center gap-4"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="rounded-xl p-3 shrink-0" style={{ backgroundColor: bg }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: "#111827" }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{title}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <h3 className="font-semibold mb-4" style={{ color: "#111827" }}>{title}</h3>
      {children}
    </div>
  );
}

export default function Index() {


  const { data: statsResp, isLoading: statsLoading } = useQuery({
    queryKey: ["v1-dashboard"],
    queryFn: () => axiosInstance.get<unknown, { success: boolean; data: DashboardStats }>("/v1/projects/dashboard"),
  });

  const { data: recentResp } = useQuery({
    queryKey: ["v1-recent-projects"],
    queryFn: () =>
      axiosInstance.get<unknown, { success: boolean; data: Project[]; meta: { total: number } }>(
        "/v1/projects?page=1&limit=5&sortBy=createdAt&sortOrder=desc"
      ),
  });

  const stats: DashboardStats = statsResp?.data ?? {
    total: 0, ongoing: 0, completed: 0, totalFunding: 0, uniqueAgencies: 0,
    topFaculty: [], projectsByYear: [], departmentChart: [], statusDistribution: [],
  };

  const recentProjects: Project[] = recentResp?.data ?? [];

  const kpis = [
    { title: "Total Projects", value: stats.total, icon: FolderKanban, color: "#2563EB", bg: "#DBEAFE" },
    { title: "Ongoing Projects", value: stats.ongoing, icon: Activity, color: "#16A34A", bg: "#DCFCE7" },
    { title: "Completed Projects", value: stats.completed, icon: CheckCircle, color: "#6B7280", bg: "#F3F4F6" },
    { title: "Total Funding (₹)", value: stats.totalFunding > 0 ? `₹${(stats.totalFunding / 100000).toFixed(1)}L` : "₹0", icon: DollarSign, color: "#F59E0B", bg: "#FEF3C7" },
    { title: "Total Faculty", value: stats.topFaculty?.length ?? 0, icon: Users, color: "#7C3AED", bg: "#EDE9FE" },
    { title: "Total Agencies", value: stats.uniqueAgencies, icon: Building2, color: "#0891B2", bg: "#CFFAFE" },
  ];

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl h-24 animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Research Management Portal Overview</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Projects by Department">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.departmentChart} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: "#6B7280" }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Projects" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Status Distribution">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.statusDistribution.filter(s => s.value > 0)}
                cx="50%" cy="50%" outerRadius={80}
                dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {stats.statusDistribution.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Projects by Year">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.projectsByYear} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ fill: "#2563EB" }} name="Projects" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top Faculty by Projects">
          {stats.topFaculty.length === 0 ? (
            <p className="text-sm py-8 text-center" style={{ color: "#6B7280" }}>No data available</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                  <th className="text-left pb-2 font-medium" style={{ color: "#6B7280" }}>Faculty Name</th>
                  <th className="text-right pb-2 font-medium" style={{ color: "#6B7280" }}>Projects</th>
                </tr>
              </thead>
              <tbody>
                {stats.topFaculty.map((f, i) => (
                  <tr key={f.name} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td className="py-2" style={{ color: "#111827" }}>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-2"
                        style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}>
                        {i + 1}
                      </span>
                      {f.name}
                    </td>
                    <td className="py-2 text-right font-semibold" style={{ color: "#2563EB" }}>{f.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </div>

      {/* Recent Projects */}
      <SectionCard title="Recent Projects">
        {recentProjects.length === 0 ? (
          <div className="text-center py-8">
            <FolderKanban size={40} className="mx-auto mb-3" style={{ color: "#E5E7EB" }} />
            <p className="text-sm" style={{ color: "#6B7280" }}>No projects yet. Add your first project.</p>
            <Link
              to="/projects"
              className="inline-block mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white no-underline"
              style={{ backgroundColor: "#2563EB" }}
            >
              Go to Projects
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="block rounded-xl p-4 no-underline transition-shadow hover:shadow-md"
                style={{ border: "1px solid #E5E7EB", backgroundColor: "#FAFAFA" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm line-clamp-2" style={{ color: "#111827" }}>{p.title}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: p.status === "ongoing" ? "#DCFCE7" : p.status === "completed" ? "#F3F4F6" : "#FEF3C7",
                      color: p.status === "ongoing" ? "#16A34A" : p.status === "completed" ? "#6B7280" : "#F59E0B",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs mt-2" style={{ color: "#6B7280" }}>
                  {p.department ?? "—"} · {p.fundingAgency ?? "—"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
