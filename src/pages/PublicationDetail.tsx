import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

export default function PublicationDetail() {
  const { id } = useParams();

  const { data: pub, isLoading } = useQuery({
    queryKey: ["publication", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("publications")
        .select("*, faculty(name)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>;
  if (!pub) return <div className="text-muted-foreground">Publication not found</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/publications" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Publications
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{pub.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{pub.year}</Badge>
          {pub.journal && <Badge>{pub.journal}</Badge>}
          {pub.conference && <Badge variant="secondary">{pub.conference}</Badge>}
          {pub.keywords?.map((k: string) => (
            <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Abstract</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{pub.abstract || "No abstract provided."}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Faculty</p>
            <p className="font-medium">{(pub as any).faculty?.name ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">DOI</p>
            <p className="font-medium">{pub.doi || "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        {pub.pdf_url && (
          <Button asChild>
            <a href={pub.pdf_url} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </a>
          </Button>
        )}
        {pub.scholar_url && (
          <Button variant="outline" asChild>
            <a href={pub.scholar_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Google Scholar
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
