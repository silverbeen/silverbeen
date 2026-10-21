'use client';

import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

/** 클릭과 드래그를 구분하기 위한 최소 이동 거리(px) */
const DRAG_ACTIVATION_DISTANCE = 8;

/**
 * @dnd-kit 정렬 리스트 공통 센서 (포인터 + 키보드)
 */
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}
