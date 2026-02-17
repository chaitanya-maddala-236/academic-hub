import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Faculty() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");

  const { data: facultyData, isLoading } = useQuery({
    queryKey: ["faculty-list"],
    queryFn: async () => {
      const response = await api.get<any>("/faculty?page=1&limit=1000", false);
      return response.data ?? [];
    },
  });

  // Extract unique departments from faculty
  const departments = useMemo(() => {
    if (!facultyData) return [];
    const deptSet = new Set<string>();
    facultyData.forEach((f: any) => {
      if (f.department) deptSet.add(f.department);
    });
    return Array.from(deptSet).sort();
  }, [facultyData]);

  // Filter faculty on client side
  const facultyList = useMemo(() => {
    if (!facultyData) return [];
    let result = [...facultyData];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((f: any) =>
        f.name?.toLowerCase().includes(s) ||
        f.designation?.toLowerCase().includes(s) ||
        f.specialization?.toLowerCase().includes(s)
      );
    }

    if (department !== "all") {
      result = result.filter((f: any) => f.department === department);
    }

    return result;
  }, [facultyData, search, department]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Faculty Directory</h1>
        <p className="text-muted-foreground mt-1">Browse faculty profiles and expertise</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search faculty..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && facultyList.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No faculty found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {facultyList.map((f: any) => (
          <Link key={f.id} to={`/faculty/${f.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={f.profile_image ?? undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {f.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{f.name}</p>
                  <p className="text-sm text-muted-foreground">{f.designation ?? "Faculty"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.department}</p>
                  {f.specialization && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">{f.specialization}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
