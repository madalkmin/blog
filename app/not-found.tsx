import Link from "next/link";

export default function NotFound() {
  return (
    <div className="center">
      <div className="sheet">
        <span className="stamp">Página não encontrada</span>
        <h1>Caminho perdido</h1>
        <p>Essa página não está no mapa. Talvez a viagem tenha mudado de endereço ou ainda seja um rascunho.</p>
        <Link href="/" className="btn btn--fill">
          Voltar para o diário
        </Link>
      </div>
    </div>
  );
}
