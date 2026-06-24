import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activateDevice } from "@/services/auth.service";

export const Route = createFileRoute("/activate")({
  head: () => ({ meta: [{ title: "Activate device — NeuralOps" }] }),
  component: ActivatePage,
});

function ActivatePage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await activateDevice(code);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthShell title="Device activated">
        <p className="text-center text-sm text-foreground-muted">
          Device activated. You can close this page.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Activate your device"
      subtitle="Enter the code shown on your device."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Device code</Label>
          <Input
            id="code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Activating…" : "Activate device"}
        </Button>
      </form>
    </AuthShell>
  );
}
