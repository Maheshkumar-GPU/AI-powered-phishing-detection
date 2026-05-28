import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useHealthCheck } from "@/lib/api-client";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { error } = useHealthCheck();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {error && (
          <div className="bg-amber-500/20 text-amber-500 text-xs font-medium px-4 py-2 border-b border-amber-500/20 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-ping" />
            Backend API offline — Running in local demo mode. Start your FastAPI server at localhost:8000
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
