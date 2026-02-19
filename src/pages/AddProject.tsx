import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AddProject() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    principal_investigator: "",
    co_principal_investigator: "",
    department: "",
    funding_agency: "",
    agency_scientist: "",
    file_number: "",
    sanctioned_amount: "",
    start_date: "",
    end_date: "",
    objectives: "",
    deliverables: "",
    outcomes: "",
    team: "",
  });

  if (!hasRole("admin")) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">Access denied. Admin role required.</p>
        <Link to="/projects" className="text-primary hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await api.post("/projects", {
        ...form,
        sanctioned_amount: form.sanctioned_amount ? parseFloat(form.sanctioned_amount) : null,
      });
      toast({ title: "Project created", description: "The project was added successfully." });
      navigate("/projects");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to create project.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Projects
      </Link>

      <div className="flex items-center gap-3">
        <PlusCircle className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold">Add Project</h1>
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
                <Label htmlFor="principal_investigator">Principal Investigator</Label>
                <Input id="principal_investigator" name="principal_investigator" value={form.principal_investigator} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="co_principal_investigator">Co-PI</Label>
                <Input id="co_principal_investigator" name="co_principal_investigator" value={form.co_principal_investigator} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="department">Department</Label>
                <Input id="department" name="department" value={form.department} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="funding_agency">Funding Agency</Label>
                <Input id="funding_agency" name="funding_agency" value={form.funding_agency} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="agency_scientist">Agency Scientist</Label>
                <Input id="agency_scientist" name="agency_scientist" value={form.agency_scientist} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="file_number">File Number</Label>
                <Input id="file_number" name="file_number" value={form.file_number} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sanctioned_amount">Sanctioned Amount (₹)</Label>
                <Input id="sanctioned_amount" name="sanctioned_amount" type="number" value={form.sanctioned_amount} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" name="start_date" type="date" value={form.start_date} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="objectives">Objectives</Label>
              <Textarea id="objectives" name="objectives" value={form.objectives} onChange={handleChange} rows={3} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="deliverables">Deliverables</Label>
              <Textarea id="deliverables" name="deliverables" value={form.deliverables} onChange={handleChange} rows={3} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="outcomes">Outcomes</Label>
              <Textarea id="outcomes" name="outcomes" value={form.outcomes} onChange={handleChange} rows={3} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="team">Team Members</Label>
              <Textarea id="team" name="team" value={form.team} onChange={handleChange} rows={2} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Add Project"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/projects")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
