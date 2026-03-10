export class TicketIdGenerator {
  private static randomString(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public static generateTicketId(): string {
    // Use timestamp for uniqueness
    const timestamp = Date.now();
    const lastDigits = timestamp.toString().slice(-3);

    const part1 = this.randomString(4);
    const part2 = this.randomString(3);

    return `${part1}-${part2}-${lastDigits}`;
  }
}
