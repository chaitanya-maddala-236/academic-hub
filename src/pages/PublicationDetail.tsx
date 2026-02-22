import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, BookOpen, User, Calendar, Tag, Building } from "lucide-react";
import { motion } from "framer-motion";

const pageVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

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

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!pub) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-muted-foreground text-lg">Publication not found</p>
        <Link to="/publications" className="mt-4 inline-flex items-center gap-1 text-primary hover:underline text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Publications
        </Link>
      </div>
    );
  }

  const indexingTags: string[] = pub.indexing ? (Array.isArray(pub.indexing) ? pub.indexing : [pub.indexing]) : [];

  return (
    <motion.div
      className="max-w-3xl mx-auto space-y-6"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">Research</Link>
        <span>/</span>
        <Link to="/publications" className="hover:text-foreground transition-colors">Publications</Link>
        <span>/</span>
        <span className="text-foreground font-medium line-clamp-1 max-w-xs">
          {pub.title?.length > 50 ? `${pub.title.slice(0, 50)}…` : pub.title ?? "Detail"}
        </span>
      </nav>

      {/* Back link */}
      <Link
        to="/publications"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Publications
      </Link>

      {/* Title Card */}
      <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold leading-snug text-foreground">{pub.title}</h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {pub.year && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {pub.year}
              </Badge>
            )}
            {pub.journal_name && (
              <Badge className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> {pub.journal_name}
              </Badge>
            )}
            {pub.publication_type && (
              <Badge variant="secondary" className="capitalize">{pub.publication_type}</Badge>
            )}
            {indexingTags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs font-semibold text-blue-700 border-blue-200 bg-blue-50">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {pub.faculty_name && (
            <MetaField icon={User} label="Faculty" value={pub.faculty_name} />
          )}
          {pub.department && (
            <MetaField icon={Building} label="Department" value={pub.department} />
          )}
          {pub.authors && (
            <MetaField icon={User} label="Authors" value={pub.authors} />
          )}
          {pub.national_international && (
            <MetaField icon={Tag} label="Type" value={pub.national_international} />
          )}
          {pub.doi && (
            <MetaField icon={ExternalLink} label="DOI" value={pub.doi} />
          )}
        </div>
      </div>

      {/* Abstract */}
      <div className="rounded-2xl border bg-card shadow-sm p-6">
        <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Abstract
        </h2>
        {pub.abstract ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{pub.abstract}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No abstract provided.</p>
        )}
      </div>

      {/* Actions */}
      {pub.doi && (
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> View DOI
            </a>
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function MetaField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground capitalize">{value}</p>
      </div>
    </div>
  );
}
