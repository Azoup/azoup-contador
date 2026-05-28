import type { VercelRequest, VercelResponse } from '@vercel/node';

const R2_XML_PATTERN = /^https:\/\/pub-[a-z0-9]+\.r2\.dev\/nfe_xmls\//i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const raw = req.query.url;
  const url = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : null;

  if (!url || !R2_XML_PATTERN.test(url)) {
    return res.status(400).json({ error: 'URL de XML inválida' });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).send('Não foi possível obter o XML.');
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    const contentType =
      upstream.headers.get('content-type')?.split(';')[0] || 'application/xml';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(200).send(buffer);
  } catch {
    return res.status(502).json({ error: 'Falha no proxy do XML' });
  }
}
