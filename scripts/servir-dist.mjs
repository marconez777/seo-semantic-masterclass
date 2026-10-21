// Serve dist/ com as mesmas regras do Nginx (ops/nginx/regras.conf), para conferir o
// build estático antes de publicar. `vite preview` não serve: ele devolve o index.html
// para qualquer path, que é justamente o comportamento que o build estático elimina.
// Uso: npm run preview:ssg   (depois de npm run build:ssg)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ehSoApp } from "./rotas.mjs";
import { REDIRECTS } from "./redirects.mjs";

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const PORTA = Number(process.env.PORT) || 4173;
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

const ehArquivo = (p) => fs.existsSync(p) && fs.statSync(p).isFile();

function enviar(res, status, arquivo) {
  res.writeHead(status, { "content-type": TIPOS[path.extname(arquivo)] ?? "application/octet-stream" });
  fs.createReadStream(arquivo).pipe(res);
}

http
  .createServer((req, res) => {
    const rota = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const noDisco = path.join(DIST, rota);
    if (!noDisco.startsWith(DIST)) return res.writeHead(400).end();

    // Endereço antigo com página equivalente: antes da regra da barra, para ser um salto só.
    const antigo = REDIRECTS[rota.replace(/\/+$/, "") || "/"];
    if (antigo) return res.writeHead(301, { location: antigo }).end();

    if (rota.length > 1 && rota.endsWith("/")) {
      return res.writeHead(301, { location: rota.replace(/\/+$/, "") }).end();
    }
    if (ehSoApp(rota)) return enviar(res, 200, path.join(DIST, "spa.html"));
    if (ehArquivo(noDisco)) return enviar(res, 200, noDisco);
    if (ehArquivo(path.join(noDisco, "index.html"))) return enviar(res, 200, path.join(noDisco, "index.html"));
    enviar(res, 404, path.join(DIST, "404.html"));
  })
  .listen(PORTA, () => console.log(`dist/ em http://localhost:${PORTA}`));
