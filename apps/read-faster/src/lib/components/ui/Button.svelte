<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  onclick?: () => void;
  children?: Snippet;
}

let { disabled = false, variant = 'primary', onclick, children } = $props();
</script>

<button
  {disabled}
  class="px-6 py-3 text-base rounded-lg {
    variant === 'primary' 
      ? 'bg-linear-to-r/oklch from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/20'
      : 'bg-linear-to-r/oklch from-secondary to-accent text-white hover:shadow-lg hover:shadow-secondary/20'
  } {
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer transition-[var(--transition-all)] hover:-translate-y-0.5'
  }"
  {onclick}
>
  {@render children()}
</button>
