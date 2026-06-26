import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/auth.service";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — NeuralOps" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    device_id: (search.device_id as string) ?? null,
  }),
  component: LoginPage,
});

async function activateDevice(deviceId: string, token: string): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/device-verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ device_id: deviceId }),
    }
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Failed to activate device");
  }
}

function LoginPage() {
  const navigate = useNavigate();
  const { device_id } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  // If device_id present, check for existing session and auto-activate
  useEffect(() => {
    if (!device_id) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return; // no session — show login form

      // Already signed in — activate immediately
      setActivating(true);
      try {
        await activateDevice(device_id, session.access_token);
        navigate({ to: "/activated" });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Activation failed");
        setActivating(false);
      }
    });
  }, [device_id, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      const token = data?.session?.access_token;

      if (device_id && token) {
        // Activate device right after login
        setActivating(true);
        await activateDevice(device_id, token);
        navigate({ to: "/activated" });
      } else {
        navigate({ to: "/activate" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setActivating(false);
    }
  }

  if (activating) {
    return (
      <AuthShell title="Activating device…">
        <p className="text-center text-sm text-foreground-muted">
          Please wait while we activate your device.
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        device_id
          ? "Sign in to activate this device."
          : "Sign in to your NeuralOps account."
      }
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-primary font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
