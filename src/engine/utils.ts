export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let id = 0;

export function genId() {
  return id++;
}

export function times(n: number) {
  return Array.from(Array(n).keys());
}
