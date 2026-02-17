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
  ExternalLink,
  User,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

type TabKey = "all" | "journals";

export default function Publications() {
  const [search, setSearch] = useState("");
  const [sortYear, setSortYear] = useState("desc");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<string[]>([]);
  const [filterPubType, setFilterPubType] = useState<string[]>([]);
  const [filterScope, setFilterScope] = useState<string[]>([]);
  const [filterIndexing, setFilterIndexing] = useState<string[]>([]);

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

  const stats = useMemo(() => {
    if (!publications) return { total: 0, journals: 0, conferences: 0, international: 0, national: 0, indexed: 0, yearRange: "" };
    const yrs = publications.map((p: any) => p.year).filter(Boolean);
    const minY = yrs.length ? Math.min(...yrs) : 0;
    const maxY = yrs.length ? Math.max(...yrs) : 0;
    return {
      total: publications.length,
      journals: publications.filter((p: any) => p.journal).length,
      conferences: publications.filter((p: any) => p.conference && !p.journal).length,
      international: publications.filter((p: any) => p.pub_type === "international").length,
      national: publications.filter((p: any) => p.pub_type === "national" || (!p.pub_type && !p.journal?.toLowerCase().includes("international"))).length,
      indexed: publications.filter((p: any) => p.indexing && p.indexing.length > 0).length,
      yearRange: minY && maxY ? `${minY} - ${maxY}` : "",
    };
  }, [publications]);

  const years = useMemo(() => {
    if (!publications) return [];
    return [...new Set(publications.map((p: any) => p.year))].sort((a, b) => b - a);
  }, [publications]);

  const allIndexTypes = useMemo(() => {
    if (!publications) return [];
    const s = new Set<string>();
    publications.forEach((p: any) => p.indexing?.forEach((i: string) => s.add(i)));
    return [...s].sort();
  }, [publications]);

  const filtered = useMemo(() => {
    if (!publications) return [];
    let result = [...publications];

    if (activeTab === "journals") result = result.filter((p: any) => p.journal);

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(s) ||
          p.authors?.toLowerCase().includes(s) ||
          p.faculty?.name?.toLowerCase().includes(s) ||
          p.journal?.toLowerCase().includes(s) ||
          p.conference?.toLowerCase().includes(s)
      );
    }

    if (filterYears.length > 0) result = result.filter((p: any) => filterYears.includes(p.year));
    if (filterDepartments.length > 0) result = result.filter((p: any) => filterDepartments.includes(p.faculty?.department_id));
    if (filterPubType.length > 0) {
      result = result.filter((p: any) => {
        if (filterPubType.includes("journal") && p.journal) return true;
        if (filterPubType.includes("conference") && p.conference && !p.journal) return true;
        return false;
      });
    }
    if (filterScope.length > 0) result = result.filter((p: any) => filterScope.includes(p.pub_type));
    if (filterIndexing.length > 0) result = result.filter((p: any) => p.indexing?.some((i: string) => filterIndexing.includes(i)));

    result.sort((a: any, b: any) => sortYear === "desc" ? b.year - a.year : a.year - b.year);
    return result;
  }, [publications, activeTab, search, filterYears, filterDepartments, filterPubType, filterScope, filterIndexing, sortYear]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleFilter = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) => {
    setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterYears([]);
    setFilterDepartments([]);
    setFilterPubType([]);
    setFilterScope([]);
    setFilterIndexing([]);
    setPage(1);
  };

  const activeFilterCount = filterYears.length + filterDepartments.length + filterPubType.length + filterScope.length + filterIndexing.length;

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages: number[] = [];
    for (let i = 1; i <= Math.min(totalPages, 7); i++) pages.push(i);

    return (
      <div className="flex items-center justify-center gap-1 py-4">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        {pages.map((p) => (
          <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
            {p}
          </Button>
        ))}
        {totalPages > 7 && <span className="px-2 text-muted-foreground">...</span>}
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary rounded-xl px-6 py-6 text-primary-foreground">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide uppercase">Publications</h1>
        <div className="w-12 h-1 bg-primary-foreground/60 mt-2 rounded" />
        <p className="text-primary-foreground/80 mt-2 text-sm">Research Output of the Institution</p>
      </div>

      {/* Search & Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by Title / Faculty / Journal..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1 text-xs">{activeFilterCount}</Badge>}
        </Button>
        <Select value={sortYear} onValueChange={setSortYear}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Year: Newest</SelectItem>
            <SelectItem value="asc">Year: Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats / Tab Bar */}
      <div className="flex flex-wrap items-center gap-4 border-b pb-3">
        <button onClick={() => { setActiveTab("all"); setPage(1); }} className={cn("flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors", activeTab === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")}>
          <span className={cn("w-2 h-2 rounded-full", activeTab === "all" ? "bg-primary-foreground" : "bg-muted-foreground")} />
          All
        </button>
        <button onClick={() => { setActiveTab("journals"); setPage(1); }} className={cn("flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors", activeTab === "journals" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent")}>
          Journals
        </button>
        <div className="hidden sm:flex items-center gap-4 ml-auto text-xs text-muted-foreground">
          {stats.yearRange && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{stats.yearRange}</span>}
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{stats.indexed} Indexed</span>
          <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{stats.international} International</span>
          <span className="flex items-center gap-1"><Flag className="h-3.5 w-3.5" />{stats.national} National</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {isLoading && <div className="text-center py-16 text-muted-foreground">Loading publications...</div>}
          {!isLoading && paginated.length === 0 && <div className="text-center py-16 text-muted-foreground">No publications found</div>}

          {/* All tab — Card layout */}
          {activeTab === "all" && !isLoading && paginated.length > 0 && (
            <div className="space-y-4">
              {paginated.map((pub: any, idx: number) => (
                <Card key={pub.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground leading-snug">
                          <span className="text-muted-foreground mr-2">{(page - 1) * ITEMS_PER_PAGE + idx + 1}.</span>
                          {pub.title}
                        </p>
                      </div>
                      <Button asChild size="sm" variant="default" className="shrink-0 gap-1 text-xs">
                        <Link to={`/publications/${pub.id}`}><Eye className="h-3 w-3" /> View Details</Link>
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Faculty</span>
                        <p className="font-medium">{pub.faculty?.name ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Authors</span>
                        <p className="font-medium">{pub.authors ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">{pub.journal ? "Journal" : "Conference"}</span>
                        <p className="font-medium">{pub.journal || pub.conference || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Publisher</span>
                        <p className="font-medium">{pub.publisher ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Type</span>
                        <p className="font-medium capitalize">{pub.pub_type ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Year</span>
                        <p className="font-medium">{pub.year}</p>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 mt-3">
                      {pub.indexing?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                      {pub.doi && (
                        <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline ml-auto">
                          <ExternalLink className="h-3 w-3" /> Open DOI
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {renderPagination()}
            </div>
          )}

          {/* Journals tab — Table layout */}
          {activeTab === "journals" && !isLoading && paginated.length > 0 && (
            <div>
              <div className="bg-primary/10 px-4 py-2 rounded-t-lg">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Journal Publications</h2>
              </div>
              <Card className="rounded-t-none">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">S.No</TableHead>
                        <TableHead>Faculty Name</TableHead>
                        <TableHead className="hidden md:table-cell">Author(s)</TableHead>
                        <TableHead>Title / Journal</TableHead>
                        <TableHead className="hidden sm:table-cell">Year</TableHead>
                        <TableHead className="hidden lg:table-cell">Indexing</TableHead>
                        <TableHead className="w-28">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((pub: any, idx: number) => (
                        <TableRow key={pub.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="text-muted-foreground text-sm">{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                          <TableCell>
                            <p className="font-medium text-sm">{pub.faculty?.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{(pub.faculty as any)?.departments?.name ?? ""}</p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm">{pub.authors ?? "—"}</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="font-semibold text-sm line-clamp-2">{pub.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{pub.journal}</p>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{pub.year}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {pub.indexing?.map((k: string) => (
                                <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button asChild size="sm" variant="default" className="gap-1 text-xs">
                              <Link to={`/publications/${pub.id}`}><Eye className="h-3 w-3" /> View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
              {renderPagination()}
            </div>
          )}
        </div>

        {/* Side Filter Panel */}
        {showFilters && (
          <div className="hidden md:block w-64 shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-4 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Filters</h3>
                  <button onClick={() => setShowFilters(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>

                {/* Publication Type */}
                <FilterSection title="Publication Type">
                  {[{ key: "journal", label: "Journal" }, { key: "conference", label: "Conference" }].map((t) => (
                    <label key={t.key} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={filterPubType.includes(t.key)} onCheckedChange={() => toggleFilter(setFilterPubType, t.key)} />
                      {t.label}
                    </label>
                  ))}
                </FilterSection>

                {/* Year */}
                <FilterSection title="Year">
                  <div className="max-h-36 overflow-y-auto space-y-1.5">
                    {years.map((y) => (
                      <label key={y} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={filterYears.includes(y)} onCheckedChange={() => toggleFilter(setFilterYears, y)} />
                        {y}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Department */}
                <FilterSection title="Department">
                  <div className="max-h-36 overflow-y-auto space-y-1.5">
                    {departments?.map((d: any) => (
                      <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={filterDepartments.includes(d.id)} onCheckedChange={() => toggleFilter(setFilterDepartments, d.id)} />
                        {d.code || d.name}
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Scope */}
                <FilterSection title="National / International">
                  {["national", "international"].map((s) => (
                    <label key={s} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                      <Checkbox checked={filterScope.includes(s)} onCheckedChange={() => toggleFilter(setFilterScope, s)} />
                      {s}
                    </label>
                  ))}
                </FilterSection>

                {/* Indexing */}
                {allIndexTypes.length > 0 && (
                  <FilterSection title="Indexing">
                    {allIndexTypes.map((idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Checkbox checked={filterIndexing.includes(idx)} onCheckedChange={() => toggleFilter(setFilterIndexing, idx)} />
                        {idx}
                      </label>
                    ))}
                  </FilterSection>
                )}

                <div className="pt-2 space-y-2">
                  <Button className="w-full" size="sm" onClick={() => setShowFilters(false)}>Apply Filters</Button>
                  <button className="text-xs text-primary hover:underline w-full text-center" onClick={clearFilters}>Clear Filters</button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
