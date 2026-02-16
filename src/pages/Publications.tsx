import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  BookOpen,
  FileText,
  Globe,
  Flag,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function Publications() {
  const [search, setSearch] = useState("");
  const [sortYear, setSortYear] = useState("desc");
  const [activeTab, setActiveTab] = useState<"all" | "journal" | "conference">("all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Side filter state
  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [filterDepartment, setFilterDepartment] = useState("all");

  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("publications")
        .select("*, faculty(name, department_id, departments:department_id(name))")
        .eq("status", "approved");
      return data ?? [];
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*");
      return data ?? [];
    },
  });

  // Compute stats
  const stats = useMemo(() => {
    if (!publications) return { total: 0, journals: 0, conferences: 0, international: 0, national: 0 };
    return {
      total: publications.length,
      journals: publications.filter((p: any) => p.journal).length,
      conferences: publications.filter((p: any) => p.conference).length,
      international: publications.filter((p: any) =>
        p.journal?.toLowerCase().includes("international") ||
        p.conference?.toLowerCase().includes("international")
      ).length,
      national: publications.filter((p: any) =>
        p.journal?.toLowerCase().includes("national") ||
        p.conference?.toLowerCase().includes("national") ||
        (!p.journal?.toLowerCase().includes("international") && !p.conference?.toLowerCase().includes("international"))
      ).length,
    };
  }, [publications]);

  // Available years
  const years = useMemo(() => {
    if (!publications) return [];
    const yrs = [...new Set(publications.map((p: any) => p.year))].sort((a, b) => b - a);
    return yrs;
  }, [publications]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    if (!publications) return [];
    let result = [...publications];

    // Tab filter
    if (activeTab === "journal") result = result.filter((p: any) => p.journal);
    if (activeTab === "conference") result = result.filter((p: any) => p.conference && !p.journal);

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(s) ||
          p.abstract?.toLowerCase().includes(s) ||
          p.faculty?.name?.toLowerCase().includes(s) ||
          p.keywords?.some((k: string) => k.toLowerCase().includes(s))
      );
    }

    // Year filter
    if (filterYears.length > 0) {
      result = result.filter((p: any) => filterYears.includes(p.year));
    }

    // Department filter
    if (filterDepartment !== "all") {
      result = result.filter((p: any) => p.faculty?.department_id === filterDepartment);
    }

    // Sort
    result.sort((a: any, b: any) =>
      sortYear === "desc" ? b.year - a.year : a.year - b.year
    );

    return result;
  }, [publications, activeTab, search, filterYears, filterDepartment, sortYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleYear = (y: number) => {
    setFilterYears((prev) =>
      prev.includes(y) ? prev.filter((v) => v !== y) : [...prev, y]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setFilterYears([]);
    setFilterDepartment("all");
    setPage(1);
  };

  const statCards = [
    { label: "Total Publications", value: stats.total, icon: BookOpen, color: "text-primary" },
    { label: "Journal Publications", value: stats.journals, icon: FileText, color: "text-emerald-600" },
    { label: "Conference Publications", value: stats.conferences, icon: BookOpen, color: "text-amber-600" },
    { label: "International", value: stats.international, icon: Globe, color: "text-violet-600" },
    { label: "National", value: stats.national, icon: Flag, color: "text-rose-600" },
  ];

  const tabs = [
    { key: "all" as const, label: "All" },
    { key: "journal" as const, label: "Journals" },
    { key: "conference" as const, label: "Conferences" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl px-6 py-5 text-primary-foreground">
        <h1 className="text-2xl md:text-3xl font-bold">Research & Publications</h1>
        <p className="text-primary-foreground/80 mt-1 text-sm">
          Research Output of the Institution
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="hover:shadow-md transition-shadow cursor-default group"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg bg-muted", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search, Filter, Sort, Tabs */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, department..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
          <Select value={sortYear} onValueChange={setSortYear}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Year: Newest</SelectItem>
              <SelectItem value="asc">Year: Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPage(1);
              }}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content with optional side filter */}
      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">S.No</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="hidden md:table-cell">Title</TableHead>
                    <TableHead className="hidden lg:table-cell">Journal / Conference</TableHead>
                    <TableHead className="hidden sm:table-cell">Year</TableHead>
                    <TableHead className="hidden lg:table-cell">Keywords</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Loading publications...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No publications found
                      </TableCell>
                    </TableRow>
                  )}
                  {paginated.map((pub: any, idx: number) => (
                    <TableRow key={pub.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">
                        {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{pub.faculty?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {(pub.faculty as any)?.departments?.name ?? ""}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs">
                        <p className="font-semibold text-sm text-foreground line-clamp-2">
                          {pub.title}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {pub.journal && (
                          <span className="text-xs text-muted-foreground">{pub.journal}</span>
                        )}
                        {pub.conference && (
                          <span className="text-xs text-muted-foreground">{pub.conference}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{pub.year}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {pub.keywords?.slice(0, 2).map((k: string) => (
                            <Badge key={k} variant="secondary" className="text-xs">
                              {k}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" variant="default" className="gap-1 text-xs">
                          <Link to={`/publications/${pub.id}`}>
                            <Eye className="h-3 w-3" />
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 text-xs"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Side Filter Panel */}
        {showFilters && (
          <div className="hidden md:block w-64 shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                {/* Publication Type */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Publication Type
                  </p>
                  <div className="space-y-2">
                    {tabs.map((tab) => (
                      <label key={tab.key} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={activeTab === tab.key}
                          onCheckedChange={() => {
                            setActiveTab(tab.key);
                            setPage(1);
                          }}
                        />
                        {tab.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Year */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Year
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {years.map((y) => (
                      <label key={y} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox
                          checked={filterYears.includes(y)}
                          onCheckedChange={() => toggleYear(y)}
                        />
                        {y}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                    Department
                  </p>
                  <Select value={filterDepartment} onValueChange={(v) => { setFilterDepartment(v); setPage(1); }}>
                    <SelectTrigger className="w-full text-sm">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments?.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    Apply Filters
                  </Button>
                  <button
                    className="text-xs text-primary hover:underline w-full text-center"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
