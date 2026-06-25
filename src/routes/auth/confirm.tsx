import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/confirm")({
  head: () => ({ meta: [{ title: "Confirming email — NeuralOps" }] }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function handleConfirm() {
      const params = new URLSearchParams(window.location.search)
      const tokenHash = params.get("token_hash")
      const type = params.get("type") as "signup" | "recovery" | null

      if (!tokenHash || !type) {
        setStatus("error")
        setMessage("Invalid confirmation link.")
        return
      }

      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

      if (error) {
        setStatus("error")
        setMessage(error.message)
        return
      }

      setStatus("success")
      setMessage("Email confirmed! Redirecting...")

      setTimeout(() => {
        if (type === "recovery") {
          navigate({ to: "/reset-password" })
        } else {
          navigate({ to: "/activate" })
        }
      }, 2000)
    }

    handleConfirm()
  }, [navigate])

  return (
    <AuthShell
      title={
        status === "loading" ? "Confirming your email…" :
        status === "success" ? "Email confirmed!" :
        "Confirmation failed"
      }
      subtitle={message}
    >
      <div className="flex justify-center py-4">
        {status === "loading" && (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        )}
        {status === "success" && (
          <span className="text-4xl text-primary">✓</span>
        )}
        {status === "error" && (
          <p className="text-sm text-destructive text-center">{message}</p>
        )}
      </div>
    </AuthShell>
  )
}
