/**
 * מערכת גרירה מבוססת Pointer Events
 * תומכת בעכבר ומגע
 */

export interface DragState {
  isDragging: boolean;
  cardId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
}

export const INITIAL_DRAG_STATE: DragState = {
  isDragging: false,
  cardId: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  offsetX: 0,
  offsetY: 0,
};

/**
 * מציאת ארגז מתחת לנקודה
 */
export function findBoxUnderPoint(x: number, y: number): string | null {
  const elements = document.elementsFromPoint(x, y);
  for (const el of elements) {
    const boxId = (el as HTMLElement).dataset?.categoryId;
    if (boxId) return boxId;
  }
  return null;
}
