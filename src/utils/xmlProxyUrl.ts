/** URLs permitidas no proxy de XML (R2 Confec/PDV + Storage legado). */

const R2_XML =
  /^https:\/\/pub-[a-z0-9]+\.r2\.dev\/nfe_xmls\//i;

const SUPABASE_STORAGE =
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i;

export function isAllowedXmlProxyUrl(url: string): boolean {
  return R2_XML.test(url) || SUPABASE_STORAGE.test(url);
}

export function needsXmlProxy(url: string): boolean {
  return isAllowedXmlProxyUrl(url);
}
