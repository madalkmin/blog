// Carimbo de passaporte: anel com "diário · de · viagem" e o monograma "dv" no centro.
// "mini" é a versão para tamanhos pequenos (só o círculo e o monograma);
// "badge" é o selo do cabeçalho (círculo, anel pontilhado e monograma).
export function Logo({
  variant = "full",
  id = "stamp",
  className = "",
  title = "Diário de Viagem",
}: {
  variant?: "full" | "mini" | "badge";
  id?: string;
  className?: string;
  title?: string;
}) {
  const full = variant === "full";
  const mini = variant === "mini";
  return (
    <svg
      viewBox="0 0 200 200"
      className={`logo logo--${variant} ${className}`}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      <g transform="rotate(-8 100 100)">
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth={mini ? 11 : full ? 3 : 7} />
        {full && (
          <>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
            <path id={id} d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" fill="none" />
            <text fontSize="12" fill="currentColor" style={{ fontFamily: "var(--f-mono), monospace" }}>
              <textPath href={`#${id}`} textLength="404" lengthAdjust="spacing">
                DIÁRIO · DE · VIAGEM · ESCRITO NA ESTRADA ·
              </textPath>
            </text>
          </>
        )}
        {!mini && (
          <circle
            cx="100"
            cy="100"
            r={full ? 50 : 72}
            fill="none"
            stroke="var(--stamp-accent, var(--brown))"
            strokeWidth={full ? 1 : 3}
            strokeDasharray={full ? "2 4" : "4 8"}
          />
        )}
        <text
          x="100"
          y={full ? 121 : 127}
          textAnchor="middle"
          fontStyle="italic"
          fontSize={full ? 58 : 88}
          fill="var(--stamp-accent, var(--brown))"
          style={{ fontFamily: "var(--f-serif), Georgia, serif" }}
        >
          dv
        </text>
      </g>
    </svg>
  );
}

// Assinatura do cabeçalho: carimbo de entrada horizontal com selo e nome do diário
export function BrandStamp() {
  return (
    <span className="brand-stamp">
      <Logo variant="badge" className="brand-stamp-mark" title="" />
      <span className="brand-stamp-text">
        <span className="brand-stamp-name">
          Diário <b>/</b> de viagem
        </span>
        <span className="brand-stamp-sub">Escrito na estrada</span>
      </span>
    </span>
  );
}
