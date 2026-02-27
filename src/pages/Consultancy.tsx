import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { consultancyApi, ConsultancyRecord } from "@/services/api";
import {
  Banknote, FolderKanban, Activity, CheckCircle, Clock,
  Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<string, { bg: string; text: string }> = {
  active:    { bg: "#DCFCE7", text: "#16A34A" },
  completed: { bg: "#DBEAFE", text: "#2563EB" },
  pending:   { bg: "#FEF3C7", text: "#D97706" },
};

function StatusBadge({ status }: { status?: string | null }) {
  const key = (status || "").toLowerCase();
  const style = statusStyles[key] ?? { bg: "#F3F4F6", text: "#6B7280" };
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status || "—"}
    </span>
  );
}

// ─── Horizontal Bar Metric ────────────────────────────────────────────────────

function HBar({
  label,
  value,
  maxValue,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  suffix?: string;
}) {
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-44 shrink-0" style={{ color: "#6B7280" }}>
        {label}
      </span>
      <div className="flex-1 h-4 rounded-full overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-sm font-semibold w-16 text-right" style={{ color: "#111827" }}>
        {suffix ? `₹${value.toFixed(1)}L` : value}
      </span>
    </div>
  );
}

// ─── Metrics Section ──────────────────────────────────────────────────────────

function MetricsSection() {
  const { data: metricsResp, isLoading } = useQuery({
    queryKey: ["consultancy-metrics"],
    queryFn: () => consultancyApi.getMetrics(),
  });

  const m = metricsResp?.data;

  const kpis = [
    { label: "Total Projects",    value: m?.totalProjects ?? 0,    icon: FolderKanban, color: "#2563EB", bg: "#DBEAFE", isAmount: false },
    { label: "Estimated (Lakhs)", value: m?.totalEstimated ?? 0,   icon: Banknote,     color: "#7C3AED", bg: "#EDE9FE", isAmount: true },
    { label: "Received (Lakhs)",  value: m?.totalReceived ?? 0,    icon: Banknote,     color: "#10B981", bg: "#D1FAE5", isAmount: true },
    { label: "Active Projects",   value: m?.activeProjects ?? 0,   icon: Activity,     color: "#16A34A", bg: "#DCFCE7", isAmount: false },
  ];

  const maxVal = Math.max(
    m?.totalProjects ?? 0,
    m?.totalEstimated ?? 0,
    m?.totalReceived ?? 0,
    m?.activeProjects ?? 0,
    1
  );

  return (
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <h2 className="font-bold text-base mb-5" style={{ color: "#111827" }}>
        Consultancy Metrics
      </h2>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="flex items-center gap-3 rounded-xl p-4"
            style={{ backgroundColor: k.bg }}
          >
            <k.icon size={22} style={{ color: k.color }} />
            <div>
              <p className="text-xl font-bold leading-tight" style={{ color: "#111827" }}>
                {k.isAmount ? `₹${Number(k.value).toFixed(1)}L` : k.value}
              </p>
              <p className="text-xs" style={{ color: "#6B7280" }}>{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal bars */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 rounded-full animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <HBar label="Total Projects"       value={m?.totalProjects ?? 0}   maxValue={maxVal} color="#3B82F6" />
          <HBar label="Estimated (Lakhs)"    value={m?.totalEstimated ?? 0}  maxValue={maxVal} color="#8B5CF6" suffix="L" />
          <HBar label="Received (Lakhs)"     value={m?.totalReceived ?? 0}   maxValue={maxVal} color="#10B981" suffix="L" />
          <HBar label="Active Projects"      value={m?.activeProjects ?? 0}  maxValue={maxVal} color="#16A34A" />
          <HBar label="Completed Projects"   value={m?.completedProjects ?? 0} maxValue={maxVal} color="#2563EB" />
          <HBar label="Pending Projects"     value={m?.pendingProjects ?? 0} maxValue={maxVal} color="#F59E0B" />
        </div>
      )}
    </div>
  );
}

// ─── Modal Form ───────────────────────────────────────────────────────────────

const emptyForm: Omit<ConsultancyRecord, "id" | "created_at"> = {
  project_title: "",
  principal_investigator: "",
  co_investigators: "",
  department: "",
  institute_level: "",
  estimated_amount_lakhs: null,
  received_amount_lakhs: null,
  remarks: "",
  status: "Pending",
};

