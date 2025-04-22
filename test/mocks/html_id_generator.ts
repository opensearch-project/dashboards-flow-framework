/**
 * Mock implementation of EUI's htmlIdGenerator
 * This avoids the dependency on UUID and crypto.getRandomValues()
 */

export const htmlIdGenerator = (prefix: string = ''): (() => string) => {
  let counter = 0;
  return (): string => {
    counter += 1;
    return `${prefix}${counter}`;
  };
};

export default htmlIdGenerator;
