import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  BookOpen,
  Globe,
  Flag,
  Eye,
  ExternalLink,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 10;
type TabKey = "all" | "journals" | "conferences" | "bookchapters";

const DEPT_OPTIONS = ["CSE", "ECE", "EEE", "ME", "IT", "CE", "H&S"];
const INDEXING_OPTIONS = ["SCI", "Scopus", "WoS", "UGC"];

export default function Publications() {
  const [search, setSearch] = useState("");
  const [sortYear, setSortYear] = useState("desc");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);

  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<string[]>([]);
  const [filterPubType, setFilterPubType] = useState<string[]>([]);
  const [filterIndexing, setFilterIndexing] = useState<string[]>([]);

  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications"],
    queryFn: async () => {
      const response = await api.get<any>("/publications?page=1&limit=1000", false);
      const pubs = response.data ?? [];
      return pubs.map((pub: any) => ({
        ...pub,
        authors: pub.authors || "—",
        journal: pub.publication_type === "journal" ? pub.journal_name : null,
        conference: pub.publication_type === "conference" ? pub.journal_name : null,
        bookchapter: pub.publication_type === "bookchapter" ? pub.journal_name : null,
        publisher: pub.publisher || "—",
        doi: pub.doi || null,
        indexing: pub.indexing ? [pub.indexing] : [],
        pub_type: pub.national_international || "national",
        faculty: {
          name: pub.faculty_name || "—",
          department: pub.department || "—",
        },
      }));
    },
  });

  const years = useMemo(() => {
    if (!publications) return [];
    return [...new Set(publications.map((p: any) => p.year))].filter(Boolean).sort((a, b) => b - a);
  }, [publications]);

  const stats = useMemo(() => {
    if (!publications) return { total: 0, journals: 0, conferences: 0, bookchapters: 0, international: 0, national: 0, indexed: 0 };
    return {
      total: publications.length,
      journals: publications.filter((p: any) => p.journal).length,
      conferences: publications.filter((p: any) => p.conference).length,
      bookchapters: publications.filter((p: any) => p.bookchapter).length,
      international: publications.filter((p: any) => p.pub_type === "international").length,
      national: publications.filter((p: any) => p.pub_type === "national").length,
      indexed: publications.filter((p: any) => p.indexing && p.indexing.length > 0).length,
    };
  }, [publications]);

  const filtered = useMemo(() => {
    if (!publications) return [];
    let result = [...publications];

    if (activeTab === "journals") result = result.filter((p: any) => p.journal);
    if (activeTab === "conferences") result = result.filter((p: any) => p.conference);
    if (activeTab === "bookchapters") result = result.filter((p: any) => p.bookchapter);

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(s) ||
          p.authors?.toLowerCase().includes(s) ||
          p.faculty?.name?.toLowerCase().includes(s) ||
          p.journal?.toLowerCase().includes(s) ||
          p.conference?.toLowerCase().includes(s) ||
          p.bookchapter?.toLowerCase().includes(s)
      );
    }

    if (filterYears.length > 0) result = result.filter((p: any) => filterYears.includes(p.year));
    if (filterDepartments.length > 0) result = result.filter((p: any) => filterDepartments.includes(p.faculty?.department));
    if (filterPubType.length > 0) {
      result = result.filter((p: any) => {
        if (filterPubType.includes("journal") && p.journal) return true;
        if (filterPubType.includes("conference") && p.conference) return true;
        if (filterPubType.includes("bookchapter") && p.bookchapter) return true;
        return false;
      });
    }
    if (filterIndexing.length > 0) result = result.filter((p: any) => p.indexing?.some((i: string) => filterIndexing.includes(i)));

    result.sort((a: any, b: any) => sortYear === "desc" ? b.year - a.year : a.year - b.year);
    return result;
  }, [publications, activeTab, search, filterYears, filterDepartments, filterPubType, filterIndexing, sortYear]);

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
    setFilterIndexing([]);
    setPage(1);
  };

  const activeFilterCount = filterYears.length + filterDepartments.length + filterPubType.length + filterIndexing.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-primary rounded-xl px-6 py-5 text-primary-foreground">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide uppercase">Publications</h1>
        <div className="w-12 h-1 bg-primary-foreground/60 mt-2 rounded" />
        <p className="text-primary-foreground/80 mt-1 text-sm">Research Output of the Institution</p>
      </div>

      {/* Tabs + Sort row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="flex items-center gap-1">
          {([
            { key: "all" as TabKey, label: "All", count: stats.total },
            { key: "journals" as TabKey, label: "Journals", count: stats.journals },
            { key: "conferences" as TabKey, label: "Conferences", count: stats.conferences },
            { key: "bookchapters" as TabKey, label: "Book Chapters", count: stats.bookchapters },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setPage(1); }}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
                activeTab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {t.label}
              <span className={cn("text-xs px-1.5 py-0.5 rounded-full", activeTab === t.key ? "bg-primary-foreground/20" : "bg-muted")}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{stats.indexed} Indexed</span>
            <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{stats.international} Intl</span>
            <span className="flex items-center gap-1"><Flag className="h-3.5 w-3.5" />{stats.national} Natl</span>
          </div>
          <Select value={sortYear} onValueChange={setSortYear}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main layout: Left sidebar + right content */}
      <div className="flex gap-6 items-start">
        {/* Left Sidebar Filter Panel */}
        <div className="hidden lg:block w-60 shrink-0 sticky top-4">
          <div className="rounded-2xl border shadow-sm bg-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                  Clear ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="p-4 space-y-5">
              {/* Search */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Search</p>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Title / Faculty..."
                    className="pl-7 h-8 text-xs"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              {/* Type */}
              <SidebarSection title="Type">
                {[{ key: "journal", label: "Journal" }, { key: "conference", label: "Conference" }, { key: "bookchapter", label: "Book Chapter" }].map((t) => (
                  <label key={t.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={filterPubType.includes(t.key)} onCheckedChange={() => toggleFilter(setFilterPubType, t.key)} />
                    {t.label}
                  </label>
                ))}
              </SidebarSection>

              {/* Department */}
              <SidebarSection title="Department">
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {DEPT_OPTIONS.map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={filterDepartments.includes(d)} onCheckedChange={() => toggleFilter(setFilterDepartments, d)} />
                      {d}
                    </label>
                  ))}
                </div>
              </SidebarSection>

              {/* Year */}
              <SidebarSection title="Year">
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {years.map((y) => (
                    <label key={y} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={filterYears.includes(y)} onCheckedChange={() => toggleFilter(setFilterYears, y)} />
                      {y}
                    </label>
                  ))}
                </div>
              </SidebarSection>

              {/* Indexing */}
              <SidebarSection title="Indexing">
                {INDEXING_OPTIONS.map((idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={filterIndexing.includes(idx)} onCheckedChange={() => toggleFilter(setFilterIndexing, idx)} />
                    {idx}
                  </label>
                ))}
              </SidebarSection>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl animate-pulse bg-muted" />
              ))}
            </div>
          )}
          {!isLoading && paginated.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">No publications found</div>
          )}

          <AnimatePresence mode="wait">
            {!isLoading && paginated.length > 0 && (
              <motion.div
                key={`${activeTab}-${page}-${search}-${sortYear}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {paginated.map((pub: any, idx: number) => (
                  <PublicationItem
                    key={pub.id}
                    pub={pub}
                    index={(page - 1) * ITEMS_PER_PAGE + idx + 1}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={page === p ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              {totalPages > 7 && <span className="px-2 text-muted-foreground">...</span>}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicationItem({ pub, index }: { pub: any; index: number }) {
  return (
    <div className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start gap-4">
        <span className="text-muted-foreground text-sm font-medium w-6 shrink-0">{index}.</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-snug text-foreground">{pub.title}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 mt-3 text-xs">
            <div>
              <span className="text-muted-foreground">Faculty</span>
              <p className="font-medium text-foreground">{pub.faculty?.name ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Authors</span>
              <p className="font-medium text-foreground line-clamp-1">{pub.authors ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{pub.journal ? "Journal" : pub.conference ? "Conference" : "Book Chapter"}</span>
              <p className="font-medium text-foreground line-clamp-1">{pub.journal || pub.conference || pub.bookchapter || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Department</span>
              <p className="font-medium text-foreground">{pub.faculty?.department ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Type</span>
              <p className="font-medium text-foreground capitalize">{pub.pub_type ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Year</span>
              <p className="font-medium text-foreground">{pub.year ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 mt-3">
            {pub.indexing?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {pub.doi && (
              <a
                href={`https://doi.org/${pub.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" /> DOI
              </a>
            )}
          </div>
        </div>

        <Button asChild size="sm" variant="default" className="shrink-0 gap-1 text-xs">
          <Link to={`/publications/${pub.id}`}><Eye className="h-3 w-3" /> View Details</Link>
        </Button>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
