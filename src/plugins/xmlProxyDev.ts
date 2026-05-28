import type { Plugin } from 'vite';

const R2_XML_PATTERN = /^https:\/\/pub-[a-z0-9]+\.r2\.dev\/nfe_xmls\//i;

export function xmlProxyDevPlugin(): Plugin {
  return {
    name: 'xml-proxy-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/xml-proxy')) {
          next();
          return;
        }

        const parsed = new URL(req.url, 'http://localhost');
        const target = parsed.searchParams.get('url');

        if (!target || !R2_XML_PATTERN.test(target)) {
          res.statusCode = 400;
          res.end('URL de XML inválida');
          return;
        }

        try {
          const upstream = await fetch(target);
          if (!upstream.ok) {
            res.statusCode = upstream.status;
            res.end('Não foi possível obter o XML.');
            return;
          }

          const buffer = Buffer.from(await upstream.arrayBuffer());
          const contentType =
            upstream.headers.get('content-type')?.split(';')[0] || 'application/xml';

          res.setHeader('Content-Type', contentType);
          res.statusCode = 200;
          res.end(buffer);
        } catch {
          res.statusCode = 502;
          res.end('Falha no proxy do XML');
        }
      });
    },
  };
}
