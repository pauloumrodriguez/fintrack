import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { PasswordHasher } from '../../application/security/password-hasher.js';

@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  hash(plainText: string): Promise<string> {
    return hash(plainText);
  }
}
