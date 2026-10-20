import Link from "next/link";

export default function NotFound() {
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
        <h1>Caminho perdido</h1>
        <p>Essa página não está no mapa. Talvez a viagem tenha mudado de endereço ou ainda seja um rascunho.</p>
        <Link href="/" className="btn btn--solid">
          Voltar para o diário
        </Link>
      </div>
    </div>
  );
}
