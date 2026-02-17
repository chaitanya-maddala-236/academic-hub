import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

export default function PublicationDetail() {
  const { id } = useParams();

  const { data: pub, isLoading } = useQuery({
    queryKey: ["publication", id],
    queryFn: async () => {
      const response = await api.get<any>(`/publications/${id}`, false);
      return response.data;
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
          {pub.journal_name && <Badge>{pub.journal_name}</Badge>}
          {pub.conference_name && <Badge variant="secondary">{pub.conference_name}</Badge>}
          {pub.indexing && <Badge variant="outline" className="text-xs">{pub.indexing}</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pub.authors && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Authors</p>
                <p className="text-muted-foreground">{pub.authors}</p>
              </div>
            )}
            {pub.abstract && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Abstract</p>
                <p className="text-muted-foreground leading-relaxed">{pub.abstract}</p>
              </div>
            )}
            {!pub.abstract && <p className="text-muted-foreground">No abstract provided.</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{pub.national_international || "—"}</p>
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
        {pub.doi && (
          <Button variant="outline" asChild>
            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View DOI
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
