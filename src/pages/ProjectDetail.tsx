import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, Pencil,
} from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  id: number;
  title: string;
  department?: string;
  fundingAgency?: string;
  sanctionedAmount?: number;
  startDate?: string;
  principalInvestigator?: string;
  coPrincipalInvestigator?: string;
  duration?: string;
  status?: string;
  createdAt?: string;
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
              {project.startDate && (
                <span className="text-sm" style={{ color: "#6B7280" }}>
                  Sanctioned: {new Date(project.startDate).toLocaleDateString()}
                </span>
              )}
              {project.sanctionedAmount != null && (
                <span className="text-sm font-semibold" style={{ color: "#111827" }}>
                  ₹{project.sanctionedAmount.toLocaleString()} L
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
          {project.coPrincipalInvestigator && (
            <InfoCard label="Co-PI" value={project.coPrincipalInvestigator} />
          )}
          {project.duration && (
            <InfoCard label="Duration" value={project.duration} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
