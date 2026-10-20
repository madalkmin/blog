import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  return (
    <div className="home login">
      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="login-card">
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
