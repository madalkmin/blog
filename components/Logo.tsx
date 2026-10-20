// Carimbo de passaporte: anel com "diário · de · viagem" e o monograma "dv" no centro.
// "mini" é a versão para tamanhos pequenos (só o círculo e o monograma).
export function Logo({
  variant = "full",
  id = "stamp",
  className = "",
  title = "Diário de Viagem",
}: {
  variant?: "full" | "mini";
  id?: string;
  className?: string;
  title?: string;
}) {
  const mini = variant === "mini";
  return (
    <svg viewBox="0 0 200 200" className={`logo ${mini ? "logo--mini" : "logo--full"} ${className}`} {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}>
      <g transform="rotate(-8 100 100)">
        <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth={mini ? 11 : 3} />
        {!mini && (
          <>
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
            <path id={id} d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" fill="none" />
            <text fontSize="12" fill="currentColor" style={{ fontFamily: "var(--f-mono), monospace" }}>
              <textPath href={`#${id}`} textLength="404" lengthAdjust="spacing">
                DIÁRIO · DE · VIAGEM · ESCRITO NA ESTRADA ·
              </textPath>
            </text>
            <circle cx="100" cy="100" r="50" fill="none" stroke="var(--stamp-accent, var(--brown))" strokeWidth="1" strokeDasharray="2 4" />
          </>
        )}
        <text
          x="100"
          y={mini ? 128 : 121}
          textAnchor="middle"
          fontStyle="italic"
          fontSize={mini ? 96 : 58}
          fill="var(--stamp-accent, var(--brown))"
          style={{ fontFamily: "var(--f-serif), Georgia, serif" }}
        >
          dv
        </text>
      </g>
    </svg>
  );
}
