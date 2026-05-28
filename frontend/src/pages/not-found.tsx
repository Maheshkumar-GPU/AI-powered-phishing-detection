import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
      <div className="relative mb-8">
        <Terminal className="w-24 h-24 text-primary opacity-20" />
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold font-mono text-primary">
          404
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2 tracking-tight">Sector Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md font-mono text-sm">
        [ERROR] The requested directory does not exist in the current mainframe index.
      </p>
      <Link href="/">
        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
