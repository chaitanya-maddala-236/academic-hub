import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*").order("name");
      return data ?? [];
    },
  });

  const { data: facultyList, isLoading } = useQuery({
    queryKey: ["faculty-list", search, department],
    queryFn: async () => {
      let query = supabase.from("faculty").select("*, departments(name)").order("name");
      if (search) query = query.or(`name.ilike.%${search}%,designation.ilike.%${search}%`);
      if (department !== "all") query = query.eq("department_id", department);
      const { data } = await query;
      return data ?? [];
    },
  });

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
            {departments?.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && facultyList?.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No faculty found</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {facultyList?.map((f: any) => (
          <Link key={f.id} to={`/faculty/${f.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5 flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={f.photo_url ?? undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {f.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{f.name}</p>
                  <p className="text-sm text-muted-foreground">{f.designation ?? "Faculty"}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.departments?.name}</p>
                  {f.expertise && f.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {f.expertise.slice(0, 3).map((e: string) => (
                        <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                      ))}
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
