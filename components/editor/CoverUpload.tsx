"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload";
import { Icon } from "../Icon";

export function CoverUpload({ tripId, value, onChange }: { tripId: string; value: string | null; onChange: (url: string | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(createClient(), tripId, file));
    } catch (err) {
      console.error(err);
      window.alert("Não foi possível enviar a capa.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`cover-drop ${value ? "has-img" : ""} ${over ? "over" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={value ? "Trocar foto de capa" : "Adicionar foto de capa"}
      onClick={() => !value && input.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !value) {
          e.preventDefault();
          input.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void upload(e.dataTransfer.files[0]);
      }}
    >
      {value ? (
        <>
          <img src={value} alt="Capa da viagem" />
          <div className="cover-actions">
            <button type="button" className="btn btn--quiet" onClick={() => input.current?.click()} disabled={busy}>
              {busy ? "Enviando…" : "Trocar capa"}
            </button>
            <button type="button" className="btn btn--quiet btn--danger" onClick={() => onChange(null)} aria-label="Remover capa" title="Remover capa">
              <Icon name="trash" size={16} />
            </button>
          </div>
        </>
      ) : (
        <span>
          {busy ? "Enviando capa…" : "Arraste uma foto de capa ou clique para escolher"}
        </span>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => void upload(e.target.files?.[0])} />
    </div>
  );
}
