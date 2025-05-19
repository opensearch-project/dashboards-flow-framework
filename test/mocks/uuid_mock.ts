/**
 * Mock implementation for UUID package
 * This avoids the need for crypto.getRandomValues() in tests
 */

export function rng(): Uint8Array {
  const rnds8 = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    rnds8[i] = Math.floor(Math.random() * 256);
  }
  return rnds8;
}

export function v1(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function v4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default {
  v1,
  v4,
  rng,
};
