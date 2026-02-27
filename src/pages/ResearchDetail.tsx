import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import axiosInstance from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  BookOpen,
  FolderKanban,
  DollarSign,
  Users,
  Target,
  CheckSquare,
  TrendingUp,
  Info,
} from "lucide-react";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusStyle: Record<string, { bg: string; text: string }> = {
  ongoing: { bg: "#DCFCE7", text: "#16A34A" },
  completed: { bg: "#F3F4F6", text: "#6B7280" },
  upcoming: { bg: "#FEF3C7", text: "#F59E0B" },
};

function StatusBadge({ status }: { status?: string }) {
  const s = statusStyle[status ?? ""] ?? { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-medium capitalize"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status ?? "Unknown"}
    </span>
  );
}

// ─── Metadata Card ────────────────────────────────────────────────────────────
function MetaCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon size={16} style={{ color: "#2563EB" }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function MetaRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b last:border-0" style={{ borderColor: "#F3F4F6" }}>
      <span className="text-xs shrink-0" style={{ color: "#9CA3AF" }}>{label}</span>
      <span className="text-sm font-medium text-right" style={{ color: "#111827" }}>{value ?? "—"}</span>
    </div>
  );
}

// ─── Publication Detail ───────────────────────────────────────────────────────
function PublicationDetailView({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["research-pub", id],
    queryFn: async () => {
      const response = await api.get<any>(`/publications/${id}`, false);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;
  if (!data) return <NotFoundState type="publication" />;

  const pub = data;
  // pub.indexing is a single string from the legacy DB; wrap if present
  const indexingList: string[] = pub.indexing
    ? Array.isArray(pub.indexing) ? pub.indexing : [pub.indexing]
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/research"
        className="inline-flex items-center gap-1 text-sm no-underline"
        style={{ color: "#6B7280" }}
      >
        <ArrowLeft size={15} /> Back to Research
      </Link>

      {/* Hero */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} style={{ color: "#2563EB" }} />
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}>
            Publication
          </span>
          {pub.year && <Badge variant="outline">{pub.year}</Badge>}
          {pub.national_international && (
            <Badge variant="secondary" className="capitalize">{pub.national_international}</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold leading-tight" style={{ color: "#111827" }}>
          {pub.title}
        </h1>
        {indexingList.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {indexingList.map((tag: string) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <MetaCard title="Basic Information" icon={Info}>
          <MetaRow label="Faculty" value={pub.faculty_name} />
          <MetaRow label="Authors" value={pub.authors} />
          <MetaRow label="Department" value={pub.department} />
          <MetaRow label="Year" value={pub.year} />
          <MetaRow label="Type" value={pub.publication_type} />
        </MetaCard>

        {/* Indexing Info */}
        <MetaCard title="Indexing & Publication" icon={BookOpen}>
          <MetaRow label="Journal / Conference" value={pub.journal_name || pub.conference_name} />
          <MetaRow label="Publisher" value={pub.publisher} />
          <MetaRow label="Indexing" value={pub.indexing} />
          <MetaRow label="Scope" value={pub.national_international} />
          <MetaRow label="DOI" value={pub.doi} />
        </MetaCard>
      </div>

      {/* Abstract */}
      {pub.abstract && (
        <MetaCard title="Abstract" icon={Target}>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{pub.abstract}</p>
        </MetaCard>
      )}

      {/* Outcomes placeholder */}
      <MetaCard title="Outcomes & Impact" icon={TrendingUp}>
        <p className="text-sm" style={{ color: "#9CA3AF" }}>
          {pub.outcomes ?? "No outcomes recorded yet."}
        </p>
      </MetaCard>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/research">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        {pub.doi && (
          <Button variant="outline" asChild>
            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Open DOI
            </a>
          </Button>
        )}
        {/* Placeholder PDF download */}
        <Button variant="outline" disabled title="PDF download coming soon">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
    </div>
  );
}

// ─── Project Detail ───────────────────────────────────────────────────────────
function ProjectDetailView({ id }: { id: string }) {
  const { data: resp, isLoading } = useQuery({
    queryKey: ["research-proj", id],
    queryFn: () =>
      axiosInstance.get<unknown, { success: boolean; data: any }>(`/v1/projects/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState />;
  const project = resp?.data;
  if (!project) return <NotFoundState type="project" />;

  const teamList: { name?: string; role?: string }[] = Array.isArray(project.teamMembers)
    ? project.teamMembers
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        to="/research"
        className="inline-flex items-center gap-1 text-sm no-underline"
        style={{ color: "#6B7280" }}
      >
        <ArrowLeft size={15} /> Back to Research
      </Link>

      {/* Hero */}
      <div
        className="rounded-xl p-6"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <FolderKanban size={18} style={{ color: "#16A34A" }} />
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>
                Project
              </span>
              <StatusBadge status={project.status} />
              {project.fundingAgency && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}>
                  {project.fundingAgency}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold leading-tight" style={{ color: "#111827" }}>
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <MetaCard title="Basic Information" icon={Info}>
          <MetaRow label="Department" value={project.department} />
          <MetaRow label="Principal Investigator" value={project.principalInvestigator} />
          <MetaRow label="Co-PI" value={project.coPrincipalInvestigator} />
          <MetaRow label="File Number" value={project.fileNumber} />
          <MetaRow label="Status" value={project.status} />
        </MetaCard>

        {/* Financial Info */}
        <MetaCard title="Financial Information" icon={DollarSign}>
          <MetaRow label="Funding Agency" value={project.fundingAgency} />
          <MetaRow label="Agency Scientist" value={project.agencyScientist} />
          <MetaRow
            label="Sanctioned Amount"
            value={project.sanctionedAmount != null ? `₹${Number(project.sanctionedAmount).toLocaleString()}` : null}
          />
          <MetaRow
            label="Start Date"
            value={project.startDate ? new Date(project.startDate).toLocaleDateString() : null}
          />
          <MetaRow
            label="End Date"
            value={project.endDate ? new Date(project.endDate).toLocaleDateString() : null}
          />
        </MetaCard>
      </div>

      {/* Abstract */}
      {project.abstract && (
        <MetaCard title="Abstract / Objectives" icon={Target}>
          <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{project.abstract}</p>
        </MetaCard>
      )}

      {/* Deliverables */}
      {project.deliverables && (
        <MetaCard title="Deliverables" icon={CheckSquare}>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>
            {project.deliverables}
          </p>
        </MetaCard>
      )}

      {/* Outcomes */}
      {project.outcomes && (
        <MetaCard title="Outcomes" icon={TrendingUp}>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#374151" }}>
            {project.outcomes}
          </p>
        </MetaCard>
      )}

      {/* Team */}
      {teamList.length > 0 && (
        <MetaCard title="Team Members" icon={Users}>
          <div className="space-y-2">
            {teamList.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: "#DBEAFE", color: "#2563EB" }}
                >
                  {(m.name ?? "?")[0]}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#111827" }}>{m.name ?? "—"}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>{m.role ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </MetaCard>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/research">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Link>
        </Button>
        {/* Placeholder PDF download */}
        <Button variant="outline" disabled title="PDF download coming soon">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="h-8 rounded-lg animate-pulse" style={{ backgroundColor: "#E5E7EB", width: "60%" }} />
      <div className="h-40 rounded-xl animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
        <div className="h-48 rounded-xl animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
      </div>
    </div>
  );
}

function NotFoundState({ type }: { type: string }) {
  return (
    <div className="text-center py-16 max-w-4xl">
      <p className="text-lg font-medium" style={{ color: "#6B7280" }}>
        {type === "publication" ? "Publication" : "Project"} not found
      </p>
      <Link to="/research" className="mt-3 inline-block text-sm no-underline" style={{ color: "#2563EB" }}>
        ← Back to Research
      </Link>
    </div>
  );
}

// ─── Router Entry ─────────────────────────────────────────────────────────────
export default function ResearchDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();

  if (!type || !id) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Invalid research item.</p>
        <Link to="/research" className="text-primary mt-2 block">← Back to Research</Link>
      </div>
    );
  }

  if (type === "publication") return <PublicationDetailView id={id} />;
  if (type === "project") return <ProjectDetailView id={id} />;

  return (
    <div className="text-center py-16">
      <p className="text-muted-foreground">Unknown research type: {type}</p>
      <Link to="/research" className="text-primary mt-2 block">← Back to Research</Link>
    </div>
  );
}
