import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function IPAssets() {
  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-xl px-6 py-5 text-primary-foreground">
        <h1 className="text-2xl md:text-3xl font-bold">IP Assets</h1>
        <p className="text-primary-foreground/80 mt-1 text-sm">
          Intellectual Property Management
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground">IP Assets Module</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            This section will manage intellectual property assets. Coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
