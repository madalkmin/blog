import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/supabase/server";
import type { Section, Trip } from "@/lib/types";
import { TripEditor } from "@/components/editor/TripEditor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editando", robots: { index: false } };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, isAdmin } = await getViewer();
  if (!user) redirect(`/entrar?next=/editar/${id}`);
  if (!isAdmin) redirect("/");

  const { data: trip } = await supabase.from("trips").select("*").eq("id", id).maybeSingle<Trip>();
  if (!trip) notFound();
  const { data: sections } = await supabase.from("sections").select("*").eq("trip_id", id).order("position");

  return <TripEditor initialTrip={trip} initialSections={(sections ?? []) as Section[]} />;
}
