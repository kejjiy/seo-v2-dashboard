import { describe, expect, it } from 'vitest';

import { isPublicRoutePath } from './middleware';

describe('middleware public route matching', () => {
  it('keeps /veto public', () => {
    expect(isPublicRoutePath('/veto')).toBe(true);
    expect(isPublicRoutePath('/veto/extra')).toBe(true);
  });

  it('keeps /api/veto/confirm public', () => {
    expect(isPublicRoutePath('/api/veto/confirm')).toBe(true);
  });

  it('keeps protected routes private', () => {
    expect(isPublicRoutePath('/dashboard')).toBe(false);
  });
});
