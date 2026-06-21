import type { ReactNode } from "react";
import Link from "next/link";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function LegalLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="text-sm text-agua hover:underline">
            ← Volver al inicio
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-petroleo">{title}</h1>

          <article
            className="
              mt-8 space-y-5 text-slate-700
              [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-petroleo
              [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-petroleo
              [&_p]:leading-relaxed
              [&_a]:text-agua [&_a]:underline [&_a]:underline-offset-2
              [&_strong]:text-petroleo
              [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6
              [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6
              [&_blockquote]:border-l-4 [&_blockquote]:border-agua/40 [&_blockquote]:bg-espuma/60 [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:text-sm [&_blockquote]:text-slate-600
              [&_hr]:my-8 [&_hr]:border-slate-200
              [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
              [&_th]:border [&_th]:border-slate-200 [&_th]:bg-espuma [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-petroleo
              [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_td]:align-top
            "
          >
            {children}
          </article>

          <div className="mt-10 border-t border-slate-100 pt-6">
            <Link href="/" className="text-sm text-agua hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
