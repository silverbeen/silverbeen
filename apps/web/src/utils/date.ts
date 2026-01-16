/**
 * YYYY.MM 형식의 날짜 문자열을 Date 객체로 변환
 */
export function parseYearMonth(dateStr: string): Date {
  const [year, month] = dateStr.split(".").map(Number);
  return new Date(year, month - 1);
}

/**
 * 시작일과 종료일 사이의 기간을 계산하여 "X년 Y개월" 형식으로 반환
 * @param startDate - 시작 날짜 (YYYY.MM 형식)
 * @param endDate - 종료 날짜 (YYYY.MM 형식), 없으면 현재 날짜 사용
 */
export function calculateDuration(
  startDate: string,
  endDate?: string
): string {
  const start = parseYearMonth(startDate);
  const end = endDate ? parseYearMonth(endDate) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth() + 1;

  if (months <= 0) {
    years -= 1;
    months += 12;
  }

  if (months >= 12) {
    years += Math.floor(months / 12);
    months = months % 12;
  }

  if (years > 0 && months > 0) {
    return `${years}년 ${months}개월`;
  } else if (years > 0) {
    return `${years}년`;
  } else {
    return `${months}개월`;
  }
}

/**
 * 시작일과 종료일을 "YYYY.MM - YYYY.MM" 또는 "YYYY.MM - 재직중" 형식으로 반환
 */
export function formatPeriod(startDate: string, endDate?: string): string {
  return endDate ? `${startDate} - ${endDate}` : `${startDate} - 재직중`;
}
