import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NeuralOps — Activate your account" },
      { name: "description", content: "Activation and account portal for NeuralOps." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="flex items-center gap-2 mb-10">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-semibold">N</span>
        </div>
        <span className="text-foreground font-semibold tracking-tight">NeuralOps</span>
      </div>

      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          Welcome to NeuralOps
        </h1>
        <p className="mt-3 text-foreground-muted">
          Activate your device and manage your account.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background-subtle"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
