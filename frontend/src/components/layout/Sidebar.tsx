import { Link, useLocation } from "wouter";
import { LayoutDashboard, Search, MessageSquare, History, FileText, BarChart3, ShieldAlert } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/scanner", label: "Scanner", icon: Search },
    { href: "/chatbot", label: "AI Assistant", icon: MessageSquare },
    { href: "/history", label: "History", icon: History },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="w-64 h-full border-r border-border bg-sidebar flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <ShieldAlert className="w-6 h-6 text-primary mr-3" />
        <span className="font-bold text-lg tracking-tight">
          PhishGuard <span className="text-primary">AI</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <link.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center px-3 py-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          System Online
        </div>
      </div>
    </div>
  );
}
