"use client";

import { useEffect } from "react";

// Revela elementos .reveal ao entrar na tela, barra de progresso, sumário ativo e barra superior "colada"
export function ReadingFx() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => io.observe(el));

    const bar = document.querySelector<HTMLElement>(".progress");
    const top = document.querySelector<HTMLElement>(".bar");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc a"));
    const chapters = links.map((a) => document.getElementById(a.hash.slice(1)));

    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar?.style.setProperty("--p", String(max > 0 ? Math.min(1, window.scrollY / max) : 0));
      top?.classList.toggle("is-stuck", window.scrollY > 40);
      let active = -1;
      chapters.forEach((c, i) => {
        if (c && c.getBoundingClientRect().top < window.innerHeight * 0.35) active = i;
      });
      links.forEach((a, i) => a.classList.toggle("active", i === active));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
