import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  GraduationCap,
  User,
  Users,
  Download,
  BookOpen,
  Hash,
  Calendar,
  Layers,
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

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: "#F3F4F6" }}>
      <div className="mt-0.5 p-1.5 rounded-lg shrink-0" style={{ backgroundColor: "#EFF6FF" }}>
        <Icon size={14} style={{ color: "#2563EB" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium mt-0.5" style={{ color: "#111827" }}>
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function downloadCSV(project: AcademicProject) {
  const rows = [
    ["Roll No", "Student Name", "Section", "Branch", "Batch No", "Project Title", "Guide", "Domain", "Academic Year"],
    ...project.students.map((s) => [
      s.rollNo ?? "",
      s.studentName ?? "",
      s.section ?? "",
      project.branch ?? "",
      String(project.batchNo ?? ""),
      project.projectTitle ?? "",
      project.guideName ?? "",
      project.projectDomain ?? "",
      project.academicYear ?? "",
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `batch-${project.batchNo ?? "team"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AcademicProjectDetail() {
  const { batchId } = useParams<{ batchId: string }>();

  const { data: resp, isLoading } = useQuery({
    queryKey: ["academic-project-detail", batchId],
    queryFn: () =>
      axiosInstance.get<unknown, { success: boolean; data: AcademicProject }>(
        `/v1/academic-projects/batch/${batchId}`
      ),
    enabled: !!batchId,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 rounded-lg animate-pulse bg-muted w-48" />
        <div className="h-48 rounded-xl animate-pulse bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 rounded-xl animate-pulse bg-muted" />
          <div className="h-64 rounded-xl animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  const project = resp?.data;

  if (!project) {
    return (
      <div className="text-center py-16 max-w-4xl">
        <p className="text-lg font-medium text-muted-foreground">Project not found</p>
        <Link
          to="/academic-projects"
          className="mt-3 inline-block text-sm text-primary"
        >
          ← Back to Academic Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back Link */}
      <Link
        to="/academic-projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground no-underline"
      >
        <ArrowLeft size={15} /> Back to Academic Projects
      </Link>

      {/* Hero */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 44, height: 44, backgroundColor: "#DBEAFE" }}>
            <GraduationCap size={22} style={{ color: "#2563EB" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {project.branch && (
                <Badge variant="outline" className="text-xs">
                  {project.branch}
                </Badge>
              )}
              {project.projectDomain && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}>
                  {project.projectDomain}
                </span>
              )}
              {project.academicYear && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}>
                  {project.academicYear}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold leading-tight" style={{ color: "#111827" }}>
              {project.projectTitle ?? "Untitled Project"}
            </h1>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Project Info */}
        <div
          className="rounded-xl p-5"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}
        >
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2" style={{ color: "#111827" }}>
            <BookOpen size={16} style={{ color: "#2563EB" }} /> Project Information
          </h2>
          <InfoRow icon={Hash} label="Batch No" value={project.batchNo} />
          <InfoRow icon={Calendar} label="Academic Year" value={project.academicYear} />
          <InfoRow icon={Layers} label="Branch" value={project.branch} />
          <InfoRow icon={BookOpen} label="Project Domain" value={project.projectDomain} />
          <InfoRow icon={User} label="Guide Name" value={project.guideName} />
        </div>

        {/* Right: Team Members */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF" }}
        >
          <div className="px-5 py-3 border-b bg-muted/30 flex items-center gap-2">
            <Users size={16} style={{ color: "#2563EB" }} />
            <h2 className="text-base font-semibold" style={{ color: "#111827" }}>
              Team Members ({project.students.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/10">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">#</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Roll No</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase">Section</th>
                </tr>
              </thead>
              <tbody>
                {project.students.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{student.rollNo ?? "—"}</td>
                    <td className="px-4 py-2.5 font-medium">{student.studentName ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{student.section ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/academic-projects">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => downloadCSV(project)}
        >
          <Download className="h-4 w-4" /> Download Team List (CSV)
        </Button>
      </div>
    </div>
  );
}
