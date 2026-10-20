"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function NewTripButton({ className = "btn btn--fill" }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { data: trip, error } = await supabase
      .from("trips")
      .insert({ slug: `nova-viagem-${crypto.randomUUID().slice(0, 8)}`, title: "Nova viagem" })
      .select("id")
      .single();
    if (error || !trip) {
      setBusy(false);
      setError("Não foi possível criar a viagem.");
      return;
    }
    await supabase.from("sections").insert({ trip_id: trip.id, title: "Dia 1", position: 0 });
    router.push(`/editar/${trip.id}`);
  };

  return (
    <>
      <button type="button" className={className} onClick={create} disabled={busy}>
        {busy ? "Criando…" : "+ Nova viagem"}
      </button>
      {error && (
        <span role="alert" className="form-error">
          {error}
        </span>
      )}
    </>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn--quiet"
      onClick={async () => {
        await createClient().auth.signOut();
        router.refresh();
      }}
    >
      Sair
    </button>
  );
}
