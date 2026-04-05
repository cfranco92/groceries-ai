import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';

describe('signInSchema', () => {
  it('validates correct credentials', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: 'Password1',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = signInSchema.safeParse({
      email: 'not-an-email',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = signInSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = signInSchema.safeParse({
      email: '',
      password: 'password',
    });
    expect(result.success).toBe(false);
  });
});

describe('signUpSchema', () => {
  const valid = {
    email: 'test@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('validates correct registration data', () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts optional display name', () => {
    expect(
      signUpSchema.safeParse({ ...valid, displayName: 'John' }).success,
    ).toBe(true);
  });

  it('accepts empty string display name', () => {
    expect(
      signUpSchema.safeParse({ ...valid, displayName: '' }).success,
    ).toBe(true);
  });

  it('rejects short password (< 8 chars)', () => {
    const r = signUpSchema.safeParse({
      ...valid,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    const r = signUpSchema.safeParse({
      ...valid,
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password without number', () => {
    const r = signUpSchema.safeParse({
      ...valid,
      password: 'Password',
      confirmPassword: 'Password',
    });
    expect(r.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const r = signUpSchema.safeParse({
      ...valid,
      confirmPassword: 'Different1',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0].path).toContain('confirmPassword');
    }
  });

  it('rejects display name shorter than 2 chars', () => {
    const r = signUpSchema.safeParse({ ...valid, displayName: 'X' });
    expect(r.success).toBe(false);
  });
});
