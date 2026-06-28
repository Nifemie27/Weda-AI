import { describe, it, expect } from 'vitest';
import { getPaginationParams, buildPaginationMeta } from '@/lib/api-helpers';

describe('getPaginationParams', () => {
  it('returns defaults when no params provided', () => {
    const params = new URLSearchParams();
    const result = getPaginationParams(params);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.sortBy).toBe('createdAt');
    expect(result.sortOrder).toBe('desc');
    expect(result.skip).toBe(0);
  });

  it('calculates correct skip value', () => {
    const params = new URLSearchParams({ page: '3', pageSize: '20' });
    const result = getPaginationParams(params);
    expect(result.skip).toBe(40);
  });

  it('clamps pageSize to max 50', () => {
    const params = new URLSearchParams({ pageSize: '100' });
    const result = getPaginationParams(params);
    expect(result.pageSize).toBe(50);
  });

  it('clamps page to min 1', () => {
    const params = new URLSearchParams({ page: '-5' });
    const result = getPaginationParams(params);
    expect(result.page).toBe(1);
  });
});

describe('buildPaginationMeta', () => {
  it('calculates totalPages correctly', () => {
    const meta = buildPaginationMeta(95, 1, 10);
    expect(meta.totalPages).toBe(10);
    expect(meta.total).toBe(95);
  });

  it('handles zero total', () => {
    const meta = buildPaginationMeta(0, 1, 10);
    expect(meta.totalPages).toBe(0);
  });

  it('handles exact page boundary', () => {
    const meta = buildPaginationMeta(30, 2, 10);
    expect(meta.totalPages).toBe(3);
    expect(meta.page).toBe(2);
  });
});
