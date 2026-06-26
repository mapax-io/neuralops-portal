import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/activated")({
  head: () => ({ meta: [{ title: "Device activated — NeuralOps" }] }),
  component: ActivatedPage,
});

function ActivatedPage() {
  return (
    <AuthShell title="Device activated">
      <p className="text-center text-sm text-foreground-muted">
        You're signed in. You can close this window and return to the app.
      </p>
    </AuthShell>
  );
}
