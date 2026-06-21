import fs from "node:fs";
import path from "node:path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Renderiza un documento legal desde su fichero .md en src/content/legal.
// La lectura ocurre en build (las páginas legales son estáticas). Se elimina el
// primer encabezado H1 del .md porque el título lo pinta LegalLayout.
export default function LegalDoc({ slug }: { slug: string }) {
  const file = path.join(process.cwd(), "src", "content", "legal", `${slug}.md`);
  const md = fs.readFileSync(file, "utf8");
  const body = md.replace(/^#\s+.*(?:\r?\n)+/, "");
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>;
}
