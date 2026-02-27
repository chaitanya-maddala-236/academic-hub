import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    principalInvestigator: "",
    coPrincipalInvestigator: "",
    department: "",
    fundingAgency: "",
    startDate: "",
    sanctionedAmount: "",
    duration: "",
    status: "ONGOING",
  });

  const { data: resp, isLoading } = useQuery({
    queryKey: ["v1-project-edit", id],
    queryFn: () => axiosInstance.get<unknown, { success: boolean; data: any }>(`/v1/projects/${id}`),
    enabled: !!id,
  });

  const project = resp?.data;

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title ?? "",
        principalInvestigator: project.principalInvestigator ?? "",
        coPrincipalInvestigator: project.coPrincipalInvestigator ?? "",
        department: project.department ?? "",
        fundingAgency: project.fundingAgency ?? "",
        startDate: project.startDate ? new Date(project.startDate).toISOString().substring(0, 10) : "",
        sanctionedAmount: project.sanctionedAmount != null ? String(project.sanctionedAmount) : "",
        duration: project.duration ?? "",
        status: project.status ? project.status.toUpperCase() : "ONGOING",
      });
    }
  }, [project]);

  if (!hasRole("admin") && !hasRole("faculty")) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">Access denied. Admin or Faculty role required.</p>
        <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;
  if (!project) return <div className="text-muted-foreground">Project not found.</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Validation error", description: "Title is required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await axiosInstance.put(`/v1/projects/${id}`, {
        title: form.title,
        principalInvestigator: form.principalInvestigator || null,
        coPrincipalInvestigator: form.coPrincipalInvestigator || null,
        department: form.department || null,
        fundingAgency: form.fundingAgency || null,
        startDate: form.startDate || null,
        sanctionedAmount: form.sanctionedAmount ? parseFloat(form.sanctionedAmount) : null,
        duration: form.duration || null,
        status: form.status,
      });
      queryClient.invalidateQueries({ queryKey: ["v1-project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["v1-dashboard"] });
      toast({ title: "Project updated", description: "Changes saved successfully." });
      navigate(`/projects/${id}`);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update project.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link to={`/projects/${id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Project
      </Link>

      <div className="flex items-center gap-3">
        <Pencil className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Edit Project</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="principalInvestigator">Principal Investigator</Label>
                <Input id="principalInvestigator" name="principalInvestigator" value={form.principalInvestigator} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="coPrincipalInvestigator">Co-PI</Label>
                <Input id="coPrincipalInvestigator" name="coPrincipalInvestigator" value={form.coPrincipalInvestigator} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={form.department} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fundingAgency">Funding Agency</Label>
                <Input id="fundingAgency" name="fundingAgency" value={form.fundingAgency} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sanctionedAmount">Sanctioned Amount (Lakhs ₹)</Label>
                <Input id="sanctionedAmount" name="sanctionedAmount" type="number" step="0.01" value={form.sanctionedAmount} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="startDate">Sanction Date</Label>
                <Input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" placeholder="e.g. 2 years" value={form.duration} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status" name="status" value={form.status} onChange={handleChange}
                  className="w-full px-3 py-2 rounded-md border text-sm"
                >
                  <option value="ONGOING">Ongoing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/projects/${id}`)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

