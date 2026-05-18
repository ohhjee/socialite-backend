export function extractKey(url: string) {
  const parts = url.split(".r2.dev/");
  return parts[1];
}
