import type { ReactNode } from "react";

type AuthTemplateProps = { children: ReactNode };

export function AuthTemplate({ children }: AuthTemplateProps) {
  return (
    <main className="grid min-h-screen bg-[#f7f8f3] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden overflow-hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between lg:px-[clamp(48px,7vw,112px)]">
        <div className="flex items-center gap-2 font-extrabold tracking-[.12em]">
          <span className="grid size-9 place-items-center rounded-xl rounded-br-md border-2 border-current text-lg tracking-normal">
            S
          </span>
          SIGA
        </div>
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[.14em] text-emerald-300">
            Sistema de gestión de alimentos
          </p>
          <h1 className="font-display text-6xl font-extrabold leading-none tracking-[-.055em]">
            Menos desperdicio.
            <br />
            <em className="text-emerald-300">Más impacto.</em>
          </h1>
          <p className="mt-6 max-w-md leading-7 text-emerald-100/80">
            Gestiona donaciones, inventario y distribución de alimentos con
            trazabilidad y priorización inteligente.
          </p>
        </div>
        <p className="relative z-10 text-xs uppercase tracking-widest text-emerald-200/70">
          Banco de alimentos · UIS
        </p>
        <div className="absolute -bottom-48 -right-56 size-130 rounded-full border border-white/10 shadow-[0_0_0_52px_rgba(255,255,255,.04),0_0_0_104px_rgba(255,255,255,.03)]" />
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </section>
    </main>
  );
}
