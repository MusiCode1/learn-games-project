<script lang="ts">
interface Props {
  word: string;
  direction: 'next' | 'prev' | null;
  lastDirection: 'next' | 'prev';
  hideAfterSeconds: number;
  onclick?: (event: Event) => void;
}

let { word, direction, lastDirection, hideAfterSeconds, onclick }: Props = $props();
let isVisible = $state(true);
let hideTimeout: number;

$effect(() => {
  // Reset visibility when word changes or direction changes
  if (word || direction !== null) {
    isVisible = true;
    
    // Clear existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    // Set new timeout if hideAfterSeconds > 0
    if (hideAfterSeconds > 0) {
      hideTimeout = setTimeout(() => {
        isVisible = false;
      }, hideAfterSeconds * 1000);
    }
  }

  // Return cleanup function
  return () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
  };
});

function handleClick(event: Event) {
  if (!isVisible) {
    isVisible = true;
    
    // Clear existing timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
    }
    
    // Set new timeout if hideAfterSeconds > 0
    if (hideAfterSeconds > 0) {
      hideTimeout = setTimeout(() => {
        isVisible = false;
      }, hideAfterSeconds * 1000);
    }
  }
  
  // קריאה לפונקציה שהועברה כ-prop
  onclick?.(event);
}
</script>

<button
  type="button"
  class="w-[300px] h-[200px] border-2 rounded-2xl shadow-lg bg-white flex items-center justify-center
    hover:-translate-y-1 hover:shadow-xl transition-[var(--transition-all)]
    select-none mx-auto cursor-pointer"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick(e)}
  aria-label="הצג מילה"
>
  <div class="font-['Frank_Ruhl_Libre'] text-[60px] text-center leading-normal relative z-10 text-[var(--color-text-primary)] transition-opacity duration-300 {isVisible ? 'opacity-100' : 'opacity-0'}">
    {word}
  </div>
</button>
