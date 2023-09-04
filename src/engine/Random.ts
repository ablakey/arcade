export class Random {
  public static range(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public static pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }
}
