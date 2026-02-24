import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, Pencil, Users, Target, CheckSquare, TrendingUp, Paperclip,
} from "lucide-react";
import { motion } from "framer-motion";

interface TeamMember {
  name?: string;
  role?: string;
}

interface ProjectAttachment {
  name?: string;
  url?: string;
}

interface Project {
  id: number;
  title: string;
  abstract?: string;
  department?: string;
  fundingAgency?: string;
  agencyScientist?: string;
  fileNumber?: string;
  sanctionedAmount?: number;
  startDate?: string;
  endDate?: string;
  principalInvestigator?: string;
  coPrincipalInvestigator?: string;
  teamMembers?: TeamMember[] | null;
  deliverables?: string;
  outcomes?: string;
  attachments?: ProjectAttachment[] | null;
  status?: string;
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    ongoing: { bg: "#DCFCE7", text: "#16A34A" },
    completed: { bg: "#F3F4F6", text: "#6B7280" },
    upcoming: { bg: "#FEF3C7", text: "#F59E0B" },
  };
  const s = map[status ?? ""] ?? { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span className="px-3 py-1 rounded-full text-sm font-medium capitalize" style={{ backgroundColor: s.bg, color: s.text }}>
      {status ?? "Unknown"}
    </span>
  );
}

function InfoCard({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
      <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>{label}</p>
      <p className="font-semibold text-sm" style={{ color: "#111827" }}>{value ?? "—"}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} style={{ color: "#2563EB" }} />
        <h3 className="font-semibold" style={{ color: "#111827" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();

  const { data: resp, isLoading } = useQuery({
    queryKey: ["v1-project", id],
    queryFn: () => axiosInstance.get<unknown, { success: boolean; data: Project }>(`/v1/projects/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 rounded-lg animate-pulse" style={{ backgroundColor: "#E5E7EB", width: "60%" }} />
        <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
      </div>
    );
  }

  const project = resp?.data;
  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium" style={{ color: "#6B7280" }}>Project not found</p>
        <Link to="/projects" className="mt-3 inline-block text-sm no-underline" style={{ color: "#2563EB" }}>
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const teamList: TeamMember[] = Array.isArray(project.teamMembers) ? project.teamMembers : [];
  const attachmentList: ProjectAttachment[] = Array.isArray(project.attachments) ? project.attachments : [];

  return (
    <motion.div
      className="space-y-6 max-w-4xl"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Back */}
      <Link to="/projects" className="inline-flex items-center gap-1 text-sm no-underline" style={{ color: "#6B7280" }}>
        <ArrowLeft size={15} /> Back to Projects
      </Link>

      {/* Header Card */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <h1 className="text-2xl font-bold leading-tight" style={{ color: "#111827" }}>{project.title}</h1>
            <div className="flex items-center flex-wrap gap-3 mt-3">
              <StatusBadge status={project.status} />
              {project.fundingAgency && (
                <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}>
                  {project.fundingAgency}
                </span>
              )}
              {(project.startDate || project.endDate) && (
                <span className="text-sm" style={{ color: "#6B7280" }}>
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : "?"}{" "}
                  – {project.endDate ? new Date(project.endDate).toLocaleDateString() : "?"}
                </span>
              )}
              {project.sanctionedAmount && (
                <span className="text-sm font-semibold" style={{ color: "#111827" }}>
                  ₹{project.sanctionedAmount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          {(hasRole("admin") || hasRole("faculty")) && (
            <Link
              to={`/projects/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
              style={{ border: "1px solid #E5E7EB", color: "#374151" }}
            >
              <Pencil size={14} /> Edit
            </Link>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <InfoCard label="Department" value={project.department} />
          <InfoCard label="Principal Investigator" value={project.principalInvestigator} />
          <InfoCard label="Co-PI" value={project.coPrincipalInvestigator} />
          <InfoCard label="File Number" value={project.fileNumber} />
        </div>
      </div>

      {/* Abstract */}
      {project.abstract && (
        <SectionCard title="Abstract" icon={Target}>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{project.abstract}</p>
        </SectionCard>
      )}

      {/* Investigators */}
      <SectionCard title="Investigators" icon={Users}>
        <div className="flex flex-wrap gap-3">
          {project.principalInvestigator && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "#DBEAFE", minWidth: 180 }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: "#2563EB", color: "#FFFFFF" }}
              >
                {project.principalInvestigator[0]}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "#6B7280" }}>Principal Investigator</p>
                <p className="text-sm font-semibold" style={{ color: "#1E3A8A" }}>{project.principalInvestigator}</p>
              </div>
            </div>
          )}
          {project.coPrincipalInvestigator && (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "#F0FDF4", minWidth: 180 }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                style={{ backgroundColor: "#16A34A", color: "#FFFFFF" }}
              >
                {project.coPrincipalInvestigator[0]}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "#6B7280" }}>Co-PI</p>
                <p className="text-sm font-semibold" style={{ color: "#15803D" }}>{project.coPrincipalInvestigator}</p>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Team Members */}
      {teamList.length > 0 && (
        <SectionCard title="Team Members" icon={Users}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                <th className="text-left py-2 font-medium" style={{ color: "#6B7280" }}>Name</th>
                <th className="text-left py-2 font-medium" style={{ color: "#6B7280" }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {teamList.map((m, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <td className="py-2" style={{ color: "#111827" }}>{m.name ?? "—"}</td>
                  <td className="py-2" style={{ color: "#6B7280" }}>{m.role ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      )}

      {/* Deliverables */}
      {project.deliverables && (
        <SectionCard title="Deliverables" icon={CheckSquare}>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>{project.deliverables}</p>
        </SectionCard>
      )}

      {/* Outcomes */}
      {project.outcomes && (
        <SectionCard title="Outcomes" icon={TrendingUp}>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>{project.outcomes}</p>
        </SectionCard>
      )}

      {/* Attachments */}
      {attachmentList.length > 0 && (
        <SectionCard title="Attachments" icon={Paperclip}>
          <div className="space-y-2">
            {attachmentList.map((a, i) => (
              <a
                key={i}
                href={a.url ?? "#"}
                download
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm no-underline transition-colors"
                style={{ border: "1px solid #E5E7EB", color: "#2563EB" }}
              >
                <Paperclip size={14} />
                {a.name ?? `Attachment ${i + 1}`}
                <span className="ml-auto text-xs" style={{ color: "#6B7280" }}>Download</span>
              </a>
            ))}
          </div>
        </SectionCard>
      )}
    </motion.div>
  );
}
