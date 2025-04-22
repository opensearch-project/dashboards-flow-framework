/**
 * Mock implementation for UUID package
 * This avoids the need for crypto.getRandomValues() in tests
 */

// Mock implementation for the random number generator
export function rng(): Uint8Array {
  const rnds8 = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    rnds8[i] = Math.floor(Math.random() * 256);
  }
  return rnds8;
}

// Mock v1 UUID generation
export function v1(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Mock v4 UUID generation
export function v4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Export in a way compatible with both ES modules and CommonJS
// Default export for ESM
export default {
  v1,
  v4,
  rng,
};
