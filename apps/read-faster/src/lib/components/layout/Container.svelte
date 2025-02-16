<script lang="ts">
import type { Snippet } from 'svelte';

interface Props {
  children: Snippet;
}

let { children } = $props();
</script>

<div class="max-w-4xl mx-auto px-[var(--space-6)] py-[var(--space-6)] flex flex-col items-center">
  {@render children()}
</div>
