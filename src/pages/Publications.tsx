import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Publications() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");

  const { data: publications, isLoading } = useQuery({
    queryKey: ["publications", search, year],
    queryFn: async () => {
      let query = supabase
        .from("publications")
        .select("*, faculty(name)")
        .eq("status", "approved")
        .order("year", { ascending: false });

      if (search) query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`);
      if (year !== "all") query = query.eq("year", parseInt(year));

      const { data } = await query;
      return data ?? [];
    },
  });

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Publications</h1>
        <p className="text-muted-foreground mt-1">Browse approved research publications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search publications..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Faculty</TableHead>
              <TableHead className="hidden sm:table-cell">Year</TableHead>
              <TableHead className="hidden lg:table-cell">Journal / Conference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            )}
            {!isLoading && publications?.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No publications found</TableCell></TableRow>
            )}
            {publications?.map((pub: any) => (
              <TableRow key={pub.id}>
                <TableCell>
                  <Link to={`/publications/${pub.id}`} className="font-medium text-primary hover:underline">{pub.title}</Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">{pub.faculty?.name ?? "—"}</TableCell>
                <TableCell className="hidden sm:table-cell">{pub.year}</TableCell>
                <TableCell className="hidden lg:table-cell">
                  {pub.journal && <Badge variant="secondary">{pub.journal}</Badge>}
                  {pub.conference && <Badge variant="outline">{pub.conference}</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
