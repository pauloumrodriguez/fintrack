export abstract class PasswordHasher {
  abstract hash(plainText: string): Promise<string>;
}
