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
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // 시작월도 포함하여 1개월 추가
  months += 1;
  if (months > 12) {
    years += 1;
    months -= 12;
  }

  // 같은 달이면 최소 1개월로 처리
  if (years === 0 && months === 0) {
    return "1개월";
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

/**
 * 인턴 여부를 확인하는 헬퍼 함수
 */
export function isInternPosition(position: string): boolean {
  const lowerPosition = position.toLowerCase();
  return lowerPosition.includes("intern") || position.includes("인턴");
}

/**
 * 경력 목록의 총 경력 기간을 계산 (인턴 제외)
 * @param careers - 경력 목록 (company, position, startDate, endDate 필드 필요)
 * @returns "X년 Y개월" 형식의 문자열, 경력이 없으면 빈 문자열
 */
export function calculateTotalExperience(
  careers: { position: string; startDate: string; endDate?: string }[]
): string {
  if (!careers || careers.length === 0) return "";

  // 인턴 제외
  const regularCareers = careers.filter(
    (career) => !isInternPosition(career.position)
  );

  if (regularCareers.length === 0) return "";

  let totalMonths = 0;

  for (const career of regularCareers) {
    const start = parseYearMonth(career.startDate);
    const end = career.endDate ? parseYearMonth(career.endDate) : new Date();

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // 시작월 포함
    months += 1;

    totalMonths += years * 12 + months;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years > 0 && months > 0) {
    return `${years}년 ${months}개월`;
  } else if (years > 0) {
    return `${years}년`;
  } else {
    return `${months}개월`;
  }
}

/**
 * ISO 날짜 문자열을 한국어 형식으로 변환 (예: 2024년 1월 15일)
 */
export function formatDateKorean(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * ISO 날짜 문자열을 짧은 한국어 형식으로 변환 (예: 2024년 1월 15일)
 */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
