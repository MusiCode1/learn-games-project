export interface KeyboardShortcutHandlers {
  onArrowLeft: () => void;
  onArrowRight: () => void;
  onEscape: () => void;
  onSpace?: () => void;
}

export function setupKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  function handleKeyPress(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        handlers.onArrowLeft();
        break;
      case 'ArrowRight':
        handlers.onArrowRight();
        break;
      case 'Escape':
        handlers.onEscape();
        break;
      case ' ':
        event.preventDefault();
        handlers.onSpace?.();
        break;
    }
  }

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}
