import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="outline" className="border-primary/50 hover:bg-primary/10 text-primary">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
