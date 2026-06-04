import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-fade-in">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground mb-6">
        <Icon className="h-10 w-10 text-muted-foreground/80" />
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 mb-6 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionText && (
        <div>
          {actionHref ? (
            <Button asChild size="lg" className="rounded-full px-8 shadow-sm">
              <Link href={actionHref}>{actionText}</Link>
            </Button>
          ) : (
            <Button onClick={onActionClick} size="lg" className="rounded-full px-8 shadow-sm">
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
