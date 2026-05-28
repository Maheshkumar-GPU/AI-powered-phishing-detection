import { AppLayout } from "@/components/layout/AppLayout";
import { Switch, Route } from "wouter";
import { Dashboard } from "@/pages/dashboard";
import { Scanner } from "@/pages/scanner";
import { Chatbot } from "@/pages/chatbot";
import { History } from "@/pages/history";
import { Reports } from "@/pages/reports";
import { Analytics } from "@/pages/analytics";
import NotFound from "@/pages/not-found";

export function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/scanner" component={Scanner} />
        <Route path="/chatbot" component={Chatbot} />
        <Route path="/history" component={History} />
        <Route path="/reports" component={Reports} />
        <Route path="/analytics" component={Analytics} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}