function ConsultancyModal({
  record,
  onClose,
  onSave,
}: {
  record?: ConsultancyRecord | null;
  onClose: () => void;
  onSave: (data: Omit<ConsultancyRecord, "id" | "created_at">) => void;
}) {
  const [form, setForm] = useState<Omit<ConsultancyRecord, "id" | "created_at">>(
    record
      ? {
          project_title:          record.project_title,
          principal_investigator: record.principal_investigator ?? "",
          co_investigators:       record.co_investigators ?? "",
          department:             record.department ?? "",
          institute_level:        record.institute_level ?? "",
          estimated_amount_lakhs: record.estimated_amount_lakhs ?? null,
          received_amount_lakhs:  record.received_amount_lakhs ?? null,
          remarks:                record.remarks ?? "",
          status:                 record.status ?? "Pending",
        }
      : emptyForm
  );

  const field = (key: keyof typeof emptyForm, label: string, type = "text") => (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "#6B7280" }}>
        {label}
      </label>
      <input
        type={type}
        value={(form[key] as string | number) ?? ""}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [key]: type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value,
          }))
        }
        className="w-full text-sm border rounded-lg px-3 py-2 outline-none"
        style={{ border: "1px solid #E5E7EB", color: "#111827" }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#E5E7EB" }}>
          <h3 className="font-bold text-base" style={{ color: "#111827" }}>
            {record ? "Edit Consultancy" : "Add New Consultancy"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            {field("project_title", "Project Title *")}
          </div>
          {field("principal_investigator", "Principal Investigator")}
          {field("co_investigators", "Co-Investigators")}
          {field("department", "Department")}
          {field("institute_level", "Institute Level")}
          {field("estimated_amount_lakhs", "Estimated Amount (Lakhs)", "number")}
          {field("received_amount_lakhs", "Received Amount (Lakhs)", "number")}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6B7280" }}>Status</label>
            <select
              value={form.status ?? "Pending"}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-white"
              style={{ border: "1px solid #E5E7EB", color: "#111827" }}
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium mb-1" style={{ color: "#6B7280" }}>Remarks</label>
            <textarea
              rows={2}
              value={form.remarks ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
              className="w-full text-sm border rounded-lg px-3 py-2 outline-none resize-none"
              style={{ border: "1px solid #E5E7EB", color: "#111827" }}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t" style={{ borderColor: "#E5E7EB" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border"
            style={{ border: "1px solid #E5E7EB", color: "#374151" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.project_title}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "#2563EB" }}
          >
            {record ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function Consultancy() {
  const qc = useQueryClient();

  const [search, setSearch]     = useState("");
  const [deptFilter, setDept]   = useState("");
  const [statusFilter, setStat] = useState("");
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState<{ open: boolean; record?: ConsultancyRecord | null }>({ open: false });
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: listResp, isLoading } = useQuery({
    queryKey: ["consultancy-list", search, deptFilter, statusFilter, page],
    queryFn: () =>
      consultancyApi.getAll({ search, department: deptFilter, status: statusFilter, page, limit: PAGE_SIZE }),
  });

  const records = listResp?.data ?? [];
  const total   = listResp?.pagination.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Derive unique departments from loaded data for the filter dropdown
  const { data: allResp } = useQuery({
    queryKey: ["consultancy-all"],
    queryFn: () => consultancyApi.getAll({ limit: 500 }),
  });
  const departments = useMemo(() => {
    const s = new Set<string>();
    (allResp?.data ?? []).forEach((r) => { if (r.department) s.add(r.department); });
    return [...s].sort();
  }, [allResp]);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["consultancy-list"] });
    qc.invalidateQueries({ queryKey: ["consultancy-metrics"] });
    qc.invalidateQueries({ queryKey: ["consultancy-all"] });
  }, [qc]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<ConsultancyRecord, "id" | "created_at">) => consultancyApi.create(data),
    onSuccess: () => { invalidate(); setModal({ open: false }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ConsultancyRecord> }) =>
      consultancyApi.update(id, data),
    onSuccess: () => { invalidate(); setModal({ open: false }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => consultancyApi.delete(id),
    onSuccess: () => { invalidate(); setDeleteId(null); },
  });

  const handleSave = (data: Omit<ConsultancyRecord, "id" | "created_at">) => {
    if (modal.record) {
      updateMutation.mutate({ id: modal.record.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>Consultancy</h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            Manage ongoing consultancy projects
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, record: null })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "#2563EB" }}
        >
          <Plus size={15} />
          Add New Consultancy
        </button>
      </div>

      {/* Metrics */}
      <MetricsSection />

      {/* Table Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
      >
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
            <input
              type="text"
              placeholder="Search by title, PI or department…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 text-sm border rounded-lg outline-none"
              style={{ border: "1px solid #E5E7EB", color: "#111827" }}
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => { setDept(e.target.value); setPage(1); }}
            className="text-sm border rounded-lg px-3 py-2 outline-none bg-white"
            style={{ border: "1px solid #E5E7EB", color: "#374151" }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStat(e.target.value); setPage(1); }}
            className="text-sm border rounded-lg px-3 py-2 outline-none bg-white"
            style={{ border: "1px solid #E5E7EB", color: "#374151" }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB" }}>
                {["Project Title", "Principal Investigator", "Department", "Estimated (L)", "Received (L)", "Status", "Created At", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                    style={{ color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(8)].map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse" style={{ backgroundColor: "#E5E7EB" }} />
                      </td>
                    ))}
                  </tr>
                ))}
              {!isLoading && records.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12" style={{ color: "#6B7280" }}>
                    No consultancy records found.
                  </td>
                </tr>
              )}
              {!isLoading &&
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-gray-50"
                    style={{ borderBottom: "1px solid #F3F4F6" }}
                  >
                    <td className="px-4 py-3 font-medium max-w-xs" style={{ color: "#111827" }}>
                      <span className="line-clamp-2">{r.project_title}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#374151" }}>
                      {r.principal_investigator || "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#374151" }}>
                      {r.department || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: "#374151" }}>
                      {r.estimated_amount_lakhs != null ? `₹${Number(r.estimated_amount_lakhs).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium" style={{ color: "#374151" }}>
                      {r.received_amount_lakhs != null ? `₹${Number(r.received_amount_lakhs).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3" style={{ color: "#6B7280" }}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ open: true, record: r })}
                          className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"
                          style={{ color: "#2563EB" }}
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                          style={{ color: "#EF4444" }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t"
          style={{ borderColor: "#E5E7EB" }}
        >
          <span className="text-sm" style={{ color: "#6B7280" }}>
            {total} record{total !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border disabled:opacity-40"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: page === p ? "#2563EB" : "#FFFFFF",
                    color: page === p ? "#FFFFFF" : "#374151",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border disabled:opacity-40"
              style={{ border: "1px solid #E5E7EB" }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal.open && (
        <ConsultancyModal
          record={modal.record}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full p-2" style={{ backgroundColor: "#FEE2E2" }}>
                <Trash2 size={20} style={{ color: "#EF4444" }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: "#111827" }}>Delete Record</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ border: "1px solid #E5E7EB", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: "#EF4444" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
