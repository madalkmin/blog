import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  return (
    <div className="center">
      <div className="sheet">
        <span className="stamp">Diário / de viagem</span>
        <h1>Bem-vindo de volta</h1>
        <p>Entre para escrever e editar as viagens.</p>
        <LoginForm next={safeNext} />
        <Link href="/" className="back-link">
          ← Voltar para o diário
        </Link>
      </div>
    </div>
  );
}
