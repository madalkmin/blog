"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type State = { dirty: number; saving: number; error: boolean; savedAt: number | null };
type Tracker = {
  markDirty: (key: string) => void;
  track: (key: string, p: Promise<unknown>) => Promise<void>;
};

const Ctx = createContext<{ tracker: Tracker; state: State } | null>(null);

// Agrega o estado de salvamento de todos os campos e capítulos da página
export function SaveProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ dirty: 0, saving: 0, error: false, savedAt: null });
  const dirty = useRef(new Set<string>());
  const saving = useRef(0);

  const tracker = useMemo<Tracker>(() => {
    const sync = (patch: Partial<State> = {}) =>
      setState((s) => ({ ...s, ...patch, dirty: dirty.current.size, saving: saving.current }));
    return {
      markDirty(key) {
        dirty.current.add(key);
        sync();
      },
      async track(key, p) {
        dirty.current.delete(key);
        saving.current++;
        sync();
        try {
          await p;
          saving.current--;
          sync({ error: false, savedAt: Date.now() });
        } catch {
          saving.current--;
          dirty.current.add(key);
          sync({ error: true });
        }
      },
    };
  }, []);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current.size || saving.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);

  return <Ctx.Provider value={{ tracker, state }}>{children}</Ctx.Provider>;
}

function useSave() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("SaveProvider ausente");
  return ctx;
}

// Junta alterações num patch e grava depois de uma pausa na digitação; tenta de novo se falhar
export function useAutosave<T extends Record<string, unknown>>(key: string, save: (patch: Partial<T>) => Promise<void>, delay = 650) {
  const { tracker } = useSave();
  const pending = useRef<Partial<T>>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const saveRef = useRef(save);
  saveRef.current = save;

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const patch = pending.current;
    if (!Object.keys(patch).length) return;
    pending.current = {};
    const run = saveRef.current(patch).catch((err) => {
      pending.current = { ...patch, ...pending.current };
      timer.current = setTimeout(flush, 3000);
      throw err;
    });
    void tracker.track(key, run);
  }, [key, tracker]);

  const queue = useCallback(
    (patch: Partial<T>) => {
      pending.current = { ...pending.current, ...patch };
      tracker.markDirty(key);
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush, key, tracker],
  );

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  return { queue, flush };
}

export function useSaveTracker() {
  return useSave().tracker;
}

export function SaveIndicator() {
  const { state } = useSave();
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  let status: "saving" | "dirty" | "error" | "saved" | "idle" = "idle";
  let label = "Salvamento automático ligado";
  if (state.saving) {
    status = "saving";
    label = "Salvando…";
  } else if (state.error) {
    status = "error";
    label = "Sem conexão — tentando de novo";
  } else if (state.dirty) {
    status = "dirty";
    label = "Editando…";
  } else if (state.savedAt) {
    status = "saved";
    const secs = Math.round((Date.now() - state.savedAt) / 1000);
    label = secs < 20 ? "Tudo salvo" : `Salvo há ${secs < 60 ? `${secs}s` : `${Math.round(secs / 60)} min`}`;
  }

  return (
    <span className="save" data-state={status} role="status" aria-live="polite" key={status === "saved" ? state.savedAt : status}>
      <i />
      {label}
    </span>
  );
}
