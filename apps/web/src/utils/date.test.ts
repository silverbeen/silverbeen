import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  calculateDuration,
  calculateTotalExperience,
  formatDate,
  formatDateTime,
  formatPeriod,
  formatShortDate,
} from './date';

describe('formatDate / formatDateTime', () => {
  it('값이 없으면 "-"', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate(undefined)).toBe('-');
    expect(formatDate('')).toBe('-');
    expect(formatDateTime(null)).toBe('-');
  });

  it('한국어 날짜 형식으로 변환한다', () => {
    const iso = '2024-01-15T12:00:00';
    expect(formatDate(iso)).toContain('2024');
    expect(formatDate(iso)).toContain('15');
    expect(formatShortDate(iso)).not.toContain('2024');
    expect(formatShortDate(iso)).toContain('15');
  });
});

describe('calculateDuration', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('시작월을 포함해 기간을 계산한다', () => {
    expect(calculateDuration('2023.01', '2023.12')).toBe('1년');
    expect(calculateDuration('2023.01', '2024.03')).toBe('1년 3개월');
    expect(calculateDuration('2023.05', '2023.07')).toBe('3개월');
  });

  it('같은 달이면 1개월', () => {
    expect(calculateDuration('2024.03', '2024.03')).toBe('1개월');
  });

  it('종료일이 없으면 현재 날짜 기준', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 5, 15));
    expect(calculateDuration('2024.01')).toBe('6개월');
  });
});

describe('calculateTotalExperience', () => {
  it('인턴 경력은 제외하고 합산한다', () => {
    expect(
      calculateTotalExperience([
        { position: 'Frontend Developer', startDate: '2022.01', endDate: '2022.12' },
        { position: '인턴', startDate: '2021.01', endDate: '2021.06' },
        { position: 'Software Engineer', startDate: '2023.01', endDate: '2023.06' },
      ]),
    ).toBe('1년 6개월');
  });

  it('경력이 없으면 빈 문자열', () => {
    expect(calculateTotalExperience([])).toBe('');
    expect(calculateTotalExperience([{ position: 'Intern', startDate: '2021.01' }])).toBe('');
  });
});

describe('formatPeriod', () => {
  it('종료일이 없으면 재직중', () => {
    expect(formatPeriod('2023.01')).toBe('2023.01 - 재직중');
    expect(formatPeriod('2023.01', '2024.02')).toBe('2023.01 - 2024.02');
  });
});
