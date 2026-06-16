export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function extractSkuPrefix(variants: any[]): string {
  if (!variants || variants.length === 0) return '';
  const firstSku = variants[0]?.sku as string;
  // "FH-TEE-BLACK-M-REGULAR" → remove last three parts (color, size, fit type)
  if (!firstSku) return '';
  const parts = firstSku.split('-');
  return parts.slice(0, -3).join('-');
}