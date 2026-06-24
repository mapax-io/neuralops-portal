import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <Link to="/" className="mb-10 flex items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-semibold">N</span>
        </div>
        <span className="text-foreground font-semibold tracking-tight">NeuralOps</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-foreground-muted">{subtitle}</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-foreground-muted">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
