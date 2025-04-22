/**
 * Mock implementation of EUI's htmlIdGenerator
 * This avoids the dependency on UUID and crypto.getRandomValues()
 */

// Simple counter-based ID generator
export const htmlIdGenerator = (prefix: string = ''): (() => string) => {
  let counter = 0;
  return (): string => {
    counter += 1;
    return `${prefix}${counter}`;
  };
};

// Also export as default
export default htmlIdGenerator;
