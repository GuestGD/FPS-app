export async function loadBinArray(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return new Float32Array(buffer);
}
